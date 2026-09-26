import './style.css';
import { createIcons, Activity, ArrowRight, ArrowUpRight, BookOpen, BookmarkPlus, Box, Braces, Calculator, Camera, ChartNoAxesCombined, Check, Columns2, Crosshair, Download, FileText, Fingerprint, FlaskConical, FolderOpen, Info, Layers2, LoaderCircle, Maximize, Minus, Network, Play, RotateCcw, Scan, ScanLine, ShieldCheck, Sun, Table2, Timer, TriangleAlert, Upload, X } from 'lucide';
import Chart from 'chart.js/auto';
import { parsePDB, DEFAULTS, VERSION, validateConfig } from './science.js';
import AnalysisWorker from './worker.js?worker&inline';
import { KDEFAULTS, mechanism } from './kinetics.js';
import { renderLibrary, renderEvidence, setEvidenceQuery, libraryContext } from './library.js';

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = (x,n=1) => x===null || x===undefined ? 'N/A' : Number(x).toLocaleString('en-US',{maximumFractionDigits:n,minimumFractionDigits:n});
const icon = name => `<i data-lucide="${name}"></i>`;
const icons = { Activity, ArrowRight, ArrowUpRight, BookOpen, BookmarkPlus, Box, Braces, Calculator, Camera, ChartNoAxesCombined, Check, Columns2, Crosshair, Download, FileText, Fingerprint, FlaskConical, FolderOpen, Info, Layers2, LoaderCircle, Maximize, Minus, Network, Play, RotateCcw, Scan, ScanLine, ShieldCheck, Sun, Table2, Timer, TriangleAlert, Upload, X };
const logo = `<svg viewBox="0 0 36 36" aria-label="Ternary Check" fill="none"><path d="M18 4 31 26H5L18 4Z" stroke="currentColor" stroke-width="1.7"/><circle cx="18" cy="4" r="3.5" fill="currentColor"/><circle cx="31" cy="26" r="3.5" fill="currentColor"/><circle cx="5" cy="26" r="3.5" fill="currentColor"/><circle cx="18" cy="18" r="3" fill="currentColor"/></svg>`;
const citations = {
  article:'https://www.linkedin.com/pulse/from-degradation-curves-degradability-landscapes-making-damko-qwkue',
  structure:'https://www.rcsb.org/structure/5T35',
  gadd:'https://pmc.ncbi.nlm.nih.gov/articles/PMC5392356/',
  bai:'https://www.jbc.org/article/S0021-9258(22)00093-X/fulltext',
  wurz:'https://www.nature.com/articles/s41467-023-39904-5',
  du:'https://ideas.repec.org/a/nat/natcom/v17y2026i1d10.1038_s41467-026-75591-8.html',
  sasa:'https://biopython.org/docs/latest/api/Bio.PDB.SASA.html'
};
let state = { page:'structure', text:'', parsed:null, source:'5T35', hash:'', result:null, config:{...DEFAULTS,target:'A',partner:'D'}, runs:[], k:{...KDEFAULTS}, km:null, theme:'dark', tab:'lysines', filter:'all', selected:null, representation:'cartoon', showLys:true, showLigand:true };
let viewer=null, worker=null, charts=[], busy=false, generation=0, fetchGeneration=0, workerTimer=null, analysisError='';

$('#app').innerHTML = `
<header class="topbar"><a class="brand" href="#" aria-label="Ternary Check home">${logo}<span>Ternary<span class="brand-light">Check</span><small>DATA-RICH, INSIGHT-POOR</small></span></a>
<nav aria-label="Main navigation"><button data-page="structure" class="active">${icon('box')}<span>Structure audit</span></button><button data-page="mechanism">${icon('activity')}<span>Mechanism lab</span></button><button data-page="library">${icon('layers-2')}<span>Examples</span></button><button data-page="evidence">${icon('network')}<span>E3 evidence</span></button><button data-page="compare">${icon('columns-2')}<span>Compare <b id="run-count">0</b></span></button><button data-page="methods">${icon('book-open')}<span>Methods</span></button></nav>
<div class="header-actions"><span class="local-status"><span></span> Local computation</span><button class="icon-button" id="theme" title="Toggle light or dark theme" aria-label="Toggle light or dark theme">${icon('sun')}</button><button id="export" class="button small">${icon('download')}<span>Export</span></button></div></header>
<main id="main"></main><div id="toast" role="status" aria-live="polite"></div>
<dialog id="export-dialog"><div class="dialog-head"><h2>Take the evidence with you.</h2><button class="icon-button" id="close-dialog" aria-label="Close export dialog">${icon('x')}</button></div><p>Portable results, explicit settings, and limitations. Nothing is uploaded.</p><div class="export-options"><button data-export="md">${icon('file-text')}<span><strong>Research dossier</strong><small>Markdown · results, assumptions & references</small></span></button><button data-export="csv">${icon('table-2')}<span><strong>Lysine map</strong><small>CSV · one row per observed target lysine</small></span></button><button data-export="json">${icon('braces')}<span><strong>Reproducible session</strong><small>JSON · includes coordinates and model inputs</small></span></button><button data-export="kinetics">${icon('chart-no-axes-combined')}<span><strong>Mechanism curves</strong><small>CSV · dose response and pulse recovery</small></span></button><button data-export="png">${icon('camera')}<span><strong>Molecular snapshot</strong><small>PNG · current structure view</small></span></button></div><p class="fine">The session file contains your structure coordinates. Review before sharing externally.</p></dialog>
<input id="file-input" type="file" accept=".pdb,.ent" hidden><input id="session-input" type="file" accept=".json" hidden>`;

function refreshIcons(){createIcons({icons,attrs:{'stroke-width':1.6}});}
function toast(s,error=false){const el=$('#toast'); el.textContent=s;el.className=`visible ${error?'error':''}`;clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.className='',5000);}
function setPage(p){ state.page=p;$$('nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===p)); render(); }
$$('[data-page]').forEach(b=>b.onclick=()=>setPage(b.dataset.page));
$('.brand').onclick=e=>{e.preventDefault();setPage('structure');};
$('#theme').onclick=()=>{state.theme=state.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=state.theme;render();};
$('#export').onclick=()=>$('#export-dialog').showModal();
$('#close-dialog').onclick=()=>$('#export-dialog').close();
$('#export-dialog').onclick=e=>{if(e.target===$('#export-dialog'))$('#export-dialog').close();};

function heading(eyebrow,title,sub,actions=''){
 return `<div class="page-head"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${sub}</p></div><div class="page-actions">${actions}</div></div>`;
}
function field(label,id,value,min,max,step,unit=''){
 return `<label class="field">${label}<div class="input-unit"><input id="${id}" type="number" min="${min}" max="${max}" step="${step}" value="${value}"><span>${unit}</span></div></label>`;
}
function render(){
 charts.forEach(c=>c.destroy());charts=[];
 viewer=null;
 if(state.page==='structure')renderStructure();
 if(state.page==='mechanism')renderMechanism();
 if(state.page==='compare')renderCompare();
 if(state.page==='methods')renderMethods();
 if(state.page==='library')renderLibrary({heading,navigate:p=>{setPage(p);if(p==='structure')$('#example').click();},e3:q=>{setEvidenceQuery(q);setPage('evidence');}});
 if(state.page==='evidence')renderEvidence({heading});
 refreshIcons();
}

function renderStructure(){
 const r=state.result;
 $('#main').innerHTML=heading('TARGETED PROTEIN DEGRADATION / WORKBENCH 0.2','Structure before score.','Inspect the complex. Test the assumptions. Know what the structure cannot tell you.',`<button class="button" id="import-session">${icon('folder-open')} Open session</button><button class="button primary" id="save-run" ${!r||busy?'disabled':''}>${icon('bookmark-plus')} Save run</button>`) + `
 <div class="workspace"><aside class="panel input-panel"><div class="panel-title"><h2>Structure & parameters</h2><span class="step">01</span></div>
 <div class="side-section"><label class="field" for="pdb-id">Load from RCSB PDB</label><form id="pdb-form" class="fetch-row"><input id="pdb-id" placeholder="e.g. 5T35" maxlength="4" value="${/^[a-z0-9]{4}$/i.test(state.source)?esc(state.source):''}" aria-label="PDB ID"><button type="submit" class="icon-button filled" aria-label="Fetch PDB structure">${icon('arrow-right')}</button></form>
 <button class="drop-zone" id="upload">${icon('upload')}<span>Drop a .pdb file here<small>or browse from your device</small></span></button>
 <button class="text-button" id="example">${icon('flask-conical')} Load BRD4 · MZ1 · VHL example</button><p class="fine">Local files stay in this tab. Fetching a PDB ID contacts RCSB. No server-side analysis.</p></div>
 <div class="side-section"><div class="section-label">DEFINE THE PAIR <span>Protein chains</span></div>
 <label class="field">Target chain<select id="target">${chainOptions(state.config.target)}</select></label><label class="field">E3 / partner chain<select id="partner">${chainOptions(state.config.partner)}</select></label><div class="pair-note"><span class="dot mint"></span>Target<span class="dot sand"></span>Partner<span class="dot white"></span>Ligand</div><p class="fine">Verify chain identity. A chain selection is not an automatic ligase assignment.</p></div>
 <div class="side-section"><div class="section-label">MEASUREMENT RULES</div>
 <label class="field">Contact cutoff <span class="label-value" id="cutoff-label">${fmt(state.config.cutoff)} Å</span><input type="range" id="cutoff" min="3" max="6" step=".1" value="${state.config.cutoff}"></label>
 <div class="field-grid">${field('Probe radius','probe',state.config.probe,.5,3,.1,'Å')}${field('NZ exposure ≥','exposure',state.config.exposure,0,100,1,'Å²')}</div>
 <label class="field">Surface sampling<select id="points"><option value="128" ${state.config.points===128?'selected':''}>128 points · quick</option><option value="256" ${state.config.points===256?'selected':''}>256 points · standard</option><option value="960" ${state.config.points===960?'selected':''}>960 points · refined</option></select></label>
 <button class="button primary wide" id="analyze" ${!state.parsed||busy?'disabled':''}>${icon(busy?'loader-circle':'scan-line')}${busy?'Calculating…':'Run structure audit'}</button>
 <p id="analysis-status" class="fine" role="status">${busy?'Calculating surfaces in a background worker.':esc(analysisError||'Changing settings requires a new audit.')}</p></div>
 <div class="sidebar-footer">${icon('shield-check')} Geometry, not efficacy prediction.</div></aside>
 <section class="structure-main"><div class="panel molecular-panel"><div class="viewer-head"><div><span class="file-tag">${esc(state.source)}</span><strong>${state.source==='5T35'?'BRD4 BD2 / MZ1 / VHL':'Selected protein pair'}</strong><small id="view-meta">${r?`${r.counts.targetResidues} + ${r.counts.partnerResidues} residues · ${state.parsed?.resolution?state.parsed.resolution+' Å structure':'resolution not reported'}`:'Load a structure to begin'}</small></div><span class="badge">${busy?'Computing':r?'Coordinates loaded':'Awaiting structure'}</span></div>
 <div id="viewer"><div class="viewer-placeholder">Preparing molecular view…</div></div>
 <div class="viewer-overlay"><span class="coordinate-label">TARGET <b>${esc(state.config.target)}</b> <i></i> PARTNER <b>${esc(state.config.partner)}</b></span><span class="viewer-hint">Drag to rotate · scroll to zoom</span></div>
 <div class="viewer-toolbar"><div class="segmented"><button id="cartoon" class="${state.representation==='cartoon'?'selected':''}">Cartoon</button><button id="sticks" class="${state.representation==='sticks'?'selected':''}">Sticks</button></div><label class="toggle"><input id="show-lys" type="checkbox" ${state.showLys?'checked':''}> Lysines</label><label class="toggle"><input id="show-ligand" type="checkbox" ${state.showLigand?'checked':''}> Ligand</label><button id="reset-view" class="icon-button" title="Reset view" aria-label="Reset molecular view">${icon('maximize')}</button><button id="snapshot" class="icon-button" title="Download snapshot" aria-label="Download molecular snapshot">${icon('camera')}</button></div></div>
 <div id="metrics">${metrics(r)}</div>
 <div class="panel result-panel"><div class="result-tabs"><button data-tab="lysines" class="${state.tab==='lysines'?'active':''}">Lysine map <span>${r?.lysines.length??'–'}</span></button><button data-tab="contacts" class="${state.tab==='contacts'?'active':''}">Interface contacts</button><button data-tab="sensitivity" class="${state.tab==='sensitivity'?'active':''}">Cutoff sensitivity</button></div><div id="table-content"></div></div>
 </section>
 <aside class="evidence-column"><section class="panel evidence-panel"><div class="panel-title"><h2>Evidence, not a score</h2>${icon('fingerprint')}</div><p class="muted">A structure answers some questions. Not all of them.</p>
 <div class="evidence-item"><span class="evidence-symbol yes">${icon('check')}</span><div><strong>Observed coordinates</strong><p>Pair geometry, atom distances, and modeled side chains.</p><span class="micro-badge">STRUCTURAL INPUT</span></div></div>
 <div class="evidence-item"><span class="evidence-symbol calc">${icon('calculator')}</span><div><strong>Calculated surface</strong><p>Sampled SASA and interface burial under explicit rules.</p><span class="micro-badge">GEOMETRIC ESTIMATE</span></div></div>
 <div class="evidence-item"><span class="evidence-symbol unknown">${icon('minus')}</span><div><strong>Productive ubiquitination</strong><p>No E2~Ub catalytic geometry or conformational ensemble supplied.</p><span class="micro-badge amber">NOT ESTABLISHED</span></div></div>
 <div class="evidence-item"><span class="evidence-symbol unknown">${icon('minus')}</span><div><strong>Cellular degradation</strong><p>No exposure, ternary kinetics, recycling, or turnover measurements.</p><span class="micro-badge amber">NOT PREDICTED</span></div></div>
 <button class="button wide" id="to-mechanism">${icon('activity')} Explore the mechanism</button></section>
 <section class="next-question"><div class="eyebrow">THE NEXT EXPERIMENT</div><h3>Does binding become throughput?</h3><p>Pair ternary kinetics with an early ubiquitination time course. Measure target recovery after washout.</p><a href="${citations.wurz}" target="_blank" rel="noopener">Why affinity is not enough ${icon('arrow-up-right')}</a></section>
 <section class="panel notes-panel"><div class="section-label">${icon('info')} STRUCTURE RECEIPT</div><p id="receipt">${r?`${r.counts.targetAtoms+r.counts.partnerAtoms} protein heavy atoms analyzed.<br>Model 1 · two chains · no HETATM occlusion.`:'No analysis yet.'}</p><p class="hash">${state.hash?'SHA-256 '+state.hash.slice(0,16)+'…':'Fingerprint pending'}</p><button class="text-button" id="show-methods">Read assumptions & limitations ${icon('arrow-right')}</button></section></aside></div>
 <footer><span>Data-Rich, Insight-Poor <span class="footer-slash">/</span> Useful models. Inspectable assumptions.</span><span>Research prototype · v${VERSION}</span></footer>`;
 $('#pdb-form').onsubmit=e=>{e.preventDefault();loadRemote($('#pdb-id').value);};
 $('#upload').onclick=()=>$('#file-input').click();
 const drop=$('#upload');drop.ondragover=e=>{e.preventDefault();drop.classList.add('dragging');};drop.ondragleave=()=>drop.classList.remove('dragging');drop.ondrop=e=>{e.preventDefault();drop.classList.remove('dragging');if(e.dataTransfer.files[0])loadFile(e.dataTransfer.files[0]);};
 $('#example').onclick=()=>loadRemote('5T35');
 $('#import-session').onclick=()=>$('#session-input').click();
 $('#analyze').onclick=runFromInputs;
 $('#cutoff').oninput=e=>$('#cutoff-label').textContent=fmt(e.target.value)+' Å';
 $('#save-run').onclick=saveRun;
 $('#to-mechanism').onclick=()=>setPage('mechanism');
 $('#show-methods').onclick=()=>setPage('methods');
 $('#cartoon').onclick=()=>{state.representation='cartoon';styleViewer();$('#cartoon').classList.add('selected');$('#sticks').classList.remove('selected');};
 $('#sticks').onclick=()=>{state.representation='sticks';styleViewer();$('#sticks').classList.add('selected');$('#cartoon').classList.remove('selected');};
 $('#show-lys').onchange=e=>{state.showLys=e.target.checked;styleViewer();};
 $('#show-ligand').onchange=e=>{state.showLigand=e.target.checked;styleViewer();};
 $('#reset-view').onclick=()=>{viewer?.zoomTo();viewer?.render();};
 $('#snapshot').onclick=()=>exportData('png');
 $$('[data-tab]').forEach(b=>b.onclick=()=>{state.tab=b.dataset.tab;$$('[data-tab]').forEach(x=>x.classList.toggle('active',x===b));renderResults();});
 renderResults();
 requestAnimationFrame(initViewer);
}
function chainOptions(selected){return (state.parsed?.chains??[]).map(c=>`<option value="${esc(c.id)}" ${c.id===selected?'selected':''}>${esc(c.id)} · ${c.residues} residues${state.source==='5T35'?' · '+({A:'BRD4',E:'BRD4',D:'VHL',H:'VHL',B:'EloB',F:'EloB',C:'EloC',G:'EloC'}[c.id]||''):''}</option>`).join('');}
function metrics(r){
 return `<div class="metric-grid"><div class="metric"><span>Pair interface area ${icon('layers-2')}</span><strong>${r?fmt(r.interfaceArea,0):'–'} <small>Å²</small></strong><p>½ of protein-only ΔSASA</p></div><div class="metric"><span>Exposed lysine NZ ${icon('scan')}</span><strong>${r?r.accessible:'–'} <small>/ ${r?r.lysines.length:'–'}</small></strong><p>NZ SASA ≥ ${fmt(r?.config.exposure??state.config.exposure,0)} Å²</p></div><div class="metric"><span>Residue contact pairs ${icon('network')}</span><strong>${r?r.contacts.length:'–'} <small>pairs</small></strong><p>Closest heavy atoms ≤ ${fmt(r?.config.cutoff??state.config.cutoff)} Å</p></div><div class="metric"><span>Interchain overlaps ${icon('triangle-alert')}</span><strong>${r?r.clashes:'–'} <small>pairs</small></strong><p>VDW overlap &gt; 0.8 Å</p></div></div>`;
}
function renderResults(){
 if(!$('#table-content'))return;
 const r=state.result;
 if(!r){$('#table-content').innerHTML=`<div class="empty-state">${icon('scan-line')}<h3>${busy?'Auditing the structure…':'No audit yet'}</h3><p>Load coordinates and choose two protein chains.</p></div>`;return;}
 if(state.tab==='lysines'){
 const rows=r.lysines.filter(l=>state.filter==='all'||l.exposed);
 $('#table-content').innerHTML=`<div class="table-caption"><p>Terminal amine exposure, not a ubiquitination-site prediction.</p><select id="lys-filter" aria-label="Filter lysines"><option value="all">All lysines</option><option value="exposed" ${state.filter==='exposed'?'selected':''}>Exposed NZ only</option></select></div><div class="table-scroll"><table><thead><tr><th>Residue</th><th>NZ SASA <small>Å²</small></th><th>Residue SASA <small>Å²</small></th><th>NZ → partner <small>Å</small></th><th>Exposure rule</th><th></th></tr></thead><tbody>${rows.map(l=>`<tr class="${state.selected===l.key?'highlight':''}"><td class="residue">LYS <b>${esc(l.resi+l.icode)}</b><small>Chain ${esc(l.chain)}</small></td><td><div class="bar-cell"><span>${fmt(l.nzSasa)}</span><div class="bar-track"><i style="width:${Math.min(100,(l.nzSasa??0)/45*100)}%"></i></div></div></td><td>${fmt(l.sasa)}</td><td>${fmt(l.nzDistance)}</td><td><span class="status-pill ${l.exposed?'exposed':''}">${l.status}</span></td><td><button class="icon-button focus-residue" data-key="${esc(l.key)}" title="Focus ${esc(l.key)}" aria-label="Focus lysine ${esc(l.key)}">${icon('crosshair')}</button></td></tr>`).join('')||'<tr><td colspan="6">No lysines match this filter.</td></tr>'}</tbody></table></div><div class="table-foot"><span>${rows.length} residues · sorted by NZ exposure</span><button id="csv-inline" class="text-button">${icon('download')} Export CSV</button></div>`;
 $('#lys-filter').onchange=e=>{state.filter=e.target.value;renderResults();};$('#csv-inline').onclick=()=>exportData('csv');
 $$('.focus-residue').forEach(b=>b.onclick=()=>{state.selected=b.dataset.key;const l=r.lysines.find(x=>x.key===state.selected);if(viewer&&l){const sel={chain:l.chain==='_'?'':l.chain,resi:l.resi,icode:l.icode};viewer.removeAllLabels();viewer.addLabel(`LYS ${l.key}`,{position:viewer.selectedAtoms({...sel,atom:'CA'})[0]??viewer.selectedAtoms(sel)[0],backgroundColor:'#203b33',fontColor:'#ffffff',fontSize:14});viewer.zoomTo(sel);viewer.zoom(.7);viewer.render();}renderResults();});
 } else if(state.tab==='contacts'){
 $('#table-content').innerHTML=`<div class="table-caption"><p>${r.atomContacts} atom pairs produce ${r.contacts.length} residue pairs. Proximity alone is not a chemical interaction assignment.</p></div><div class="table-scroll"><table><thead><tr><th>Target residue</th><th>Partner residue</th><th>Nearest atoms</th><th>Distance</th></tr></thead><tbody>${r.contacts.map(c=>`<tr><td>${esc(c.target)}</td><td>${esc(c.partner)}</td><td>${esc(c.atoms)}</td><td>${fmt(c.distance,2)} Å</td></tr>`).join('')||'<tr><td colspan="4">No contacts at this cutoff. Check chains and coordinates.</td></tr>'}</tbody></table></div>`;
 } else {
 const max=Math.max(1,...r.sensitivity.map(x=>x.pairs));
 $('#table-content').innerHTML=`<div class="table-caption"><p>How many “contacts” survive a change in the rule?</p></div><div class="sensitivity-chart">${r.sensitivity.map(s=>`<div><span>${fmt(s.cutoff)} Å</span><div class="sensitivity-track"><i style="width:${s.pairs/max*100}%" class="${Math.abs(s.cutoff-r.config.cutoff)<.01?'current':''}"></i></div><b>${s.pairs}</b></div>`).join('')}</div><p class="chart-note">Same coordinates, different distance threshold. Counts are unique residue pairs, not binding energies or affinity measurements.</p>`;
 }
 refreshIcons();
}
function initViewer(){
 if(!$('#viewer'))return;
 if(!state.parsed){$('#viewer').innerHTML='<div class="viewer-placeholder">Load a PDB structure to explore the pair.</div>';return;}
 if(!window.$3Dmol){$('#viewer').innerHTML='<div class="viewer-placeholder">3D renderer unavailable. All numerical audits still work.</div>';return;}
 try{
 $('#viewer').innerHTML='';
 viewer=window.$3Dmol.createViewer($('#viewer'),{backgroundColor:state.theme==='dark'?'#111d1a':'#eaf1ed',antialias:true});
 viewer.addModel(state.parsed.cleanPDB,'pdb');
 styleViewer();
 viewer.zoomTo({chain:[state.config.target==='_'?'':state.config.target,state.config.partner==='_'?'':state.config.partner]});
 viewer.rotate(25,'y');viewer.rotate(-50,'z');viewer.zoom(1.12);viewer.render();
 }catch(e){$('#viewer').innerHTML='<div class="viewer-placeholder">WebGL is not available in this browser. Numerical analysis is unaffected.</div>';}
}
function styleViewer(){
 if(!viewer)return;
 viewer.setStyle({},{});
 const target=state.config.target==='_'?'':state.config.target,partner=state.config.partner==='_'?'':state.config.partner;
 const rep=color=>state.representation==='cartoon'?{cartoon:{color,arrows:true,thickness:.35}}:{stick:{color,radius:.15}};
 viewer.setStyle({chain:target,hetflag:false},rep('#76c5ac'));
 viewer.setStyle({chain:partner,hetflag:false},rep('#d9c397'));
 if(state.showLys)viewer.addStyle({chain:target,resn:'LYS'},{stick:{color:'#a9eacf',radius:.17}});
 if(state.showLigand)viewer.setStyle({hetflag:true,chain:[target,partner]},{stick:{colorscheme:'whiteCarbon',radius:.19}});
 viewer.render();
}
async function loadRemote(id){
 id=id.trim().toUpperCase();
 if(!/^[1-9][A-Z0-9]{3}$/.test(id)){toast('Enter a four-character PDB ID such as 5T35.',true);return;}
 const ticket=++fetchGeneration;toast(`Loading ${id}…`);
 try{const res=await fetch(id==='5T35'?'./data/5T35.pdb':`https://files.rcsb.org/download/${id}.pdb`,{signal:AbortSignal.timeout(30000)});if(!res.ok)throw Error('Structure unavailable in legacy PDB format. Try a local .pdb file.');const text=await res.text();if(ticket!==fetchGeneration)return;await acceptStructure(text,id,null,ticket);}catch(e){if(ticket===fetchGeneration)toast(e.message,true);}
}
async function loadFile(file){const ticket=++fetchGeneration;if(file.size>15_000_000){toast('Please use a PDB file smaller than 15 MB.',true);return;}try{const text=await file.text();if(ticket!==fetchGeneration)return;await acceptStructure(text,file.name,null,ticket);}catch(e){if(ticket===fetchGeneration)toast(e.message,true);}}
async function acceptStructure(text,source,config=null,ticket=fetchGeneration){
 const parsed=parsePDB(text);
 if(parsed.chains.length<2)throw Error('At least two protein chains are required for this pair audit.');
 const nextConfig=validateConfig(config?{...DEFAULTS,...config}:{...state.config,target:parsed.chains[0].id,partner:source==='5T35'?'D':parsed.chains[1].id});
 if(!parsed.chains.some(c=>c.id===nextConfig.target)||!parsed.chains.some(c=>c.id===nextConfig.partner)||nextConfig.target===nextConfig.partner)throw Error('Session chain assignments must identify two different chains in its coordinates.');
 let hash='unavailable';
 try {const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));hash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');}catch{}
 if(ticket!==fetchGeneration)return false;
 worker?.terminate();clearTimeout(workerTimer);generation++;
 state.text=text;state.parsed=parsed;state.source=source;state.result=null;state.selected=null;state.filter='all';
 state.config=nextConfig;
 state.hash=hash;
 runAudit();
 return true;
}
function runFromInputs(){
 const probe=Number($('#probe').value), exposure=Number($('#exposure').value);
 if(!$('#probe').value||!$('#exposure').value||!$('#probe').checkValidity()||!$('#exposure').checkValidity()){toast('Check probe radius (0.5–3 Å) and NZ exposure (0–100 Å²).',true);return;}
 if($('#target').value===$('#partner').value){toast('Select two different protein chains.',true);return;}
 state.config={...state.config,target:$('#target').value,partner:$('#partner').value,probe,exposure,cutoff:Number($('#cutoff').value),points:Number($('#points').value)};
 state.selected=null;runAudit();
}
function runAudit(){
 worker?.terminate();clearTimeout(workerTimer);const ticket=++generation;busy=true;state.result=null;analysisError='';
 if(state.page==='structure')render();
 const fail=message=>{
  if(ticket!==generation)return;
  clearTimeout(workerTimer);worker?.terminate();worker=null;busy=false;analysisError=message;
  toast(message,true);if(state.page==='structure')render();
 };
 try{
  worker=new AnalysisWorker();
  worker.onmessage=({data})=>{
   if(ticket!==generation)return;
   if(data.error){fail(data.error);return;}
   clearTimeout(workerTimer);worker?.terminate();worker=null;busy=false;
   state.result={...data.result,source:state.source,hash:state.hash,created:new Date().toISOString()};
   toast('Structure audit complete. Every result has an explicit rule.');if(state.page==='structure')render();
  };
  worker.onerror=e=>{e.preventDefault();fail('Background worker could not run. Retry the audit, or open the downloaded HTML in Chrome or Edge. Browser policy may be blocking workers.');};
  worker.onmessageerror=()=>fail('Worker result could not be read. Retry the audit.');
  workerTimer=setTimeout(()=>fail('Analysis timed out after two minutes. Try fewer atoms or lower sampling, then retry.'),120000);
  worker.postMessage({parsed:state.parsed,config:state.config});
 }catch(e){fail(`Background worker could not start: ${e.message}. Retry or open the downloaded HTML in Chrome or Edge.`);}
}
$('#file-input').onchange=e=>{if(e.target.files[0])loadFile(e.target.files[0]);e.target.value='';};

function saveRun(){
 if(state.runs.length>=6){toast('Six-run limit reached. Remove a comparison first.',true);return;}
 if(state.page==='mechanism'){
 state.runs.push({kind:'mechanism',name:`Scenario ${state.runs.filter(x=>x.kind==='mechanism').length+1}`,config:{...state.k},summary:{loss:state.km.continuous.loss,peak:state.km.best.degradation,pulse:state.km.pulse.remaining,dose:state.km.best.dose},created:new Date().toISOString()});
 }else if(state.result){state.runs.push({kind:'structure',name:`${state.source} · ${state.config.target}/${state.config.partner}`,result:structuredClone(state.result)});}
 $('#run-count').textContent=state.runs.length;toast('Snapshot saved to Compare. Export a session to keep it after closing this tab.');
}

function renderMechanism(){
 const k=state.k;
 $('#main').innerHTML=heading('FROM DEGRADATION CURVES TO DEGRADABILITY LANDSCAPES','Binding is not the endpoint. Turnover is.','An executable companion to Data-Rich, Insight-Poor CLII. All starting values are illustrative, not MZ1 measurements.',`<button id="reset-model" class="button">${icon('rotate-ccw')} Reset model</button><button id="save-scenario" class="button primary">${icon('bookmark-plus')} Save scenario</button>`) + `
 <div class="model-notice">${icon('flask-conical')} <span><strong>Assumption sandbox, not an efficacy predictor.</strong> This model is not fitted to the loaded structure. Geometry does not set Kd, α, kpr, or cellular exposure.</span><a href="${citations.article}" target="_blank" rel="noopener">Read the article ${icon('arrow-up-right')}</a></div>
 <div class="mechanism-layout"><aside class="panel input-panel"><div class="panel-title"><h2>Define the system</h2><span class="step">02</span></div><form id="kinetic-form">
 <div class="side-section"><label class="field">Illustrative scenario<select id="scenario"><option value="custom">Custom / current inputs</option><option value="baseline">Baseline system</option><option value="fast">Fast target turnover</option><option value="loss">E3 loss (10-fold)</option><option value="cooperative">Higher cooperativity</option></select></label><div class="section-label">CELL BIOLOGY</div><div class="field-grid">${field('Target pool','k-target',k.target,.1,10000,.1,'nM')}${field('E3 pool','k-e3',k.e3,0,10000,.1,'nM')}</div>${field('Target half-life','k-half',k.half,.25,200,.25,'h')}</div>
 <div class="side-section"><div class="section-label">BINDING & THROUGHPUT</div><div class="field-grid">${field('Target Kd','k-kt',k.kt,.1,10000,.1,'nM')}${field('E3 Kd','k-ke',k.ke,.1,10000,.1,'nM')}</div>${field('Cooperativity α','k-alpha',k.alpha,.01,100,.01,'fold')}${field('Productive clearance kpr','k-kpr',k.kpr,0,10,.01,'h⁻¹')}<p class="fine">kpr lumps productive ubiquitination and clearance. It is not calculated from lysine exposure.</p></div>
 <div class="side-section"><div class="section-label">EXPOSURE & TIME</div>${field('Free intracellular degrader','k-dose',k.dose,.01,100000,.01,'nM')}<div class="field-grid">${field('Readout time','k-hours',k.hours,1,72,1,'h')}${field('Washout at','k-wash',k.wash,0,72,.5,'h')}</div><p class="fine">Clamped free concentration, then ideal complete washout. Not nominal dose or a human PK model.</p><button class="button primary wide" type="submit">${icon('play')} Recompute landscape</button></div>
 <div class="side-section"><div class="section-label">SEPARATE CLOCK DIAGNOSTIC</div>${field('Ternary dissociation koff','k-off',k.off,.01,600,.01,'h⁻¹')}${field('Commitment kcommit','k-commit',k.commit,.01,600,.01,'h⁻¹')}<p class="fine">These clocks are not fed into kpr. No double counting of residence time.</p></div></form></aside>
 <section class="mechanism-main"><div id="model-metrics"></div><div class="chart-grid"><section class="panel chart-panel"><div class="panel-title"><div><h2>The dose is not the mechanism</h2><p>Hook effect and a conditional inhibition proxy</p></div><span class="micro-badge">SIMULATED</span></div><div class="canvas-wrap"><canvas id="dose-chart" aria-label="Simulated dose response chart" role="img"></canvas></div><p class="chart-note">Dashed: loss of free, unbound target, assuming every drug-bound target is inactive. Not a signaling or phenotype prediction.</p></section><section class="panel chart-panel"><div class="panel-title"><div><h2>The recovery tells a story</h2><p>Continuous exposure versus ideal washout</p></div><span class="micro-badge">SIMULATED</span></div><div class="canvas-wrap"><canvas id="time-chart" aria-label="Target recovery time course" role="img"></canvas></div><p class="chart-note">Constant synthesis restores the baseline after instantaneous drug removal. No retention, rebinding, or continued ubiquitination is modeled.</p></section></div>
 <div class="chart-grid bottom-charts"><section class="panel landscape-panel"><div class="panel-title"><div><h2>A degradability landscape</h2><p>Target loss at the selected dose and time</p></div><span class="micro-badge">14 × 10 GRID</span></div><div class="landscape-wrap"><div class="axis-y">Productive clearance kpr (h⁻¹)</div><div class="landscape-y"><span>10</span><span>1</span><span>0.1</span><span>0.01</span></div><div id="heatmap" class="heatmap"></div></div><div class="landscape-x"><span>1</span><span>10</span><span>100</span><span>1,000</span><span>10,000</span></div><div class="axis-x">Target Kd (nM) → weaker affinity</div><div class="color-key"><span>0% loss</span><i></i><span>100% loss</span></div><p id="heatmap-readout" class="chart-note" aria-live="polite">Select a cell to inspect its parameter pair and simulated target loss.</p></section>
 <section class="panel clock-panel"><div class="panel-title"><div><h2>Three clocks, no magic score</h2><p>Formation is not commitment. Commitment is not recycling.</p></div>${icon('timer')}</div><div id="clock-content"></div><div class="boundary-note"><strong>Where this model stops</strong><p>It has no explicit E2~Ub ensemble, ubiquitin-chain editing, proteasome queue, E3 recycling delay, permeability model, or feedback. Molecular glues and LOCKTACs require different state models; they are not silently treated as bifunctional PROTACs.</p></div></section></div></section></div>
 <footer><span>Biology → biophysics → exposure → turnover. Keep each inference visible.</span><button class="text-button" id="model-methods">Inspect the equations ${icon('arrow-right')}</button></footer>`;
 $('#kinetic-form').onsubmit=e=>{e.preventDefault();const next={...state.k};for(const key of Object.keys(next)){const input=$(`#k-${key}`);if(input){if(!input.checkValidity()||!input.value){toast('Check the model inputs and their permitted ranges.',true);return;}next[key]=Number(input.value);}}if(next.wash>next.hours){toast('Washout must occur at or before the readout time.',true);return;}state.k=next;computeModel();toast('Mechanism recomputed. These are conditional simulations.');};
 $('#scenario').onchange=e=>{const v=e.target.value;if(v==='custom')return;state.k={...KDEFAULTS,...(v==='fast'?{half:1}:v==='loss'?{e3:3}:v==='cooperative'?{alpha:25}:{})};render();};
 $('#save-scenario').onclick=saveRun;
 $('#reset-model').onclick=()=>{state.k={...KDEFAULTS};render();};
 $('#model-methods').onclick=()=>setPage('methods');
 computeModel();
}
function lineChart(id,datasets,xTitle,yTitle,log=false){
 const muted=state.theme==='dark'?'#90a79c':'#5d7167',grid=state.theme==='dark'?'#27352f':'#dce5df';
 const chart=new Chart($(id),{type:'line',data:{datasets},options:{responsive:true,maintainAspectRatio:false,animation:false,interaction:{mode:'nearest',intersect:false},plugins:{legend:{position:'bottom',labels:{color:muted,usePointStyle:true,boxWidth:7,font:{family:'Satoshi',size:12}}},tooltip:{callbacks:{label:c=>`${c.dataset.label}: ${fmt(c.parsed.y)}%`}}},scales:{x:{type:log?'logarithmic':'linear',title:{display:true,text:xTitle,color:muted},ticks:{color:muted,maxTicksLimit:6},grid:{color:grid}},y:{min:0,max:100,title:{display:true,text:yTitle,color:muted},ticks:{color:muted,stepSize:25},grid:{color:grid}}}}});
 charts.push(chart);
}
function computeModel(){
 charts.forEach(c=>c.destroy());charts=[];
 state.km=mechanism(state.k);const m=state.km,k=state.k;
 $('#model-metrics').innerHTML=`<div class="metric-grid"><div class="metric"><span>Target loss at ${k.hours} h</span><strong>${fmt(m.continuous.loss)}<small>%</small></strong><p>At ${fmt(k.dose,0)} nM free degrader</p></div><div class="metric"><span>Peak sampled loss</span><strong>${fmt(m.best.degradation)}<small>%</small></strong><p>Grid + selected dose + equilibrium peak</p></div><div class="metric"><span>Best sampled dose</span><strong>${fmt(m.best.dose,1)}<small>nM</small></strong><p>Not a fitted DC₅₀</p></div><div class="metric"><span>After pulse + recovery</span><strong>${fmt(m.pulse.remaining)}<small>%</small></strong><p>Target remaining at ${k.hours} h</p></div></div>`;
 lineChart('#dose-chart',[{label:'Degradation',data:m.doseCurve.map(x=>({x:x.dose,y:x.degradation})),borderColor:'#78c6a9',backgroundColor:'#78c6a9',pointRadius:0,borderWidth:2.5},{label:'Inhibition proxy',data:m.doseCurve.map(x=>({x:x.dose,y:x.inhibition})),borderColor:'#d5bd89',backgroundColor:'#d5bd89',borderDash:[5,5],pointRadius:0,borderWidth:2}],'Free intracellular degrader (nM)','Target loss / proxy (%)',true);
 lineChart('#time-chart',[{label:'Continuous',data:m.continuous.series.map(x=>({x:x.time,y:x.remaining})),borderColor:'#78c6a9',backgroundColor:'#78c6a9',pointRadius:0,borderWidth:2.5},{label:`Washout at ${k.wash} h`,data:m.pulse.series.map(x=>({x:x.time,y:x.remaining})),borderColor:'#d5bd89',backgroundColor:'#d5bd89',pointRadius:0,borderWidth:2}],'Time (h)','Target remaining (%)');
 $('#heatmap').innerHTML=m.heatmap.map((c,i)=>`<button data-cell="${i}" style="background:hsl(${145+c.loss*.14} ${15+c.loss*.32}% ${15+c.loss*.46}%)" aria-label="Kd ${fmt(c.kt)} nM, kpr ${fmt(c.kpr,3)} per hour, target loss ${fmt(c.loss)} percent" title="Kd ${fmt(c.kt)} nM · kpr ${fmt(c.kpr,3)} h⁻¹ · ${fmt(c.loss)}% loss"></button>`).join('');
 $$('[data-cell]').forEach(b=>b.onclick=()=>{const c=m.heatmap[+b.dataset.cell];$('#heatmap-readout').textContent=`Target Kd ${fmt(c.kt)} nM · kpr ${fmt(c.kpr,3)} h⁻¹ → ${fmt(c.loss)}% simulated target loss.`;$$('[data-cell]').forEach(x=>x.classList.toggle('chosen',x===b));});
 $('#clock-content').innerHTML=`<div class="clock-row"><span>Mean ternary dwell <small>1 / koff</small></span><b>${fmt(m.dwell)} min</b></div><div class="clock-row"><span>Mean commitment time <small>1 / kcommit</small></span><b>${fmt(60/k.commit)} min</b></div><div class="clock-row"><span>Baseline protein half-life <small>ln(2) / kbasal</small></span><b>${fmt(k.half)} h</b></div><div class="commitment"><span>Commitment before dissociation</span><strong>${fmt(m.commitment*100)}%</strong><div class="bar-track"><i style="width:${m.commitment*100}%"></i></div><p>kcommit / (kcommit + koff). A two-hazard toy model, not a measured productive fraction. It cannot establish an optimal residence time.</p></div>`;
}

function renderCompare(){
 $('#main').innerHTML=heading('SAME QUESTION / DIFFERENT ASSUMPTIONS','Compare evidence. Not leaderboard scores.','Save structural audits or mechanism scenarios, then inspect what changed. Runs are kept only in this tab.')+`
 <div class="comparison-intro">${icon('info')} Different structures, chain choices, or SASA settings are not automatically comparable. No cross-ligase efficacy ranking is calculated.</div>
 ${state.runs.length?`<div class="comparison-grid">${state.runs.map((run,i)=>run.kind==='structure'?`<article class="panel comparison-card"><div class="panel-title"><span class="micro-badge">STRUCTURE AUDIT</span><button class="icon-button remove-run" data-index="${i}" aria-label="Remove ${esc(run.name)}">${icon('x')}</button></div><h2>${esc(run.name)}</h2><p class="muted">${run.result.config.points} points · ${run.result.config.probe} Å probe · ${run.result.config.cutoff} Å cutoff</p><dl><div><dt>Pair interface area</dt><dd>${fmt(run.result.interfaceArea)} Å²</dd></div><div><dt>Exposed lysine NZ</dt><dd>${run.result.accessible} / ${run.result.lysines.length}</dd></div><div><dt>Contact residue pairs</dt><dd>${run.result.contacts.length}</dd></div><div><dt>Interchain overlaps</dt><dd>${run.result.clashes}</dd></div><div><dt>NZ exposure rule</dt><dd>≥ ${run.result.config.exposure} Å²</dd></div></dl><p class="hash">SHA-256 ${esc(run.result.hash?.slice(0,16))}…</p><div class="boundary-note">Static, pair-only geometry. Not ubiquitination competence or cellular potency.</div></article>`:`<article class="panel comparison-card"><div class="panel-title"><span class="micro-badge">MECHANISM SCENARIO</span><button class="icon-button remove-run" data-index="${i}" aria-label="Remove ${esc(run.name)}">${icon('x')}</button></div><h2>${esc(run.name)}</h2><p class="muted">Illustrative · ${run.config.hours} h readout</p><dl><div><dt>Target half-life</dt><dd>${run.config.half} h</dd></div><div><dt>E3 pool / cooperativity</dt><dd>${run.config.e3} nM / ${run.config.alpha}</dd></div><div><dt>Selected-dose target loss</dt><dd>${fmt(run.summary.loss)}%</dd></div><div><dt>Peak sampled loss</dt><dd>${fmt(run.summary.peak)}%</dd></div><div><dt>After pulse: remaining</dt><dd>${fmt(run.summary.pulse)}%</dd></div></dl><button class="button wide load-scenario" data-index="${i}">Load these parameters ${icon('arrow-right')}</button></article>`).join('')}</div>`:`<div class="panel empty-state large">${icon('columns-2')}<h2>A comparison starts with a saved run.</h2><p>Audit a structure at two distance cutoffs, or test what happens when E3 abundance falls tenfold.</p><button class="button primary" id="start-compare">Return to structure audit ${icon('arrow-right')}</button></div>`}`;
 $$('.remove-run').forEach(b=>b.onclick=()=>{state.runs.splice(+b.dataset.index,1);$('#run-count').textContent=state.runs.length;render();});
 $$('.load-scenario').forEach(b=>b.onclick=()=>{state.k={...state.runs[+b.dataset.index].config};setPage('mechanism');});
 if($('#start-compare'))$('#start-compare').onclick=()=>setPage('structure');
}

function renderMethods(){
 $('#main').innerHTML=heading('INSPECTABLE MATHEMATICS / EXPLICIT BOUNDARIES','Every output owes you a method.','App 0.2.3 · Structural algorithm 0.2.0 unchanged · MIT original code · No trained model or validated efficacy claim.')+`
 <div class="methods-layout"><aside class="panel methods-index"><a href="#method-structure">Structure audit</a><a href="#method-kinetics">Mechanism model</a><a href="#method-clocks">Competing clocks</a><a href="#method-boundaries">What is not modeled</a><a href="#method-provenance">Provenance & literature</a></aside><article class="methods-prose">
 <section id="method-structure"><span class="eyebrow">01 / OBSERVED GEOMETRY</span><h2>Two chains. Declared rules.</h2><p>The parser reads the first model of a fixed-width PDB file. It excludes hydrogen, deuterium, water and nonpositive-occupancy atoms; alternate locations are selected per atom by maximum occupancy, with blank then alphabetical tie-breaking. This may combine alternate conformers. No missing atoms, hydrogens, biological assemblies or symmetry mates are generated. Blank chain IDs appear as “_”.</p><p>The calculation uses only ATOM heavy atoms from the selected target and partner chains. HETATM ligands are visible for context but excluded from every surface and contact calculation. The result is a <strong>pair-only protein surface</strong>, not the solvent accessibility of the complete ternary assembly or full cell target. PDB-format uploads are supported; mmCIF is not.</p><h3>Surface area</h3><p>A deterministic Fibonacci sphere implements a Shrake–Rupley-style point test. Each atom receives N sample points at its van der Waals radius plus the probe radius. Points lying inside any neighboring expanded atom are occluded. This is the rolling-probe construction described in the <a href="${citations.sasa}" target="_blank" rel="noopener">Biopython SASA documentation</a>.</p><pre>SASAᵢ = 4π(rᵢ + rprobe)² × Naccessible / N
ΔSASA = SASA(target alone) + SASA(partner alone) − SASA(pair)
Pair interface area = ΔSASA / 2</pre><p>Radii (Å): C 1.70, N 1.55, O 1.52, S 1.80, P 1.80, Se 1.90; fallback 1.70. Default probe: 1.40 Å; default sampling: 256 points per atom. Refine to 960 points to inspect discretization sensitivity. These are geometric estimates, not uncertainty intervals.</p><h3>Lysines and contacts</h3><p>A lysine is classified “exposed NZ” when its terminal nitrogen SASA meets the user-defined threshold, default 5 Å². This arbitrary operational threshold is not calibrated against ubiquitination. Missing NZ is explicitly unclassified. Residue SASA sums all observed heavy atoms. NZ-to-partner distance is the minimum distance to any selected partner heavy atom: it is <strong>not</strong> distance to ubiquitin or the E2 active site.</p><p>A contact is a residue pair with at least one interchain heavy-atom distance at or below the cutoff. No hydrogen-bond, salt-bridge or energetic classification is inferred. Overlaps count interchain atom pairs satisfying rᵢ + rⱼ − distance &gt; 0.8 Å. They are flags for inspection, not a force-field clash energy.</p></section>
 <section id="method-kinetics"><span class="eyebrow">02 / CONDITIONAL BIOPHYSICS</span><h2>A minimal degradability model</h2><p>The mechanism lab operationalizes the questions in <a href="${citations.article}" target="_blank" rel="noopener">Data-Rich, Insight-Poor CLII</a>: how binding, cooperativity, target turnover, E3 abundance, and exposure constrain degradation. It is an independent reduced model, not a reproduction or validation of the model reported by <a href="${citations.du}" target="_blank" rel="noopener">Du and colleagues</a>. All initial parameters are illustrative and are not assigned to MZ1, BRD4, VHL, or any other real compound–target pair.</p><p>For a bifunctional PROTAC, let T and E be current total target and E3 concentrations, d the externally clamped free intracellular drug concentration, and X the ternary complex concentration. The target and E3 mass balances include both binary and ternary complexes. Drug mass balance is deliberately not imposed because d is held by an ideal reservoir.</p><pre>c = αd / [(Kd,target + d)(Kd,E3 + d)]
X = c(T − X)(E − X)
b = 1 + c(T + E)
X = 2cTE / [b + √(1 + 2c(T + E) + c²(T − E)²)]

Tfree = (T − X) / (1 + d / Kd,target)
Efree = (E − X) / (1 + d / Kd,E3)

kbasal = ln(2) / target half-life
ksynthesis = kbasal × Tbaseline
dT/dt = ksynthesis − kbasal T − kpr X</pre><p>The stable quadratic root preserves 0 ≤ X ≤ min(T,E). The ternary pool competes with drug-saturated binary complexes, allowing a high-dose hook effect. Affinity, cooperativity and hook behavior are distinct properties, as discussed by <a href="${citations.wurz}" target="_blank" rel="noopener">Wurz et al.</a> E3 is conserved and assumed immediately available after processing; E3 synthesis, turnover and explicit recycling states are omitted.</p><p>The ODE is integrated by fourth-order Runge–Kutta with a step no larger than min(0.04 h, 0.3/(kbasal+kpr)). A step crossing the washout time is split at that time. After ideal washout, d = 0 immediately and the reduced rapid-equilibrium model has X = 0. True residual exposure and persistent ternary complexes would invalidate this assumption.</p><p>Target loss is 100 × (1 − T/Tbaseline). The dashed inhibition proxy is 100 × (1 − Tfree/Tbaseline), which assumes all drug-bound target is inactive. It is not an enzyme-activity, substrate, signaling, or phenotypic model. “Peak sampled loss” means the highest result among 49 log-spaced free doses from 0.01 to 100,000 nM plus the selected dose and sqrt(Kd_target × Kd_E3), the equilibrium peak in this reduced model at the chosen time; it is not an experimental Dmax. A fitted DC₅₀ is intentionally not reported.</p><p>The landscape samples 14 target Kd values from 1 to 10,000 nM and 10 kpr values from 0.01 to 10 h⁻¹ at the selected dose and time. The grid is a conditional illustration, not a measured feasibility boundary. kpr is input in h⁻¹, not min⁻¹.</p></section>
 <section id="method-clocks"><span class="eyebrow">03 / COMPETING HAZARDS</span><h2>Residence time is not a universal optimum</h2><pre>Mean dwell = 1 / koff
Mean commitment time = 1 / kcommit
P(commit before dissociation) = kcommit / (kcommit + koff)</pre><p>The last expression assumes two independent, memoryless competing events and a single irreversible commitment step. It has no polyubiquitination states, deubiquitinase activity, refractory complex, or ligase recycling delay. It cannot show that tighter binding must reduce throughput or identify an optimum dwell time. Its inputs do not modify kpr in the main model, avoiding double counting. The system-dependent relationship between ternary lifetime and degradation is documented by <a href="${citations.wurz}" target="_blank" rel="noopener">Wurz et al.</a></p></section>
 <section id="method-boundaries"><span class="eyebrow">04 / THE INFERENCE BOUNDARY</span><h2>What this workbench refuses to invent</h2><p>It does not derive affinity, cooperativity, free energy, linker entropy, ubiquitination probability, productive kpr, cellular exposure, DC₅₀ or an E3 ranking from a PDB structure. It has no trained EGNN, validation dataset or classification accuracy claim. A user-supplied partner chain is not evidence that the chain is an E3.</p><p>Productive ubiquitination requires more than exposed lysines; geometry relative to E2~Ub and the ligase ensemble matters. The limitations of truncated structures and proximity-based ubiquitination models are discussed by <a href="${citations.bai}" target="_blank" rel="noopener">Bai et al.</a> The loaded <a href="${citations.structure}" target="_blank" rel="noopener">5T35 example</a> contains BRD4 BD2, MZ1, VHL and elongins; its A/D pair is not a full CRL2–E2~Ub assembly. The observed orientation need not be the only solution-state orientation, as noted by <a href="${citations.gadd}" target="_blank" rel="noopener">Gadd et al.</a></p><p>Molecular glues need cooperative interaction models appropriate to their specific binding pathway; LOCKTACs stabilize existing assemblies and require functional state models rather than automatic degradation equations. Neither is modeled quantitatively in this version. Permeability, nonspecific binding, drug depletion, PK, E3 turnover, ubiquitin-chain architecture, proteasome capacity and adaptive feedback are also outside this version.</p></section>
 <section id="method-provenance"><span class="eyebrow">05 / REPRODUCIBILITY</span><h2>A result should travel with its assumptions.</h2><p>Session export includes the exact original PDB text, SHA-256 fingerprint, parser/algorithm version, selected chains, sampling rules, outputs, mechanism inputs and saved comparisons. Imported structure results are discarded and recomputed from the exported coordinates and settings. Exported simulation values should always be described as illustrative model outputs, not compound measurements.</p><p>The example coordinates come from <a href="${citations.structure}" target="_blank" rel="noopener">RCSB PDB 5T35</a>. Rendering uses 3Dmol.js; plots use Chart.js. The calculation code is independent of the renderer. Molecular snapshots contain what is visible, not a new structure determination. The app has no analytics, login, or upload endpoint. Initial assets/fonts and requested RCSB fetches require network access; local computation and local file parsing occur in the tab.</p><p>Data is held in memory only. Closing or refreshing the tab discards changes unless a session has been exported. No employer-specific structures, methods or measurements are bundled. The software is a research prototype with numerical and interaction tests, not a validated discovery or clinical decision system.</p><div class="boundary-note"><strong>Current structure warnings</strong>${state.result?`<ul>${state.result.warnings.map(w=>`<li>${esc(w)}</li>`).join('')}</ul>`:'Load and analyze a structure to inspect its warning receipt.'}</div></section>
 </article></div>`;
}

function download(content,name,type){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
const csvCell=x=>'"'+String(x??'').replaceAll('"','""')+'"';
function exportData(kind){
 const r=state.result;
 if(kind==='png'){if(!viewer){toast('Open the structure audit to export a molecular snapshot.',true);return;}try{const a=document.createElement('a');a.href=viewer.pngURI();a.download='ternary-check-structure.png';a.click();}catch{toast('Snapshot export is unavailable in this browser.',true);}return;}
 if(kind==='csv'){if(!r){toast('Run a structure audit first.',true);return;}const keys=['key','sasa','freeSasa','nzSasa','nzDistance','nzB','atoms','status'];download([keys.join(','),...r.lysines.map(l=>keys.map(k=>csvCell(l[k])).join(','))].join('\n'),'ternary-check-lysines.csv','text/csv');}
 if(kind==='json'){download(JSON.stringify({format:'ternary-check-session',version:VERSION,exported:new Date().toISOString(),source:state.source,pdb:state.text,sha256:state.hash,config:state.config,result:r,kinetics:state.k,runs:state.runs,citations,evidenceContext:libraryContext()},null,2),'ternary-check-session.json','application/json');}
 if(kind==='kinetics'){const m=state.km??mechanism(state.k);download('record,x,dose_nM,degradation_percent,inhibition_proxy_percent,remaining_percent\n'+m.doseCurve.map(x=>`dose,,${x.dose},${x.degradation},${x.inhibition},`).join('\n')+'\n'+m.continuous.series.map(x=>`continuous_time,${x.time},,,,${x.remaining}`).join('\n')+'\n'+m.pulse.series.map(x=>`pulse_time,${x.time},,,,${x.remaining}`).join('\n'),'ternary-check-mechanism.csv','text/csv');}
 if(kind==='md'){
 const m=state.km??mechanism(state.k);
 const text=`# Ternary Check: research dossier\n\nApp release 0.2.3; structural algorithm/session format ${VERSION}. Exported ${new Date().toISOString()}.\n\n## Interpretation\n\nThis is a structural audit and an independent illustrative mechanism model, not a validated degradation predictor. Structure measurements do not parameterize the kinetic model. There is no E3 efficacy ranking, trained classifier, or predicted cellular DC50.\n\n## Structural input and rules\n\n${r?`Input: ${state.source}\n\nSHA-256: ${state.hash}\n\nSettings:\n\`\`\`json\n${JSON.stringify(r.config,null,2)}\n\`\`\`\n\nOnly the selected two protein chains (ATOM heavy atoms, model 1) are analyzed. HETATM, other chains, waters and hydrogens do not occlude SASA. Highest-occupancy alternate records are selected per atom. Missing atoms and assemblies are not reconstructed.\n\n## Structural results\n\nPair interface area: ${fmt(r.interfaceArea)} Å² (half of total protein-only ΔSASA).\n\nExposed NZ: ${r.accessible} of ${r.lysines.length} observed target lysines (NZ SASA ≥ ${r.config.exposure} Å²). Missing NZ: ${r.missingNZ}.\n\nResidue contact pairs: ${r.contacts.length} at ${r.config.cutoff} Å. Interchain VDW overlaps >0.8 Å: ${r.clashes} atom pairs.\n\n| Residue | NZ SASA (Å²) | Residue SASA (Å²) | NZ–partner minimum (Å) | Classification |\n|---|---:|---:|---:|---|\n${r.lysines.map(l=>`| ${l.key} | ${fmt(l.nzSasa)} | ${fmt(l.sasa)} | ${fmt(l.nzDistance)} | ${l.status} |`).join('\n')}\n\nNZ-to-partner distance is not an E2/ubiquitin distance. Exposure is not evidence of productive ubiquitination.\n\n## Structural warnings\n\n${r.warnings.map(w=>'- '+w).join('\n')}`:'No completed structural audit.'}\n\n## Conditional mechanism model\n\nAll parameters are user-entered or illustrative, not measurements assigned to the loaded structure. Free intracellular drug is clamped; protein mass balances are exact at rapid equilibrium. E3 is conserved and instantly recycled. Constant target synthesis balances basal turnover at the initial baseline.\n\n\`\`\`\nc = alpha*d / ((Kd_target+d)*(Kd_E3+d))\nX = c*(T-X)*(E-X)\ndT/dt = (ln(2)/half_life)*Tbaseline - (ln(2)/half_life)*T - kpr*X\n\`\`\`\n\nkpr is input in h^-1 and lumps productive ubiquitination and clearance. Fourth-order Runge–Kutta uses dt <= min(0.04 h, 0.3/(kbasal+kpr)). Ideal washout sets free drug to zero immediately. No explicit drug depletion, PK, residual binding, recycling delay, ubiquitin chain or proteasome queue is represented.\n\nInputs:\n\`\`\`json\n${JSON.stringify(state.k,null,2)}\n\`\`\`\n\nSimulated target loss at the selected dose/time: ${fmt(m.continuous.loss)}%. Peak sampled loss: ${fmt(m.best.degradation)}%, at ${fmt(m.best.dose)} nM free drug within a 49-point 0.01–100,000 nM grid plus the selected dose and sqrt(Kd_target × Kd_E3). Target remaining after pulse and recovery: ${fmt(m.pulse.remaining)}%. These are conditional simulations, not measured Dmax or fitted DC50.\n\nThe inhibition proxy assumes every drug-bound target is inactive and is not a signaling readout. Separate commitment-before-dissociation toy probability = kcommit/(kcommit+koff) = ${fmt(m.commitment*100)}%; not fed into kpr and not evidence of an optimal dwell time. Molecular glues and LOCKTACs are not modeled by these PROTAC equations.\n\n## Provenance and scientific context\n\nThe article framing comes from [Data-Rich, Insight-Poor CLII](${citations.article}); the reduced implementation is not a reproduction of [Du et al.](${citations.du}). The structure example is [RCSB 5T35](${citations.structure}), reported by [Gadd et al.](${citations.gadd}). Productive-geometry limitations are discussed by [Bai et al.](${citations.bai}); affinity, cooperativity and kinetic qualifications by [Wurz et al.](${citations.wurz}). SASA methodology follows the rolling-probe construction described in [Biopython documentation](${citations.sasa}).\n\nExport the session JSON alongside this dossier for original coordinates, settings, outputs and saved comparisons.\n`;
 const context=libraryContext(),example=context.selectedExample,article=context.coverage.find(a=>a.id===example?.article);
 const contextNote=`\n## Article and database context\n\n${context.scope}\n\n${example?`Selected case: ${example.name}. Target/context: ${example.target}. Recruiter/routing: ${example.e3}.\n\n${example.evidence}\n\nInference boundary: ${example.boundary}\n\nArticle: ${article?.url??'Archive only; public article URL not confirmed.'}\n\nPrimary record: ${example.paper??article?.paper??'Not assigned.'}`:'No article case selected.'}\n\n${context.database?`Database: ${context.database.title}. ${context.database.rows?`Imported ${context.database.retrieved}; ${context.database.rows} records.`:'No file imported. This is not a negative search result.'}\n\n${context.database.url}\n\nSHA-256: ${context.database.sha256??'Not applicable: no file imported'}\n\n${context.database.note}`:'No interaction file imported.'}\n\nApp release: 0.2.3. Structural algorithm/session format: ${VERSION}. Original code and documentation: MIT; provider data keep their own terms.\n\nThe selected case does not parameterize the structural or kinetic calculations. Export the dedicated case note or filtered evidence for those results.\n`;
 download(text+contextNote,'ternary-check-dossier.md','text/markdown');
 }
 toast('Export prepared locally. Review assumptions before sharing.');
 $('#export-dialog').close();
}
$$('[data-export]').forEach(b=>b.onclick=()=>exportData(b.dataset.export));
$('#session-input').onchange=async e=>{
 const file=e.target.files[0];e.target.value='';if(!file)return;
 const ticket=++fetchGeneration;
 try{
 if(file.size>20_000_000)throw Error('Session file exceeds 20 MB.');
 const s=JSON.parse(await file.text());
 if(s.format!=='ternary-check-session'||s.version!==VERSION||typeof s.pdb!=='string')throw Error('Not a supported Ternary Check v0.2.0 session.');
 const k={...KDEFAULTS,...s.kinetics};
 const bounds={target:[.1,10000],e3:[0,10000],kt:[.1,10000],ke:[.1,10000],alpha:[.01,100],kpr:[0,10],half:[.25,200],dose:[.01,100000],hours:[1,72],wash:[0,72],off:[.01,600],commit:[.01,600]};
 if(Object.entries(bounds).some(([key,[lo,hi]])=>!Number.isFinite(k[key])||k[key]<lo||k[key]>hi)||k.wash>k.hours)throw Error('Session has invalid mechanism parameters.');
 if(!s.config)throw Error('Session has invalid structure settings.');
 validateConfig(s.config);
 if(!await acceptStructure(s.pdb,String(s.source||'Imported PDB'),s.config,ticket))return;
 state.k=k;state.km=null;
 // Imported snapshots are not trusted calculation results; reconstruct comparisons with fresh analyses instead.
 state.runs=[];$('#run-count').textContent='0';
 toast('Session inputs restored; structure recomputed. Saved snapshots were not imported as trusted results.');
 }catch(err){toast(`Could not import session: ${err.message}`,true);}
};
render();
loadRemote('5T35');
