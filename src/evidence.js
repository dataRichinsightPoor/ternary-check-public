export const UBI_URL='http://ubibrowser.bio-it.cn/ubibrowser_v3/Public/download/literature/literature.E3.txt';
export function emptyDatabase(){
 return {rows:[],manifest:{
  provider:'UbiBrowser',source:UBI_URL,url:UBI_URL,title:'UbiBrowser known E3 interactions (user-supplied)',
  docs:'http://ubibrowser.bio-it.cn/ubibrowser_v3/home/document/index',
  rows:0,species:['H.sapiens'],retrieved:null,sha256:null,
  distribution:'User-supplied only; no third-party interaction records bundled.',
  note:'No interaction database loaded. Download the known E3 interaction TSV from UbiBrowser under its applicable terms, then import it locally. The project MIT license does not apply to provider data.'
 }};
}
export const roles={
 CRBN:['Substrate receptor','CRL4–DDB1–CRBN','Not a stand-alone catalytic ligase. Ligand-induced neosubstrates are context dependent.'],
 VHL:['Substrate receptor','CRL2–Elongin B/C–VHL','A VHL–target pair omits the cullin scaffold, RBX1 and E2~ubiquitin.'],
 DDB1:['Adaptor','CRL4 adaptor','Can be recruited directly in CDK12/cyclin K glue systems; do not confuse the bound protein with the degraded substrate.'],
 DCAF16:['Substrate receptor','CRL4–DDB1–DCAF16','Covalent engagement and productive geometry require separate evidence.'],
 DCAF15:['Substrate receptor','CRL4–DDB1–DCAF15','A ligand-dependent neosubstrate is not necessarily a native database substrate.'],
 FBXO3:['Substrate receptor','SCF–FBXO3','F-box substrate-recognition component; not the RING catalytic component.'],
 FBXO22:['Substrate receptor','SCF–FBXO22','Binding alone does not establish productive degradation.'],
 FEM1B:['Substrate receptor','CRL2–FEM1B','Localization can change which substrate interfaces are available.'],
 MDM2:['RING E3 ligase','MDM2','Catalytic activity and degrader compatibility are not inferred from expression.'],
 BIRC2:['RING E3 ligase','cIAP1','A record of native ubiquitination does not rank cIAP1 as a degrader recruiter.'],
 BIRC3:['RING E3 ligase','cIAP2','Do not merge cIAP1 and cIAP2 records.'],
 RNF4:['RING E3 ligase','RNF4','Native substrate recognition differs from drug-induced recruitment.'],
 RBX1:['RING component','Cullin–RING ligases','Recruits E2~ubiquitin. Distance to RBX1 is not a direct measurement of ubiquitin transfer.'],
 CUL4A:['Scaffold','CRL4A','The scaffold is not interchangeable with its substrate receptor.'],
 CUL2:['Scaffold','CRL2','Assembly and subcellular localization matter.']
};
export function filterInteractions(rows,{query='',role='either',species='H.sapiens'}={}){
 const q=query.trim().toUpperCase();
 return rows.filter(r=>(species==='all'||r.species===species)&&(!q||(role==='e3'?[r.e3,r.e3Acc,r.e3Id]:role==='substrate'?[r.substrate,r.subAcc,r.subId]:[r.e3,r.e3Acc,r.e3Id,r.substrate,r.subAcc,r.subId]).some(x=>String(x).toUpperCase().includes(q))));
}
export function parseInteractionTSV(text){
 const lines=text.replace(/^\uFEFF/,'').replace(/[\r\n]+$/,'').split(/\r?\n/);
 const headers=lines.shift().split('\t');
 const required=['NUMBER','Gene Symbol (E3)','Gene Symbol (Substrate)','SwissProt AC (E3)','SwissProt AC (Substrate)','SOURCE','SOURCEID','SENTENCE','species'];
 if(new Set(headers).size!==headers.length||required.some(h=>!headers.includes(h)))throw Error('Use the UbiBrowser literature.E3.txt known-interaction download, not predicted interactions.');
 if(!lines.length)throw Error('The file contains no interaction records. No data imported.');
 if(lines.length>100000)throw Error('Maximum 100,000 imported records.');
 const at=(cols,name)=>cols[headers.indexOf(name)]??'';
 return lines.map((l,i)=>{
  const c=l.split('\t');if(c.length!==headers.length)throw Error(`Unexpected column count on row ${i+2}. No data imported.`);
  return {id:at(c,'NUMBER'),e3:at(c,'Gene Symbol (E3)'),substrate:at(c,'Gene Symbol (Substrate)'),e3Acc:at(c,'SwissProt AC (E3)'),subAcc:at(c,'SwissProt AC (Substrate)'),e3Id:at(c,'SwissProt ID (E3)'),subId:at(c,'SwissProt ID (Substrate)'),source:at(c,'SOURCE'),sourceId:at(c,'SOURCEID'),sentence:at(c,'SENTENCE').replace(/<[^>]*>/g,''),species:at(c,'species'),family:at(c,'E3TYPE'),count:at(c,'COUNT'),type:at(c,'type')};
 });
}
export function annotationURL(term){
 if(!/^[A-Za-z0-9_-]{1,30}$/.test(term))throw Error('Enter a single gene symbol or UniProt accession, such as CRBN or Q96SW2.');
 const accession=/^(?:[OPQ][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z][0-9](?:[A-Z][A-Z0-9]{2}[0-9]){1,2})$/.test(term.toUpperCase());
 const q=`${accession?'accession':'gene_exact'}:${term.toUpperCase()} AND organism_id:9606 AND reviewed:true`;
 return `https://rest.uniprot.org/uniprotkb/search?query=${encodeURIComponent(q)}&format=json&size=5`;
}
export function lensValues(kind,v){
 if(kind==='reporter'){
  const loss=v/100,gain=8;
  return {value:100*(1-Math.exp(-gain*loss)),label:'Illustrative reporter output (%)',equation:'R = 100 × [1 − exp(−8 × fractional loss)]',note:'An arbitrary saturating transfer function, not a fit to RTA. Changing amplifier gain changes the readout without changing degradation.'};
 }
 if(kind==='routing'){
  const kL=v/100,kR=.5;
  return {value:100*kL/(kL+kR),label:'Conditional lysosomal routing (%)',equation:'P(lysosome | internalized) = kL / (kL + kR)',note:'Two competing first-order exits, recycling fixed at 0.5 h⁻¹. Uptake, dissociation, receptor recycling and synthesis are omitted.'};
 }
 if(kind==='localization'){
  return {value:30*v/100,label:'Accessible E3 pool (nM)',equation:'Eavailable = Etotal × accessible fraction; Etotal = 30 nM',note:'An assumed pool, not a measured FEM1B concentration. This does not account for partitioning kinetics or compartment volumes.'};
 }
 if(kind==='turnover'){
  const t=v/5;
  return {value:100*Math.pow(2,-t/8),label:'Protein remaining after synthesis stops (%)',equation:'T(t)/T0 = 2^(−t/8 h); t = slider / 5 h',note:'Complete, instantaneous synthesis arrest and an assumed 8 h half-life. No degrader is present; this is not an siRNA PK model.'};
 }
 return {value:100*1/(1+v/10),label:'Commitment before dissociation (%)',equation:'P(commit) = kcommit / (kcommit + koff); kcommit = 1 h⁻¹',note:'One encounter, two competing exponential clocks. Assumed rates only; does not model binding, ubiquitin-chain formation, recycling or clinical activity.'};
}
