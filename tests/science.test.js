import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parsePDB, sasa, analyze, spherePoints, validateConfig } from '../src/science.js';
import { equilibrium, simulate, mechanism, KDEFAULTS } from '../src/kinetics.js';

const atom=(x,y=0,z=0)=>({x,y,z,element:'C',radius:1.7});
const approx=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<tol,`${a} differs from ${b} by ${Math.abs(a-b)}`);
const pdb=readFileSync(new URL('../public/data/5T35.pdb',import.meta.url),'utf8');
const parsed=parsePDB(pdb);

test('Fibonacci points lie on the unit sphere',()=>{
  assert.equal(spherePoints(256).length,256);
  spherePoints(256).forEach(p=>approx(Math.hypot(...p),1));
});
test('isolated atom SASA matches analytic sphere area exactly',()=>{
  approx(sasa([atom(0)],1.4,256)[0],4*Math.PI*3.1**2);
});
test('distant atoms retain isolated SASA',()=>{
  sasa([atom(0),atom(50)],1.4,256).forEach(a=>approx(a,4*Math.PI*3.1**2));
});
test('overlapping equal spheres reproduce analytic exposed caps within sampling tolerance',()=>{
  const radius=3.1,d=3,expected=4*Math.PI*radius**2-2*Math.PI*radius*(radius-d/2);
  sasa([atom(0),atom(d)],1.4,960).forEach(a=>approx(a,expected,.7));
});
test('SASA is translation invariant',()=>{
  const a=[atom(0),atom(3),atom(0,2,1)];
  const b=a.map(a=>({...a,x:a.x+50,y:a.y-300,z:a.z+0.1}));
  sasa(a).forEach((x,i)=>approx(x,sasa(b)[i]));
});
test('5T35 chain identities and resolution are parsed',()=>{
  assert.deepEqual(parsed.chains.map(x=>x.id),['A','B','C','D','E','F','G','H']);
  assert.equal(parsed.resolution,2.7);
  assert.ok(parsed.atoms.some(x=>x.hetero&&x.resn==='759'));
  assert.ok(!parsed.atoms.some(x=>x.resn==='HOH'||x.element==='H'));
});
test('invalid PDB inputs fail clearly',()=>{
  assert.throws(()=>parsePDB('not a PDB file'),/No usable protein/);
});
test('blank coordinates and malformed residue IDs cannot become valid atoms',()=>{
  const line=pdb.split('\n').find(x=>x.startsWith('ATOM  '));
  for(const bad of [
    line.slice(0,30)+'        '+line.slice(38),
    line.slice(0,22)+' 1x '+line.slice(26),
    line.slice(0,54)+'   Inf'+line.slice(60)
  ])assert.throws(()=>parsePDB(bad),/No usable/);
});
test('all structural numeric inputs are finite and fixed overlap cannot be overridden',()=>{
  const config={target:'A',partner:'D'};
  for(const key of ['probe','cutoff','exposure','overlap','points'])
    for(const value of [NaN,Infinity,-Infinity,null,'4'])
      assert.throws(()=>validateConfig({...config,[key]:value}),/supported range/);
  for(const bad of [{probe:0},{cutoff:20},{exposure:-1},{overlap:5}])
    assert.throws(()=>validateConfig({...config,...bad}),/supported range/);
  assert.equal(validateConfig(config).overlap,.8);
});
test('alternate locations choose highest occupancy and normalize the render input',()=>{
  const line=pdb.split('\n').find(x=>x.startsWith('ATOM  '));
  const a=line.slice(0,16)+'A'+line.slice(17,54)+'  0.40'+line.slice(60);
  const b=line.slice(0,16)+'B'+line.slice(17,54)+'  0.60'+line.slice(60);
  const p=parsePDB(a+'\n'+b);
  assert.equal(p.atoms.length,1);assert.equal(p.atoms[0].alt,'B');assert.equal(p.alternatives,1);assert.equal(p.cleanPDB[16],' ');
});
test('first model only and zero occupancy excluded',()=>{
  const line=pdb.split('\n').find(x=>x.startsWith('ATOM  '));
  assert.equal(parsePDB('MODEL        1\n'+line+'\nENDMDL\nMODEL        2\n'+line).atoms.length,1);
  assert.throws(()=>parsePDB(line.slice(0,54)+'  0.00'+line.slice(60)),/No usable/);
});
test('real structural audit is finite, monotone in cutoff and bounded',()=>{
  const r=analyze(parsed,{target:'A',partner:'D',points:128});
  assert.ok(r.interfaceArea>0&&r.interfaceArea<3000);
  assert.ok(r.lysines.length>0);
  assert.ok(r.accessible<=r.lysines.length);
  r.sensitivity.forEach((s,i)=>{if(i)assert.ok(s.pairs>=r.sensitivity[i-1].pairs);});
  assert.ok(r.contacts.every(c=>c.distance<=4));
  r.lysines.forEach(l=>assert.ok(l.freeSasa+1e-8>=l.sasa));
  assert.ok(r.warnings.length>=3);
  console.log('5T35 / A-D / 128-point receipt:',JSON.stringify({interfaceArea:r.interfaceArea,lysines:r.lysines.length,exposed:r.accessible,contactPairs:r.contacts.length,overlaps:r.clashes}));
});
test('identical and nonexistent chains are rejected',()=>{
  assert.throws(()=>analyze(parsed,{target:'A',partner:'A'}),/different/);
  assert.throws(()=>analyze(parsed,{target:'A',partner:'Z'}),/Both selected/);
});
test('equilibrium conserves both protein pools and satisfies mass action',()=>{
  for(const T of [.01,1,100,10000])for(const E of [.01,30,3000])for(const d of [.01,10,100000])for(const alpha of [.01,5,100]){
    const q=equilibrium(T,E,d,100,30,alpha);
    approx(q.freeTarget*(1+d/100)+q.ternary,T,1e-7);
    approx(q.freeE3*(1+d/30)+q.ternary,E,1e-7);
    approx(alpha*q.freeTarget*q.freeE3*d/(100*30),q.ternary,1e-6);
    assert.ok(q.ternary>=0&&q.ternary<=Math.min(T,E)+1e-7);
  }
});
test('no drug, no E3 or no productive clearance preserves target baseline',()=>{
  [simulate(KDEFAULTS,0),simulate({...KDEFAULTS,e3:0}),simulate({...KDEFAULTS,kpr:0})].forEach(x=>approx(x.remaining,100,1e-7));
});
test('zero cooperativity produces no ternary complex',()=>{
  assert.equal(equilibrium(100,30,100,100,100,0).ternary,0);
});
test('high-dose hook emerges from binary competition',()=>{
  const mid=equilibrium(100,30,100,100,100,5).ternary;
  assert.ok(equilibrium(100,30,1e8,100,100,5).ternary<mid/100);
});
test('washout recovery follows the analytic first-order solution',()=>{
  const p={...KDEFAULTS,wash:7.33};
  const atWash=simulate({...p,hours:p.wash}).remaining;
  const expected=100-(100-atWash)*Math.exp(-Math.LN2/p.half*(p.hours-p.wash));
  approx(simulate(p,p.dose,true).remaining,expected,1e-5);
});
test('shorter half-life replenishes target more quickly at equal baseline pool',()=>{
  assert.ok(simulate({...KDEFAULTS,half:1}).loss<simulate({...KDEFAULTS,half:24}).loss);
});
test('lower E3 abundance reduces degradation in the specified toy system',()=>{
  assert.ok(simulate({...KDEFAULTS,e3:3}).loss<simulate(KDEFAULTS).loss);
});
test('longer exposure approaches a bounded steady-state',()=>{
  const p={...KDEFAULTS,hours:72},r=simulate(p),T=r.remaining/100*p.target;
  const derivative=Math.LN2/p.half*(p.target-T)-p.kpr*equilibrium(T,p.e3,p.dose,p.kt,p.ke,p.alpha).ternary;
  assert.ok(Math.abs(derivative)<.001);
  assert.ok(r.series.every(x=>x.remaining>=0&&x.remaining<=100.00001));
});
test('independent competing clocks do not silently alter degradation',()=>{
  approx(simulate({...KDEFAULTS,off:100,commit:.1}).loss,simulate(KDEFAULTS).loss);
  const m=mechanism(KDEFAULTS);
  assert.equal(m.heatmap.length,140);assert.equal(m.doseCurve.length,50);
  approx(m.commitment,2/3);
});
test('dose sampling includes the selected dose and analytic equilibrium peak',()=>{
  const p={...KDEFAULTS,kt:20,ke:500,dose:173.2};
  const m=mechanism(p), doses=m.doseCurve.map(r=>r.dose);
  assert.equal(doses.length,51);
  assert.ok(doses.includes(p.dose));assert.ok(doses.includes(100));
  approx(m.best.dose,100);assert.ok(m.best.degradation>=m.continuous.loss);
  for(let i=1;i<doses.length;i++)assert.ok(doses[i]>doses[i-1]);
});
test('zero processing and zero E3 give zero loss including pulse extremes',()=>{
  for(const p of [{...KDEFAULTS,kpr:0},{...KDEFAULTS,e3:0}]){
    approx(simulate(p).remaining,100);
    for(const wash of [0,p.hours])approx(simulate({...p,wash},p.dose,true).remaining,100);
  }
});
