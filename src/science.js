// Pure functions shared by browser worker and Node tests.
export const VERSION = '0.2.0';
export const RADII = { C: 1.70, N: 1.55, O: 1.52, S: 1.80, P: 1.80, SE: 1.90 };
export const DEFAULTS = { probe: 1.4, points: 256, cutoff: 4.0, exposure: 5.0, overlap: 0.8 };
export const residueKey = a => `${a.chain}:${a.resi}${a.icode}`;
export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

export function validateConfig(config) {
  const c = { ...DEFAULTS, ...config };
  if (!['probe','cutoff','exposure','overlap','points'].every(k => Number.isFinite(c[k])) ||
      ![128,256,960].includes(c.points) || c.probe < .5 || c.probe > 3 ||
      c.cutoff < 2 || c.cutoff > 8 || c.exposure < 0 || c.exposure > 100 ||
      c.overlap !== DEFAULTS.overlap) throw Error('Analysis settings are outside the supported range. VDW overlap is fixed at 0.8 Å.');
  if (typeof c.target !== 'string' || typeof c.partner !== 'string' || !c.target || !c.partner)
    throw Error('Both selected chains must contain protein ATOM records.');
  if (c.target === c.partner) throw Error('Choose two different protein chains.');
  return c;
}

export function parsePDB(text) {
  if (typeof text !== 'string' || text.length > 15_000_000) throw Error('Use a PDB text file smaller than 15 MB.');
  const candidates = new Map();
  let modelCount = 0, skipped = 0, alternatives = 0, zeroOccupancy = 0, invalid = 0;
  let resolution = null;
  const title = [];
  for (const line of text.split(/\r?\n/)) {
    const record = line.slice(0, 6).trim();
    if (record === 'TITLE') title.push(line.slice(10, 80).trim());
    if (line.startsWith('REMARK   2 RESOLUTION.')) {
      const value = parseFloat(line.slice(23));
      if (Number.isFinite(value)) resolution = value;
    }
    if (record === 'MODEL') { modelCount++; if (modelCount > 1) break; }
    if (record === 'ENDMDL') break;
    if (!['ATOM', 'HETATM'].includes(record)) continue;
    const resn = line.slice(17, 20).trim();
    if (['HOH', 'WAT', 'DOD'].includes(resn)) { skipped++; continue; }
    const name = line.slice(12, 16).trim();
    const element = line.slice(76, 78).trim().toUpperCase() || name.replace(/^[0-9]/, '').slice(0, 1).toUpperCase();
    if (['H', 'D'].includes(element)) { skipped++; continue; }
    const occupancy = line.slice(54, 60).trim() ? Number(line.slice(54, 60)) : 1;
    if (!Number.isFinite(occupancy) || !(occupancy > 0)) { zeroOccupancy++; continue; }
    if (![line.slice(30,38),line.slice(38,46),line.slice(46,54)].every(v => v.trim() && Number.isFinite(Number(v))) ||
        !/^-?\d+$/.test(line.slice(22,26).trim())) { invalid++; continue; }
    const atom = {
      serial: parseInt(line.slice(6, 11)), name, resn,
      chain: line.slice(21, 22).trim() || '_',
      resi: parseInt(line.slice(22, 26)), icode: line.slice(26, 27).trim(),
      x: Number(line.slice(30, 38)), y: Number(line.slice(38, 46)), z: Number(line.slice(46, 54)),
      b: Number(line.slice(60, 66)) || 0, occupancy, alt: line.slice(16, 17).trim(),
      element, hetero: record === 'HETATM', radius: RADII[element] || 1.7, line
    };
    if (![atom.x, atom.y, atom.z, atom.resi].every(Number.isFinite) || line.length < 54) { invalid++; continue; }
    const key = `${record}:${residueKey(atom)}:${resn}:${name}`;
    const previous = candidates.get(key);
    if (previous) alternatives++;
    if (!previous || atom.occupancy > previous.occupancy ||
      (atom.occupancy === previous.occupancy && atom.alt.localeCompare(previous.alt) < 0)) candidates.set(key, atom);
  }
  const atoms = [...candidates.values()];
  const protein = atoms.filter(a => !a.hetero);
  if (!protein.length) throw Error('No usable protein ATOM records found. Supply a fixed-width .pdb file, not mmCIF.');
  if (protein.length > 18000) throw Error('This browser prototype supports up to 18,000 protein heavy atoms. Export a smaller assembly.');
  const chains = [...new Set(protein.map(a => a.chain))].map(id => {
    const aa = protein.filter(a => a.chain === id);
    return { id, atoms: aa.length, residues: new Set(aa.map(residueKey)).size };
  });
  const warnings = [
    'Only model 1 is used. Coordinates are not relaxed; missing residues and atoms are not rebuilt.',
    'Analysis uses ATOM heavy atoms in the two selected chains only. Ligands, waters, ions, other chains and crystal neighbors do not occlude the calculated surface.',
    'Deposited coordinates are used directly; biological assemblies and symmetry mates are not generated.'
  ];
  if (alternatives) warnings.push(`${alternatives} alternate/duplicate atom records collapsed by highest occupancy (ties: blank then alphabetical). Selection is per atom, not a coherent conformer.`);
  if (zeroOccupancy) warnings.push(`${zeroOccupancy} zero/invalid-occupancy atoms excluded.`);
  if (invalid) warnings.push(`${invalid} malformed coordinate records excluded.`);
  if (protein.some(a => !RADII[a.element])) warnings.push('Unrecognized elements assigned radius 1.70 Å; inspect input chemistry.');
  if (protein.some(a => a.occupancy < 1)) warnings.push('Partial-occupancy atoms are treated as fully present geometry.');
  return { atoms, chains, title: title.join(' '), resolution, warnings, alternatives, skipped,
    cleanPDB: atoms.map(a => a.line.slice(0, 16) + ' ' + a.line.slice(17)).join('\n') + '\nEND\n' };
}

export function spherePoints(n) {
  return Array.from({ length: n }, (_, i) => {
    const y = 1 - 2 * (i + 0.5) / n, r = Math.sqrt(1 - y * y), phi = i * Math.PI * (3 - Math.sqrt(5));
    return [Math.cos(phi) * r, y, Math.sin(phi) * r];
  });
}

// Spatial hash avoids comparing every surface point with every atom.
export function sasa(atoms, probe = 1.4, n = 256) {
  if (!atoms.length) return [];
  const mesh = spherePoints(n);
  const radii = atoms.map(a => (a.radius ?? RADII[a.element] ?? 1.7) + probe);
  const size = 2 * Math.max(...radii);
  const grid = new Map(), cell = a => [Math.floor(a.x / size), Math.floor(a.y / size), Math.floor(a.z / size)];
  atoms.forEach((a, i) => { const key = cell(a).join(','); if (!grid.has(key)) grid.set(key, []); grid.get(key).push(i); });
  return atoms.map((a, i) => {
    const [cx, cy, cz] = cell(a), neighbors = [];
    for (let x = cx - 1; x <= cx + 1; x++) for (let y = cy - 1; y <= cy + 1; y++) for (let z = cz - 1; z <= cz + 1; z++) {
      for (const j of grid.get(`${x},${y},${z}`) || []) {
        if (i !== j && distance(a, atoms[j]) < radii[i] + radii[j]) neighbors.push(j);
      }
    }
    let exposed = 0;
    point: for (const p of mesh) {
      const x = a.x + radii[i] * p[0], y = a.y + radii[i] * p[1], z = a.z + radii[i] * p[2];
      for (const j of neighbors) {
        const b = atoms[j];
        if ((x-b.x)**2 + (y-b.y)**2 + (z-b.z)**2 < radii[j]**2) continue point;
      }
      exposed++;
    }
    return 4 * Math.PI * radii[i]**2 * exposed / n;
  });
}

export function analyze(parsed, config) {
  const c = validateConfig(config);
  const target = parsed.atoms.filter(a => !a.hetero && a.chain === c.target);
  const partner = parsed.atoms.filter(a => !a.hetero && a.chain === c.partner);
  if (!target.length || !partner.length) throw Error('Both selected chains must contain protein ATOM records.');
  const complex = [...target, ...partner];
  const bound = sasa(complex, c.probe, c.points);
  const freeT = sasa(target, c.probe, c.points), freeP = sasa(partner, c.probe, c.points);
  const sum = xs => xs.reduce((a,b) => a+b, 0);
  const burial = sum(freeT) + sum(freeP) - sum(bound);
  const pairMap = new Map();
  let clashes = 0, atomContacts = 0, closest = Infinity;
  const cuts = [...new Set([3,3.5,4,4.5,5,5.5,6,c.cutoff])].sort((a,b) => a-b);
  const maxCut = Math.max(...cuts);
  for (const a of target) for (const b of partner) {
    const d = distance(a,b);
    if (d < closest) closest = d;
    if (d < a.radius + b.radius - c.overlap) clashes++;
    if (d <= c.cutoff) atomContacts++;
    if (d <= maxCut) {
      const key = residueKey(a) + '|' + residueKey(b);
      const prev = pairMap.get(key);
      if (!prev || prev.distance > d) pairMap.set(key, { target: `${a.resn} ${residueKey(a)}`, partner: `${b.resn} ${residueKey(b)}`, distance: d, atoms: `${a.name} · ${b.name}` });
    }
  }
  const contacts = [...pairMap.values()].filter(p => p.distance <= c.cutoff).sort((a,b) => a.distance-b.distance);
  const lysMap = new Map();
  target.forEach((a,i) => {
    if (a.resn !== 'LYS') return;
    const key = residueKey(a);
    if (!lysMap.has(key)) lysMap.set(key, { key, resi: a.resi, icode: a.icode, chain: a.chain, sasa: 0, freeSasa: 0, nzSasa: null, nzDistance: null, nzB: null, atoms: 0 });
    const lys = lysMap.get(key);
    lys.sasa += bound[i]; lys.freeSasa += freeT[i]; lys.atoms++;
    if (a.name === 'NZ') {
      lys.nzSasa = bound[i]; lys.nzB = a.b;
      lys.nzDistance = Math.min(...partner.map(b => distance(a,b)));
    }
  });
  const lysines = [...lysMap.values()].map(a => ({ ...a, exposed: a.nzSasa !== null && a.nzSasa >= c.exposure,
    status: a.nzSasa === null ? 'Missing NZ' : a.nzSasa >= c.exposure ? 'Exposed NZ' : 'Below threshold' })).sort((a,b) => (b.nzSasa ?? -1) - (a.nzSasa ?? -1));
  const warnings = [...parsed.warnings];
  if (lysines.some(a => a.nzSasa === null)) warnings.push('One or more lysines lack NZ. These residues cannot be classified by terminal-amine exposure.');
  if (lysines.some(a => a.atoms < 9)) warnings.push('Some lysine heavy-atom records are incomplete; reported SASA may be biased upward.');
  if (closest > 8) warnings.push('Selected chains are separated by more than 8 Å. Confirm the intended ternary-complex copy and chain assignment.');
  return { version: VERSION, config: c, counts: { targetAtoms: target.length, partnerAtoms: partner.length, targetResidues: new Set(target.map(residueKey)).size, partnerResidues: new Set(partner.map(residueKey)).size },
    interfaceArea: burial / 2, totalBurial: burial, targetBurial: sum(freeT) - sum(bound.slice(0,target.length)),
    closest, clashes, atomContacts, contacts, lysines, accessible: lysines.filter(a => a.exposed).length,
    missingNZ: lysines.filter(a => a.nzSasa === null).length,
    sensitivity: cuts.map(cutoff => ({ cutoff, pairs: [...pairMap.values()].filter(p => p.distance <= cutoff).length })),
    warnings, resolution: parsed.resolution };
}
