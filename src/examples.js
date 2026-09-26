const li='https://www.linkedin.com/pulse/';
export const articles=[
 {id:'landscape',title:'From Degradation Curves to Degradability Landscapes',url:li+'from-degradation-curves-degradability-landscapes-making-damko-qwkue',lesson:'Abundance, turnover, productive clearance and exposure determine the conditional response.',lens:'turnover'},
 {id:'void',title:'The Mechanistic Void in Molecular Glue Design',url:li+'mechanistic-void-molecular-glue-design-ermelinda-damko-cbmze',lesson:'A stable ternary complex is not a measured ubiquitination event.',lens:'commitment'},
 {id:'sufex',title:'High-Throughput SuFEx Glues and the Hard Part',url:li+'high-throughput-sufex-glues-hard-part-turning-screens-ermelinda-damko-6epwe',paper:'https://doi.org/10.1038/s41589-025-02137-2',lesson:'The recruited receptor emerges from chemistry and productive geometry; it is not a universal ranking.',lens:'commitment'},
 {id:'kat',title:'Beyond the Degron',url:li+'beyond-degron-how-non-canonical-crbn-recruitment-could-damko-bh0se',paper:'https://doi.org/10.1126/science.aef5391',lesson:'An induced epitope can create recruitment outside canonical sequence motifs.',lens:'commitment'},
 {id:'return',title:'The Return of the Degron',url:li+'return-degron-ermelinda-damko-qbxce',paper:'https://doi.org/10.1038/s41587-026-03237-7',lesson:'A drug-dependent binder is not automatically a degradable substrate.',lens:'commitment'},
 {id:'switch',title:'Programming Ligase Choice in SMARCA2/4 Molecular Glues',url:li+'programming-ligase-choice-smarca24-molecular-glues-ermelinda-damko-9lzpe',paper:'https://pubmed.ncbi.nlm.nih.gov/42392088/',lesson:'Single-carbon edits can change productive ligase dependence; weak engagement is not productive flux.',lens:'commitment'},
 {id:'heme',title:'When Molecular Glues Learn Geography: Heme, BACH1, and AML',url:li+'when-molecular-glues-learn-geography-heme-bach1-aml-ermelinda-damko-i3rbe',paper:'https://pubmed.ncbi.nlm.nih.gov/42146656/',lesson:'The compartment and available ligase interface are part of the mechanism.',lens:'localization'},
 {id:'audits',title:'Scientific Audits of Next-Generation Elimination',url:li+'datarich-insightpoor-scientific-audits-nextgeneration-ermelinda-damko-9i9ye',lesson:'Proteasomal and lysosomal elimination have different access, flux and recovery constraints.',lens:'routing'},
 {id:'rna',title:'Scientific Audits: Transport, RNA and Failure Modes',url:li+'datarich-insightpoor-scientific-audits-nextgeneration-ermelinda-damko-at3ue',lesson:'Stopping synthesis is not the same intervention as accelerating removal.',lens:'turnover'},
 {id:'endo',title:'EndoTags and the New Design Logic of Extracellular Degradation',url:li+'endotags-new-design-logic-extracellular-degradation-ermelinda-damko-fhs5e',paper:'https://www.nature.com/articles/s41586-024-07948-2',lesson:'Conformational triggering, clustering and constitutive trafficking are distinct routing mechanisms.',lens:'routing'},
 {id:'pegs',title:'Beyond Better Toxins: PEGS Boston',url:li+'beyond-better-toxins-what-pegs-boston-revealed-next-wave-damko-whnne',lesson:'Antibody delivery adds release and access constraints upstream of intracellular degradation.',lens:'routing'},
 {id:'rta',title:'Cellular Hocus Pocus · CCVI',url:null,paper:'https://www.cell.com/cell/fulltext/S0092-8674(26)00936-0',lesson:'Amplified transcriptional output is not a direct measurement of target loss.',lens:'reporter',note:'Article recovered from your archive; public article URL not confirmed. Cell publication linked; detailed open manuscript: https://pmc.ncbi.nlm.nih.gov/articles/PMC13228303/.'},
 {id:'clocks',title:'The Doorstop and the Three Clocks · CXCV',url:null,lesson:'Residence time has meaning relative to commitment, cycling and repair.',lens:'commitment',note:'Article recovered from your archive; public article URL not confirmed. Comparator cases are not presented as degraders.'},
 {id:'dynamics',title:'How “Good” MD Can Make or Break PROTAC Design',url:'https://www.linkedin.com/posts/ermelinda-damko-ab1570305_datarichinsightpoor-activity-7447431599593250816-P0Ig',paper:'https://elifesciences.org/reviewed-preprints/101127v2',lesson:'An ensemble of structures is not captured by one contact map or one short trajectory.',lens:'commitment'}
];
const rows=[];
function add(article,category,name,target,e3,evidence,boundary,extra={}){
 rows.push({id:`${article}-${rows.length+1}`,article,category,name,target,e3,evidence,boundary,...extra});
}
add('landscape','Framework','Degradability landscape','Generic target','User-defined','Article-level framework, no named compound.','Model outputs are conditional simulations, not a fitted reproduction of the cited study.',{action:'mechanism'});
add('landscape','Structural reference','MZ1 · BRD4–VHL','BRD4 BD2','VHL','Added structural reference: experimental complex 5T35.','Not named in the landscape article. Pair geometry omits the full ubiquitination machinery.',{paper:'https://www.rcsb.org/structure/5T35',action:'structure'});
for(const name of ['Roscovitine','DS50'])add('void','Source conflict',name,'CDK12 / cyclin K system','DDB1','The article and the 2025 v1 GlueMap preprint give conflicting degradation rankings.','Do not load quantitative presets or assign a winner. Substrate identity and the original dataset need reconciliation; RBX1-proxy geometry is a computational hypothesis.',{paper:'https://www.biorxiv.org/content/10.1101/2025.01.13.632817v1.full.pdf'});
for(const name of ['MG1','MG6'])add('void','Molecular glue',name,'GSPT1','CRBN','Named GlueMap lead/optimized example in the article.','Article-reported activity; the fetched v1 preprint does not substantiate the later MG6 claim. No potency imported.',{status:'Article only'});
for(const [name,target,e3,text] of [
 ['dHTC1','ENL / AF9','CRBN','Target-first glue discovery; highly cooperative ENL-dependent CRBN engagement.'],
 ['dHTC3','BRD4 BD1','FBXO3','Glue-like mechanism supported by recruitment and BD1-specific degradation; definitive structural classification remains open.'],
 ['dHTC2','BRD4','DCAF16','Primary-paper extension: DCAF16 dependence and hook behavior are reported. Molecular-glue versus heterobifunctional mechanism remains unresolved.'],
 ['(S)-dHTC1 / (R)-dHTC1','ENL','CRBN','Primary-paper stereoisomer control: similar target affinity, different degradation.'],
 ['SR-1114','ENL / AF9','CRBN','Primary-paper PROTAC comparator with independent CRBN engagement.']
])add('sufex',name.includes('(R)')?'Control':name==='SR-1114'?'PROTAC comparator':name==='dHTC2'?'Degrader · modality unresolved':name==='dHTC3'?'Glue-like degrader':'Molecular glue',name,target,e3,text,'No universal E3 ranking follows from this compound-specific system.');
for(const n of [1,2,4])add('kat','Molecular glue',`KAT2A study · compound ${n}`,'KAT2A; GSPT1/2 and KAT2B comparators','CRBN',n===1?'Starting series co-recruits GSPT1.':n===2?'Interface modification reduces detectable GSPT1 dimerization.':'Optimized series separates KAT2A loss from GSPT1/2 and KAT2B liabilities.','Study-scoped numbering; not the SMARCA2/4 compounds with the same numbers. Detailed numbering is article-reported.',{status:'Article + primary abstract'});
add('kat','Comparator','CC-885','GSPT1','CRBN','Structural recruitment comparator in the KAT2A analysis.','A known geometry is a comparison, not proof that a new epitope transfers unchanged.');
add('kat','Control','Pomalidomide / MLN4924 / bortezomib','KAT2A pathway rescue','CRBN','Competition, cullin-pathway blockade and proteasome inhibition interrogate different steps.','These are controls in this experiment, not three KAT2A degraders.');
add('kat','Comparator','Lenalidomide-derived scaffold','KAT2A glue series','CRBN','Chemical ancestry of the KAT2A compounds.','Do not attribute the optimized compound’s selectivity to lenalidomide itself.');
for(const target of ['FIZ1','ZBTB11','Helios / IKZF2','CKAP5','RNF39','Ikaros / IKZF1'])add('return','Recruitment example',`Pomalidomide · ${target}`,target,'CRBN',target==='CKAP5'?'GluePCA binding but no compound-dependent NanoBiT signal in the retrieved primary study.':'Recruitment/domain-context example in the CRBN interactome analysis.','Binding, construct degradation and endogenous full-length protein loss are distinct evidence levels.');
for(const [name,target,text] of [
 ['FIZ1 study · compound 1','FIZ1','Dedicated compound converts latent recruitment into robust degradation.'],
 ['WJ-01-306','ZBTB11','Dedicated compound associated with robust ZBTB11 degradation.'],
 ['NVP-DKY709 / ALV2','Helios / IKZF2','Specialized molecular glues illustrate target-selective optimization.'],
 ['Z5000181945','RNF39 RING domain','Primary-paper follow-through from binder discovery to domain degradation; MLN4924 rescue.'],
 ['Z4999952733','RNF39 RING domain','Stronger recruitment reported; do not claim demonstrated degradation from this result.'],
 ['REST ZF2 versus ZF2–ZF3','REST','Primary-paper extension: binding of an isolated zinc finger did not reproduce tandem-domain degradation.']
])add('return','Molecular glue',name,target,'CRBN',text,'Primary-paper extension of the article case; no extrapolation to whole-proteome degradability.');
for(const n of [1,2,3,4])add('switch','Covalent glue',`SMARCA2/4 study · compound ${n}`,'SMARCA2 / SMARCA4; PBRM1 context',n===1||n===4?'DCAF16':'DCAF16 + FBXO22',n===4?'Weak FBXO22 binding coexists with strict DCAF16 dependence.':n===1?'Covalent capture of DCAF16 Cys173 supports degradation.':'One-carbon analog recruits both ligase systems in the tested settings.','Covalent capture is not modeled by the reversible PROTAC equilibrium equations.');
add('switch','Comparator','ML 1-50','BRD4','DCAF16','Article cites the Cys173 engagement hotspot as a cross-chemotype comparison.','A reusable hotspot does not imply transferable degradation efficacy.',{status:'Article only'});
add('switch','Control','DCAF16 C173S / FBXO22 Cys228–Cys326','SMARCA2/4','DCAF16 + FBXO22','Mutational dependence separates encounter from productive recruitment.','Mutations can alter structure or expression; interpret with matched controls.');
add('heme','Endogenous glue','Heme','BACH1','FEM1B','Cytoplasmic, not mitochondrial, CUL2–FEM1B supports the reported BACH1 degradation.','Preprint evidence. Total expression is not the accessible ligase pool.');
add('heme','Comparator','Purine monophosphates / thiopurines','PPAT–NUDT5','None assigned','Endogenous-metabolite induced-proximity comparison in the article.','Regulatory complex formation is not automatically a degradation mechanism.',{status:'Article comparator'});
add('heme','Comparator','Rapamycin / FK506 / plant hormones','Induced-proximity comparisons','Not assigned by article','Named as familiar glue examples, without complete target assignments in this article.','Not labeled as BACH1 degraders.',{status:'Article comparator'});
add('heme','Control','EN106 / venetoclax','AML response context','FEM1B context','Pharmacological perturbation and sensitization examples.','These observations do not establish either compound as a BACH1 degrader.',{status:'Article only'});
for(const name of ['Vepdegestrant / ARV-471','PLX-61639','PRT3789'])add('audits','Degrader',name,name.startsWith('Vep')?'Estrogen receptor':'SMARCA2',name.startsWith('Vep')?'CRBN':'Not specified in article','Named translational example in the protein-elimination audit.','No clinical status or potency is inferred here; E3 identity is left unassigned when not established by the article.',{status:'Article only'});
for(const target of ['EGFR','HER2','PD-L1'])add('audits','Lysosomal','Ferritin-based LYTAC · '+target,target,'TfR1 · routing receptor','Human heavy-chain ferritin scaffold couples target recognition to endolysosomal transport.','TfR1 is not an E3 ligase. Binding, internalization and net receptor loss require separate measurements.',{status:'Article only'});
add('rna','RNA comparator','Albumin-hitchhiking MMP13 siRNA','MMP13','Not E3-mediated','Intervention at mRNA rather than accelerated protein removal.','Residual protein disappears at its own turnover rate; delivery and endosomal escape remain separate constraints.');
add('rna','Framework','ASOs / autophagy / epigenetic silencers','Modality-selection examples','Different cellular engines','Class-level comparators in the failure-atlas discussion.','No specific compound or quantitative performance assigned.');
for(const [name,target,receptor,lesson] of [
 ['IGF_EndoTags / IGF_EndoTag2','EGFR','IGF2R','Conformational triggering depends on receptor-domain geometry.'],
 ['ASGPR EndoTags','EGFR','ASGPR','Multivalency and receptor clustering alter uptake.'],
 ['TfR_EndoTag','EGFR','TFRC','Uses a cycling receptor with a distinct transferrin-binding site.'],
 ['Sortilin EndoTags','EGFR','SORT1','Constitutive trafficking and binding-site selection enable lysosomal routing.'],
 ['EGFR minibinder / cetuximab–EndoTag','EGFR','IGF2R','Target-binding architecture and routing arm can be varied independently.'],
 ['Atezolizumab–EndoTag','PD-L1','IGF2R','Targeted routing differs from antibody blockade alone.'],
 ['Protein G–EndoTag','Soluble IgG','IGF2R','Extracellular clearance must be reconciled with uptake capacity.'],
 ['Secreted EGFRn–EndoTag','Bystander-cell EGFR','IGF2R','Secretion and receptor availability add spatial constraints.'],
 ['BCL2–EndoTag2 / Co-LOCKR','EGFR gated by HER2','IGF2R','Logic-gated recruitment; BCL2 is an assembly component here, not the degraded target.'],
 ['EndoTag–ligand / ortho-SNIPR','Synthetic signaling circuit','Endocytic receptor','Endosomal signal amplification is a reporter outcome, not target degradation.'],
 ['M6P / GalNAc LYTAC comparators','Extracellular targets','IGF2R / ASGPR','Native-cargo competition differs from engineered receptor engagement.']
])add('endo',name.includes('SNIPR')?'Reporter comparator':'Lysosomal',name,target,receptor,lesson,'Not modeled by the E3-mediated PROTAC model. The routing calculator is an explicitly reduced illustration.');
for(const name of ['Degrader-antibody conjugates (DACs)','Molecular glue–antibody conjugates (MACs)','Antibody-based extracellular degradation'])add('pegs','Delivery comparator',name,'Article discusses target classes','Not specified','Antibody-guided delivery or extracellular routing changes where the effector can act.','No specific construct or receptor identity is invented for a class-level example.');
add('rta','Reporter comparator','dTAG-Vm / dTAG-V / dTAG-48','FKBP12 F36V fusion constructs','VHL for dTAG-Vm/V','Universal fusion-tag depletion supports calibration across constructs.','Degradation of a tagged ATM, PARP1, PRMT9, RIOK3 or MEK1 does not establish druggability of the untagged protein.');
for(const [name,target,e3,text] of [
 ['HRZ-01-089-1','UBE2S; CK1α liability','CRBN','Endogenous UBE2S degradation validated after the reporter screen.'],
 ['HRZ-01-182-1','UBE2S; CK1α comparator','CRBN','Endogenous validation and CRBN dependence; improved selectivity is assay-contextual.'],
 ['Tacrolimus / pimecrolimus / ascomycin','MYC','Indirect destabilization','Macrolide reporter hits are not direct MYC-recruiting degraders.'],
 ['ACBI1 / cis-ACBI1','SMARCA4','VHL','Active degrader and inactive stereochemical control.'],
 ['ACBI2 / cis-ACBI2','PBRM1','VHL','Active degrader and inactive control in the RTA study.'],
 ['LC-2','KRAS G12C','Not assigned here','Covalent PROTAC provides another route to target downregulation.'],
 ['BI-3802 / BI-5273','BCL6','Not assigned here','Polymerization-coupled degradation with an inactive control.'],
 ['Mumps virus V protein','STAT3','Protein-based degrader','Viral protein-induced depletion differs from a small-molecule PROTAC.'],
 ['SHP2-AdPROM','SHP2; secondary BCL6 change','Protein-based degrader','Direct targeting of SHP2 can create secondary network effects.'],
 ['SHP1 / PTPN1 siRNA; MAX siRNA','SHP1 / PTPN1; indirect MYC','Not E3 recruitment','Synthesis suppression or loss of a stabilizing partner can activate the same reporter.'],
 ['EGF / SJF-1521','EGFR','Lysosomal routing','Different stimuli can produce EGFR loss and the same reporter output.'],
 ['CRBN degrader 6–5–5','CRBN','VHL-recruiting control','Interferes with the receptor required for the UBE2S glue response.'],
 ['BET inhibitors / JQ1','Reporter transcription','Not a degrader assignment','Pan-circuit transcriptional effects demand a counter-screen.'],
 ['Thalidomide / indisulam / CR8','CRBN context / RBM39 / cyclin K','CRBN / DCAF15 / DDB1','Historical discovery comparators; CR8 engages CDK12 to promote cyclin K loss.'],
 ['Vepdegestrant / BMS-986365 / BGB-16673','Clinical-pipeline comparators','Not assigned here','Named pipeline examples in the article’s counterargument.']
])add('rta',name.includes('cis-')?'Control':name.includes('HRZ')?'Molecular glue':'Reporter comparator',name,target,e3,text,'Primary-paper additions are marked as supporting examples; reporter EC50 is not DC50, and no current clinical status is claimed.');
for(const name of ['Splicing-modifier / U1–RNA system','Kinesin–microtubule lock','HIV integrase–DNA inhibitors','Topoisomerase–DNA poisons','Glucocorticoid receptor / p53 / pioneer factors','GAGA factor chromatin residence','Bromodomain degrader lifetime comparison'])add('clocks','Kinetic comparator',name,'Article’s kinetic comparison','Not assigned','Illustrates machine, drug-residence and repair timescales.','The archive article does not name every compound. No invented drug identity, validated rate or safety prediction is assigned.');
for(const name of ['dBET1','dBET23','dBET57','dBET70'])add('dynamics','PROTAC',name,'BRD4 BD1','CRBN','Named in the linked primary study, not the short article post.','Same target and recruiter do not imply the same dynamic ensemble. This app does not perform MD or infer linker entropy.');
export const examples=rows;
