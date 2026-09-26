// Original, fabricated parser/GUI fixtures. NOT biological evidence.
// Never bundled into the application or represented as database observations.
export const headers=['NUMBER','SwissProt ID (E3)','SwissProt ID (Substrate)','SwissProt AC (E3)','SwissProt AC (Substrate)','Gene Symbol (E3)','Gene Symbol (Substrate)','SOURCE','SOURCEID','SENTENCE','E3TYPE','COUNT','type','species'];
export const syntheticTSV=[headers.join('\t'),...Array.from({length:20},(_,i)=>[
 `SYNTHETIC-${i+1}`,'TEST_E3','TEST_SUB','TESTE3','TESTSUB',
 i%2?'VHL':'CRBN',`SYNTHETIC_TARGET_${i+1}`,'SYNTHETIC','TEST_ONLY',
 '<b>Synthetic software-test record. Not a biological interaction.</b>',
 'TEST_ONLY','1','SYNTHETIC',i<16?'H.sapiens':'M.musculus'
].join('\t'))].join('\n');
