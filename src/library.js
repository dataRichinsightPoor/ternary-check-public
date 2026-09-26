import {articles,examples} from './examples.js';
import packageMetadata from '../package.json';
import {roles,filterInteractions,parseInteractionTSV,annotationURL,lensValues,UBI_URL,emptyDatabase} from './evidence.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link=(url,label)=>url?`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`:'';
const recordSources=r=>r.source==='MEDLINE'&&/^\d+(?:[:;,]\d+)*$/.test(r.sourceId)?r.sourceId.split(/[:;,]/).map(id=>link(`https://pubmed.ncbi.nlm.nih.gov/${id}/`,'PubMed '+id)).join(' '):esc(r.sourceId);
const $=s=>document.querySelector(s);
const download=(data,name,type='application/json')=>{
 const u=URL.createObjectURL(new Blob([data],{type})),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);
};
let selection=examples[0].id,search='',category='all',articleFilter='all';
let database=emptyDatabase(),dbQuery='CRBN',dbRole='either',dbSpecies='H.sapiens',dbPage=0,annotation='',annotationToken=0,importToken=0;
export function libraryContext(){return {scope:'88 case records across 14 retrieved articles, posts and archive drafts; not an exhaustive publication archive.',selectedExample:examples.find(x=>x.id===selection)??null,coverage:articles,database:database?.manifest??null,databaseFilter:{query:dbQuery,role:dbRole,species:dbSpecies},restoreNote:'Archival context only. Reimport restores structural and kinetic inputs, not the article selection or imported database.'};}
export function renderLibrary({heading,navigate,e3}){
 $('#main').innerHTML=heading('ARTICLE → MECHANISM → TEST','Examples with their biology attached.','An inspectable case library, not a leaderboard. Published observations, article interpretations and hypothetical calculations stay separate.',`<button class="button" id="export-library">Export case library</button>`)+`
 <div class="coverage-line"><span class="micro-badge">${examples.length} CASE RECORDS</span><span>${articles.length} retrieved articles / posts / archive drafts</span><button class="text-button" id="coverage-toggle">Coverage & limitations</button></div>
 <section class="panel coverage" id="coverage" hidden><h2>Scope of this edition</h2><p>Includes the named degrader examples and relevant controls or comparators in the retrieved series articles, plus explicitly identified primary-paper extensions. This is not a claim that every published or unpublished installment has been found. Generic classes and unnamed compounds remain unnamed. Several names are grouped when the article uses them as one comparison.</p><div class="article-index">${articles.map(a=>`<div><strong>${esc(a.title)}</strong><br>${link(a.url,'Article')} ${link(a.paper,'Primary record')} ${a.note?`<small>${esc(a.note)}</small>`:''}</div>`).join('')}</div></section>
 <div class="library-controls"><label>Find a compound, target or recruiter<input id="case-search" value="${esc(search)}" placeholder="Try DCAF16, BACH1, KAT2A, HRZ…"></label><label>Mechanism<select id="case-category"><option value="all">All mechanisms</option>${[...new Set(examples.map(x=>x.category))].map(c=>`<option ${category===c?'selected':''}>${esc(c)}</option>`).join('')}</select></label><label>Article<select id="case-article"><option value="all">All articles</option>${articles.map(a=>`<option value="${a.id}" ${articleFilter===a.id?'selected':''}>${esc(a.title)}</option>`).join('')}</select></label></div>
 <div class="library-layout"><section class="case-list panel" aria-label="Illustrative cases"><div class="panel-title"><h2>Case library</h2><span id="case-count"></span></div><div id="case-list"></div></section><section id="case-detail" class="case-detail panel" aria-live="polite"></section></div>`;
 $('#coverage-toggle').onclick=()=>$('#coverage').hidden=!$('#coverage').hidden;
 $('#export-library').onclick=()=>download(JSON.stringify({version:packageMetadata.version,scope:'Retrieved articles, archive drafts and marked primary-paper extensions. Not exhaustive beyond this corpus.',articles,examples},null,2),'ternary-check-article-library.json');
 const draw=()=>{
  const filtered=examples.filter(x=>(category==='all'||x.category===category)&&(articleFilter==='all'||x.article===articleFilter)&&JSON.stringify(x).toLowerCase().includes(search.toLowerCase()));
  if(!filtered.some(x=>x.id===selection))selection=filtered[0]?.id??null;
  $('#case-count').textContent=`${filtered.length} shown`;
  $('#case-list').innerHTML=filtered.length?filtered.map(x=>`<button data-case="${x.id}" class="case-row ${selection===x.id?'selected':''}"><small>${esc(x.category)}</small><strong>${esc(x.name)}</strong><span>${esc(x.target)} <b>·</b> ${esc(x.e3)}</span></button>`).join(''):'<p class="empty-library">No matching examples. Clear a filter or search another target.</p>';
  document.querySelectorAll('[data-case]').forEach(b=>b.onclick=()=>{selection=b.dataset.case;draw();});
  detail();
 };
 const detail=()=>{
  const x=examples.find(x=>x.id===selection);
  if(!x){$('#case-detail').innerHTML='<div class="empty-library"><h2>No matching case selected.</h2><p>Clear a filter to explore the source-linked library.</p></div>';return;}
  const a=articles.find(a=>a.id===x.article);
  $('#case-detail').innerHTML=`<div class="case-detail-head"><span class="micro-badge">${esc(x.status??x.category)}</span><span class="fine">CASE ${examples.indexOf(x)+1} / ${examples.length}</span></div><h2>${esc(x.name)}</h2><p class="case-byline">${esc(a.title)}</p><div class="case-pair"><div><small>Target / context</small><strong>${esc(x.target)}</strong></div><div><small>Recruiter / routing</small><strong>${esc(x.e3)}</strong></div></div>
  <section><h3>What the example establishes</h3><p>${esc(x.evidence)}</p><div class="source-links">${link(a.url,'Read your article')} ${link(x.paper??a.paper,'Supporting primary record')}</div>${a.note?`<p class="fine">${esc(a.note)}</p>`:''}</section>
  <section class="case-boundary"><h3>What it does not establish</h3><p>${esc(x.boundary)}</p></section>
  <section><h3>The biological question</h3><p>${esc(a.lesson)}</p></section>
  <section class="lens"><span class="eyebrow">ILLUSTRATION · NOT COMPOUND DATA</span><h3>Change one assumption</h3><label class="lens-label" for="lens-input">${a.lens==='reporter'?'Actual target loss (%)':a.lens==='routing'?'Lysosomal exit rate (slider ÷ 100 h⁻¹)':a.lens==='localization'?'Accessible fraction of E3 (%)':a.lens==='turnover'?'Elapsed time (slider ÷ 5 h)':'Dissociation rate (slider ÷ 10 h⁻¹)'}</label><input id="lens-input" type="range" min="0" max="100" value="30"><div class="lens-result"><strong id="lens-value"></strong><span id="lens-label"></span></div><div class="lens-track"><div id="lens-bar"></div></div><code id="lens-eq"></code><p class="fine" id="lens-note"></p></section>
  <div class="case-actions"><button class="button" id="case-e3">Inspect recruitment evidence</button>${x.action?`<button class="button primary" id="case-action">${x.action==='structure'?'Open 5T35 structure audit':'Open conditional mechanism lab'}</button>`:''}<button class="button" id="case-export">Export case note</button></div><p class="fine">Inspecting a case does not assign its identity or experimental parameters to the mechanism lab.</p>`;
  const update=()=>{const v=lensValues(a.lens,Number($('#lens-input').value));$('#lens-value').textContent=v.value.toFixed(1);$('#lens-label').textContent=v.label;$('#lens-bar').style.width=`${Math.min(100,v.value)}%`;$('#lens-eq').textContent=v.equation;$('#lens-note').textContent=v.note;};
  $('#lens-input').oninput=update;update();
  $('#case-e3').onclick=()=>{const symbol=x.e3.split(/[ +·/]/)[0];e3(roles[symbol]?symbol:x.target.split(/[ /]/)[0]);};
  if(x.action)$('#case-action').onclick=()=>navigate(x.action);
  $('#case-export').onclick=()=>{
   const v=lensValues(a.lens,Number($('#lens-input').value));
   download(`# Ternary Check: ${x.name}\n\n## Provenance\n\n${a.title}\n\n${a.url??'Article recovered from archive; public URL not confirmed.'}\n\n${x.paper??a.paper??'No primary URL assigned.'}${a.note?`\n\nSource note: ${a.note}`:''}\n\n## Evidence\n\nTarget: ${x.target}. Recruiter or context: ${x.e3}.\n\n${x.evidence}\n\n## Inference boundary\n\n${x.boundary}\n\n## Illustrative calculation, not compound data\n\n${v.equation}\n\nSlider input: ${$('#lens-input').value}. ${v.label}: ${v.value.toFixed(3)}.\n\n${v.note}\n`,'ternary-check-case-note.md','text/markdown');
  };
 };
 $('#case-search').oninput=e=>{search=e.target.value;draw();};
 $('#case-category').onchange=e=>{category=e.target.value;draw();};
 $('#case-article').onchange=e=>{articleFilter=e.target.value;draw();};
 draw();
}
export function setEvidenceQuery(q){dbQuery=q;dbRole='either';dbPage=0;annotation='';}
export async function renderEvidence({heading}){
 const root=$('#main');
 const render=()=>{
 root.innerHTML=heading('DATABASE CONNECTIONS','Recruitment evidence, not a rank.','Import UbiBrowser evidence locally or inspect live human UniProt annotations. No third-party interaction database is bundled; neither source establishes degrader efficacy.',`<button class="button" id="db-export" ${database.rows.length?'':'disabled'}>Export filtered evidence</button>`)+`
 <div class="db-status"><span class="micro-badge">UBIBROWSER · ${database.rows.length?'LOCAL IMPORT':'NOT LOADED'}</span><span>${database.rows.length.toLocaleString()} records${database.manifest.retrieved?' · imported '+esc(database.manifest.retrieved):''}</span>${link(UBI_URL,'Official download')}<button class="text-button" id="db-import">Import known-interaction TSV</button><input hidden id="db-file" type="file" accept=".txt,.tsv"></div>
 <div class="notice database-notice"><strong>Native/curated interaction ≠ drug-induced degradation.</strong><p>This is the known-interaction file, not UbiBrowser’s predicted network. Its retrieval date is not the publication date of its evidence. Absence from this snapshot is not evidence of absence. Imported records retain the database’s naming and may contain historical annotation errors. ${link(database.manifest.docs,'Database definitions')}</p></div>
 <div class="library-controls"><label>Gene symbol or UniProt identifier<input id="db-query" value="${esc(dbQuery)}" placeholder="CRBN, BRD4, VHL, Q96SW2…"></label><label>Search role<select id="db-role"><option value="either">Either role</option><option value="e3">E3 / component</option><option value="substrate">Substrate</option></select></label><label>Species<select id="db-species"><option value="all">All species</option>${database.manifest.species.map(s=>`<option value="${esc(s)}">${esc(s)}</option>`).join('')}</select></label></div>
 <div class="ligase-shortcuts">${Object.keys(roles).map(g=>`<button class="chip" data-gene="${g}">${g==='BIRC2'?'BIRC2 / cIAP1':g}</button>`).join('')}</div>
 <div class="db-layout"><section class="panel"><div class="panel-title"><h2>Imported interaction records</h2><span id="db-count"></span></div><div id="db-results"></div><div class="db-pagination"><button class="button small" id="db-prev">Previous</button><span id="db-pages"></span><button class="button small" id="db-next">Next</button></div></section><aside class="db-side"><section class="panel"><div class="panel-title"><h2>Component identity</h2></div><div id="component-info"></div></section><section class="panel"><div class="panel-title"><h2>Live UniProt lookup</h2><span class="micro-badge">ON REQUEST</span></div><p class="fine">Sends only the entered gene symbol/accession to UniProt. No coordinates or local files are sent. Human reviewed entries only.</p><label class="field">Gene or accession<input id="annotation-query" value="${esc(/^[A-Za-z0-9_-]+$/.test(dbQuery)?dbQuery:'CRBN')}"></label><button class="button" id="annotation-fetch">Fetch live annotation</button><div id="annotation-result">${annotation}</div></section><section class="panel db-provenance"><h2>Import provenance</h2><p>${esc(database.manifest.note)}</p><code>SHA-256<br>${esc(database.manifest.sha256??'Not applicable: no file imported')}</code><p class="fine">The official download uses HTTP. Obtain the file directly from the provider under its applicable terms; this app does not use an insecure proxy. Import time is not evidence currency. Imported data remain in this tab until it closes or reloads. No provider data are licensed under this project’s MIT license.</p></section></aside></div>`;
 $('#db-role').value=dbRole;$('#db-species').value=dbSpecies;
 const filtered=()=>filterInteractions(database.rows,{query:dbQuery,role:dbRole,species:dbSpecies});
 const draw=()=>{
  const rows=filtered();dbPage=Math.min(dbPage,Math.max(0,Math.ceil(rows.length/12)-1));
  $('#db-count').textContent=`${rows.length.toLocaleString()} records`;
  $('#db-pages').textContent=`Page ${dbPage+1} / ${Math.max(1,Math.ceil(rows.length/12))}`;
  $('#db-prev').disabled=dbPage===0;$('#db-next').disabled=(dbPage+1)*12>=rows.length;
  $('#db-results').innerHTML=rows.length?rows.slice(dbPage*12,dbPage*12+12).map(r=>`<article class="interaction"><div class="interaction-head"><strong>${esc(r.e3)} <span>→</span> ${esc(r.substrate)}</strong><span class="micro-badge">${esc(r.species)}</span></div><div class="fine">${esc(r.family)} · ${esc(r.source)} · record ${esc(r.id)}</div><p>${esc(r.sentence||'No evidence sentence provided.')}</p><div class="source-links">${link(`https://www.uniprot.org/uniprotkb/${encodeURIComponent(r.e3Acc)}/entry`,r.e3Acc)} ${link(`https://www.uniprot.org/uniprotkb/${encodeURIComponent(r.subAcc)}/entry`,r.subAcc)} ${recordSources(r)}</div></article>`).join(''):database.rows.length?'<div class="empty-library"><h3>No matching imported records.</h3><p>Try a broader identifier, another species, or either role. This result does not rule out a native interaction or drug-induced recruitment.</p></div>':'<div class="empty-library"><h3>Bring the evidence. Keep it local.</h3><p>No database is loaded. Open the official download, obtain the known E3 interaction TSV under the provider’s terms, then choose Import known-interaction TSV. This is not a negative search result.</p><p>Component guidance and live UniProt annotations work without importing a file.</p></div>';
  const role=roles[dbQuery.toUpperCase()];
  $('#component-info').innerHTML=role?`<span class="micro-badge">${esc(role[0])}</span><h3>${esc(role[1])}</h3><p>${esc(role[2])}</p><p class="fine">Workbench role guide; inspect the linked live protein record and original studies for provenance.</p>`:'<p class="fine">No role guide assigned for this query. Search a specific E3/component or fetch its UniProt annotation; a substring hit does not establish identity.</p>';
 };
 $('#db-query').oninput=e=>{dbQuery=e.target.value;dbPage=0;draw();};
 $('#db-role').onchange=e=>{dbRole=e.target.value;dbPage=0;draw();};
 $('#db-species').onchange=e=>{dbSpecies=e.target.value;dbPage=0;draw();};
 document.querySelectorAll('[data-gene]').forEach(b=>b.onclick=()=>{dbQuery=b.dataset.gene;dbPage=0;$('#db-query').value=dbQuery;$('#annotation-query').value=dbQuery;draw();});
 $('#db-prev').onclick=()=>{dbPage--;draw();};$('#db-next').onclick=()=>{dbPage++;draw();};
 $('#db-export').onclick=()=>download(JSON.stringify({manifest:database.manifest,filter:{query:dbQuery,role:dbRole,species:dbSpecies},limitations:'Known-interaction snapshot; not a degrader efficacy prediction.',rows:filtered()},null,2),'ternary-check-e3-evidence.json');
 $('#db-import').onclick=()=>$('#db-file').click();
 $('#db-file').onchange=async e=>{
  const input=e.target,f=input.files[0];if(!f)return;const ticket=++importToken;
  try{
   if(f.size>25000000)throw Error('Please use a file smaller than 25 MB.');
   const bytes=await f.arrayBuffer(),text=new TextDecoder().decode(bytes),rows=parseInteractionTSV(text);
   const hash=await crypto.subtle.digest('SHA-256',bytes);
   if(ticket!==importToken)return;
   database={rows,manifest:{...database.manifest,retrieved:new Date().toISOString().slice(0,10),sha256:[...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join(''),rows:rows.length,species:[...new Set(rows.map(r=>r.species))].sort(),note:`User-imported ${f.name}; format validated, biological content not independently verified.`}};
   dbSpecies=database.manifest.species.includes('H.sapiens')?'H.sapiens':'all';dbPage=0;if(input.isConnected)render();
  }catch(err){if(ticket===importToken&&input.isConnected)$('#db-results').innerHTML=`<div class="empty-library" role="alert">${esc(err.message)} Existing database retained.</div>`;}
 };
 $('#annotation-fetch').onclick=async()=>{
  const button=$('#annotation-fetch'),output=$('#annotation-result'),ticket=++annotationToken;
  try{
   const url=annotationURL($('#annotation-query').value.trim());button.disabled=true;output.textContent='Requesting reviewed human protein records…';
   const response=await fetch(url,{signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error(`UniProt returned ${response.status}`);
   const data=await response.json();if(ticket!==annotationToken)return;
   annotation=data.results?.length?data.results.map(r=>{
    const comments=(r.comments??[]).filter(c=>['FUNCTION','SUBCELLULAR LOCATION','SUBUNIT'].includes(c.commentType));
    const parts=comments.map(c=>({type:c.commentType,text:c.texts?.map(t=>t.value).join(' ')??c.subcellularLocations?.map(l=>l.location?.value).join('; ')})).filter(c=>c.text);
    return `<div class="annotation-card"><h3>${esc(r.proteinDescription?.recommendedName?.fullName?.value??r.uniProtkbId)}</h3>${link(`https://www.uniprot.org/uniprotkb/${r.primaryAccession}/entry`,r.primaryAccession)}${parts.map(c=>`<section><strong>${esc(c.type)}</strong><p>${esc(c.text)}</p></section>`).join('')}</div>`;
   }).join(''):'<p>No reviewed human entry matched. Check the gene symbol or accession.</p>';
   annotation+=`<p class="fine">Fetched ${new Date().toISOString()} · UniProt release ${esc(response.headers.get('X-UniProt-Release')??'not provided')}. Annotation is not a quantitative expression measurement or a degrader score.</p>`;
   if(output.isConnected)output.innerHTML=annotation;
  }catch(err){if(output.isConnected)output.innerHTML=`<p role="alert">Live lookup unavailable: ${esc(err.message)}. Local import and component guidance remain usable.</p>`;}
  finally{button.disabled=false;}
 };
 draw();
 };
 render();
}
