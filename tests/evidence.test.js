import test from 'node:test';
import assert from 'node:assert/strict';
import {syntheticTSV} from './fixtures/synthetic-interactions.js';
import {articles,examples} from '../src/examples.js';
import {roles,filterInteractions,parseInteractionTSV,annotationURL,lensValues,emptyDatabase} from '../src/evidence.js';

const raw=Buffer.from(syntheticTSV);
test('case library has unique IDs and valid source assignments',()=>{
 assert.equal(articles.length,14);assert.equal(examples.length,88);
 assert.equal(new Set(examples.map(x=>x.id)).size,88);
 for(const x of examples){assert.ok(articles.some(a=>a.id===x.article));assert.ok(x.evidence&&x.boundary&&x.name);}
});
test('SuFEx examples retain distinct modalities and unresolved classifications',()=>{
 assert.equal(examples.find(x=>x.name==='SR-1114').category,'PROTAC comparator');
 assert.equal(examples.find(x=>x.name==='dHTC2').category,'Degrader · modality unresolved');
 assert.match(examples.find(x=>x.name==='dHTC2').evidence,/remains unresolved/);
 assert.match(examples.find(x=>x.name==='dHTC3').evidence,/classification remains open/);
});
test('no provider data bundled; synthetic fixtures exercise known-interaction schema',()=>{
 assert.equal(emptyDatabase().rows.length,0);
 assert.equal(emptyDatabase().manifest.sha256,null);
 assert.ok(emptyDatabase().manifest.title&&emptyDatabase().manifest.url.startsWith('http://ubibrowser.'));
 const rows=parseInteractionTSV(raw.toString());
 assert.equal(rows.length,20);
 assert.equal(filterInteractions(rows).length,16);
 assert.ok(rows.every(r=>r.source==='SYNTHETIC'&&r.sentence.includes('Not a biological interaction')));
});
test('interaction filters respect case, role and species',()=>{
 const rows=[{e3:'CRBN',substrate:'GSPT1',species:'H.sapiens'},{e3:'VHL',substrate:'CRBN',species:'H.sapiens'},{e3:'CRBN',substrate:'X',species:'M.musculus'}];
 assert.equal(filterInteractions(rows,{query:' crbn '}).length,2);
 assert.equal(filterInteractions(rows,{query:'CRBN',role:'e3'}).length,1);
 assert.equal(filterInteractions(rows,{query:'CRBN',role:'substrate'}).length,1);
 assert.equal(filterInteractions(rows,{query:'CRBN',species:'all'}).length,3);
 assert.equal(filterInteractions(rows,{query:'unknown'}).length,0);
});
test('TSV parser refuses wrong schemas, empty files and ragged rows',()=>{
 assert.throws(()=>parseInteractionTSV('e3\ttarget\nA\tB'));
 const header=raw.toString().split('\n')[0];
 assert.throws(()=>parseInteractionTSV(header),/no interaction/);
 assert.throws(()=>parseInteractionTSV(header+'\nA\tB'),/column count/);
});
test('TSV evidence HTML is removed',()=>{
 const text=raw.toString().split('\n').slice(0,2).join('\n');
 const parsed=parseInteractionTSV(text);
 assert.ok(!/<[^>]*>/.test(parsed[0].sentence));
});
test('TSV preserves empty trailing fields and rejects duplicate headers',()=>{
 const lines=syntheticTSV.trimEnd().split('\n').slice(0,2);
 const header=lines[0]+'\tOPTIONAL',row=lines[1]+'\t';
 assert.equal(parseInteractionTSV('\uFEFF'+header+'\r\n'+row+'\r\n').length,1);
 assert.throws(()=>parseInteractionTSV(lines[0]+'\tSOURCE\n'+lines[1]+'\tTEST'),/known-interaction/);
});
test('annotation requests restrict scope and reject query injection',()=>{
 const u=new URL(annotationURL('CRBN'));
 assert.equal(u.hostname,'rest.uniprot.org');
 assert.match(u.searchParams.get('query'),/organism_id:9606 AND reviewed:true/);
 assert.match(u.searchParams.get('query'),/^gene_exact:CRBN /);
 assert.match(new URL(annotationURL('Q96SW2')).searchParams.get('query'),/^accession:Q96SW2 /);
 for(const value of ['CRBN OR *','<script>','', 'a'.repeat(31)])assert.throws(()=>annotationURL(value));
 assert.ok(annotationURL('Q96SW2'));
});
test('competing clocks and reporter examples preserve endpoints',()=>{
 assert.equal(lensValues('commitment',0).value,100);
 assert.equal(lensValues('commitment',10).value,50);
 assert.equal(lensValues('reporter',0).value,0);
 assert.ok(lensValues('reporter',10).value>50);
 assert.ok(lensValues('reporter',100).value<100);
});
test('routing, localization and synthesis-arrest illustrations preserve limits',()=>{
 assert.equal(lensValues('routing',0).value,0);
 assert.equal(lensValues('routing',50).value,50);
 assert.equal(lensValues('localization',100).value,30);
 assert.equal(lensValues('turnover',0).value,100);
 assert.equal(lensValues('turnover',40).value,50);
});
test('component guide distinguishes receptor, scaffold, adaptor and RING enzyme',()=>{
 assert.equal(roles.CRBN[0],'Substrate receptor');
 assert.equal(roles.DDB1[0],'Adaptor');
 assert.equal(roles.CUL2[0],'Scaffold');
 assert.equal(roles.MDM2[0],'RING E3 ligase');
 assert.equal(roles.RBX1[0],'RING component');
});
