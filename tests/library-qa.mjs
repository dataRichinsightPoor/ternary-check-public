import {chromium} from 'playwright';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {articles,examples} from '../src/examples.js';
import {roles,filterInteractions,parseInteractionTSV} from '../src/evidence.js';
import {syntheticTSV} from './fixtures/synthetic-interactions.js';
import {createHash} from 'node:crypto';
const root=path.resolve('dist'),db={rows:parseInteractionTSV(syntheticTSV),manifest:{sha256:createHash('sha256').update(syntheticTSV).digest('hex')}};
const fixture={name:'synthetic-software-test.tsv',mimeType:'text/plain',buffer:Buffer.from(syntheticTSV)};
await mkdir('qa',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
// Serve only local build files. Live UniProt requests are real except explicit failure tests.
await context.route('http://127.0.0.1:4173/**',async route=>{
 const p=decodeURIComponent(new URL(route.request().url()).pathname),file=path.join(root,p==='/'?'index.html':p);
 const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.pdb':'text/plain','.json':'application/json'};
 try{await route.fulfill({body:await readFile(file),contentType:mime[path.extname(file)]??'application/octet-stream'});}
 catch{await route.fulfill({status:404,body:'Not found'});}
});
const page=await context.newPage(),errors=[],checks=[],requests=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('request',r=>requests.push({url:r.url(),method:r.method()}));
const check=(name,ok)=>{checks.push({name,ok});if(!ok)throw Error(name);};
const download=async selector=>{
 const promise=page.waitForEvent('download');await page.locator(selector).click();const d=await promise;
 await d.saveAs('qa/'+d.suggestedFilename());return readFile(await d.path(),'utf8');
};
const screenshot=async name=>{await page.screenshot({path:`qa/${name}.png`});};
try{
 await page.goto(process.env.TEST_URL??'http://127.0.0.1:4173/',{waitUntil:'networkidle'});
 await page.waitForFunction(()=>document.querySelector('#save-run')&&!document.querySelector('#save-run').disabled);
 await page.locator('[data-page=library]').click();
 check('88 case records visible',await page.locator('.case-row').count()===88);
 await screenshot('desktop-examples');
 await page.locator('#coverage-toggle').click();
 check('14 source groups and coverage caveat',await page.locator('.article-index>div').count()===14 && (await page.locator('#coverage').innerText()).includes('not a claim'));
 await page.locator('#coverage-toggle').click();
 const exported=JSON.parse(await download('#export-library'));
 check('library export includes 88 cases and 14 sources',exported.examples.length===88&&exported.articles.length===14);
 for(const x of examples){
  await page.locator(`[data-case="${x.id}"]`).click();
  check('case renders '+x.id,await page.locator('#case-detail>h2').innerText()===x.name && (await page.locator('.case-boundary').innerText()).includes(x.boundary));
 }
 await page.locator('#case-search').fill('HRZ-01-089-1');
 check('search updates selected evidence',await page.locator('.case-row').count()===1 && await page.locator('#case-detail>h2').innerText()==='HRZ-01-089-1');
 await page.locator('#lens-input').focus();await page.keyboard.press('Home');
 check('reporter zero loss returns zero',await page.locator('#lens-value').innerText()==='0.0');
 await page.keyboard.press('End');
 check('reporter amplifier not a linear loss readout',await page.locator('#lens-value').innerText()==='100.0');
 const note=await download('#case-export');
 check('case note has sources and hypothetical inputs',note.includes('https://pmc.ncbi.nlm.nih.gov/articles/PMC13228303/')&&note.includes('not compound data')&&note.includes('Slider input: 100'));
 check('case note preserves publication and manuscript provenance',note.includes('https://www.cell.com/cell/fulltext/S0092-8674(26)00936-0')&&note.includes('Source note:'));
 await page.locator('#case-search').fill('NONEXISTENTZZZ');
 check('empty search removes unrelated detail',await page.locator('.case-row').count()===0&&(await page.locator('#case-detail').innerText()).includes('No matching case'));
 await page.locator('#case-search').fill('');
 for(const a of articles){
  await page.locator('#case-article').selectOption(a.id);
  check('article filter '+a.id,await page.locator('.case-row').count()===examples.filter(x=>x.article===a.id).length);
 }
 await page.locator('#case-article').selectOption('all');
 await page.locator('#case-category').selectOption('Lysosomal');
 check('mechanism category filter',await page.locator('.case-row').count()===examples.filter(x=>x.category==='Lysosomal').length);
 await page.locator('#case-category').selectOption('all');
 for(const [q,expectedStart,expectedEnd] of [['Heme','0.0','30.0'],['IGF_EndoTags','0.0','66.7'],['Albumin-hitchhiking','100.0','17.7'],['dHTC1','100.0','9.1']]){
  await page.locator('#case-search').fill(q);await page.locator('.case-row').first().click();
  await page.locator('#lens-input').focus();await page.keyboard.press('Home');
  check(q+' illustration minimum',await page.locator('#lens-value').innerText()===expectedStart);
  await page.keyboard.press('End');check(q+' illustration maximum',await page.locator('#lens-value').innerText()===expectedEnd);
 }
 await page.locator('#case-search').fill('dHTC3');await page.locator('#case-e3').click();
 await page.waitForSelector('#db-query');
 check('case-to-database recruiter handoff',await page.locator('#db-query').inputValue()==='FBXO3');
 check('database begins empty with actionable import guidance',(await page.locator('#db-results').innerText()).includes('No database is loaded')&&await page.locator('#db-export').isDisabled());
 check('no bundled database request',requests.every(r=>!r.url.includes('ubibrowser.json')));
 await screenshot('desktop-evidence-empty');
 for(const gene of Object.keys(roles)){
  await page.locator(`[data-gene="${gene}"]`).click();
  check('role shortcut '+gene,(await page.locator('#component-info').innerText()).includes(roles[gene][0]) && await page.locator('#db-query').inputValue()===gene);
 }
 await page.locator('[data-gene=CRBN]').click();await screenshot('desktop-evidence');
 await page.locator('#annotation-fetch').click();
 await page.waitForFunction(()=>!document.querySelector('#annotation-fetch').disabled,{timeout:20000});
 const liveText=await page.locator('#annotation-result').innerText();
 console.log('Live UniProt result:',liveText.slice(0,250));
 check('real live UniProt annotation',liveText.includes('Q96SW2')&&liveText.includes('FUNCTION'));
 check('live annotation works without database import',await page.locator('#db-count').innerText()==='0 records');
 await page.locator('#db-file').setInputFiles(fixture);
 await page.waitForFunction(()=>document.querySelector('.db-provenance').textContent.includes('User-imported'));
 check('synthetic fixture imported and labeled',(await page.locator('#db-results').innerText()).includes('Not a biological interaction'));
 await screenshot('desktop-evidence-live');
 await page.locator('#annotation-result').scrollIntoViewIfNeeded();
 await screenshot('desktop-live-annotation');
 await page.locator('#annotation-query').fill('CRBN OR *');await page.locator('#annotation-fetch').click();
 check('query injection rejected',(await page.locator('#annotation-result').innerText()).includes('single gene'));
 await context.route('https://rest.uniprot.org/**',route=>route.abort());
 await page.locator('#annotation-query').fill('VHL');await page.locator('#annotation-fetch').click();
 await page.waitForFunction(()=>!document.querySelector('#annotation-fetch').disabled);
 check('network error preserves local evidence',(await page.locator('#annotation-result').innerText()).includes('remain usable')&&await page.locator('.interaction').count()>0);
 await context.unroute('https://rest.uniprot.org/**');
 await page.locator('#annotation-query').fill('ZZNOEXIST123');await page.locator('#annotation-fetch').click();
 await page.waitForFunction(()=>!document.querySelector('#annotation-fetch').disabled);
 check('live no-match state',(await page.locator('#annotation-result').innerText()).includes('No reviewed human entry'));
 await page.locator('#db-query').fill('');
 check('imported synthetic human count',await page.locator('#db-count').innerText()==='16 records');
 await page.locator('#db-next').click();check('next page',(await page.locator('#db-pages').innerText()).startsWith('Page 2'));
 await page.locator('#db-prev').click();check('previous page',(await page.locator('#db-pages').innerText()).startsWith('Page 1'));
 await page.locator('#db-species').selectOption('all');
 check('all-species synthetic count',await page.locator('#db-count').innerText()==='20 records');
 await page.locator('#db-species').selectOption('M.musculus');
 check('species filter',await page.locator('#db-count').innerText()===filterInteractions(db.rows,{species:'M.musculus'}).length.toLocaleString()+' records');
 await page.locator('#db-species').selectOption('H.sapiens');await page.locator('#db-query').fill('CRBN');
 for(const role of ['e3','substrate','either']){
  await page.locator('#db-role').selectOption(role);
  check('database role '+role,await page.locator('#db-count').innerText()===filterInteractions(db.rows,{query:'CRBN',role}).length.toLocaleString()+' records');
 }
 const evidence=JSON.parse(await download('#db-export'));
 check('evidence export preserves filtered rows and hash',evidence.rows.length===filterInteractions(db.rows,{query:'CRBN'}).length&&evidence.manifest.sha256===db.manifest.sha256);
 const bomBuffer=Buffer.concat([Buffer.from([0xef,0xbb,0xbf]),Buffer.from(syntheticTSV)]);
 const bomHash=createHash('sha256').update(bomBuffer).digest('hex');
 await page.locator('#db-file').setInputFiles({name:'synthetic-bom.tsv',mimeType:'text/plain',buffer:bomBuffer});
 await page.waitForFunction(hash=>document.querySelector('.db-provenance')?.textContent.includes(hash),bomHash);
 check('database fingerprint preserves original byte-order mark', (await page.locator('.db-provenance').innerText()).includes(bomHash));
 await page.locator('#db-query').fill('NONEXISTENTZZZ');
 check('database no-match caveat',(await page.locator('#db-results').innerText()).includes('does not rule out'));
 await page.locator('#db-file').setInputFiles({name:'invalid.tsv',mimeType:'text/plain',buffer:Buffer.from('bad\theaders\n1\t2')});
 await page.waitForFunction(()=>document.querySelector('#db-results').textContent.includes('Existing database retained'));
 check('bad database rejected',(await page.locator('#db-results').innerText()).includes('Existing database retained'));
 await page.locator('#db-file').setInputFiles(fixture);
 await page.waitForFunction(()=>document.querySelector('.db-provenance').textContent.includes('User-imported'));
 check('known-interaction schema imports locally',(await page.locator('.db-status').innerText()).includes('20 records'));
 await page.locator('[data-gene=CRBN]').click();
 await page.locator('#export').click();
 const session=JSON.parse(await download('[data-export=json]'));
 check('session carries library and database context',session.evidenceContext.coverage.length===14&&session.evidenceContext.database.rows===20);
 await page.locator('#export').click();
 const dossier=await download('[data-export=md]');
 const releaseVersion=JSON.parse(await readFile('package.json','utf8')).version;
 check('dossier includes cited evidence context',dossier.includes('Article and database context')&&dossier.includes('ubibrowser.bio-it.cn')&&!dossier.includes('undefined')&&dossier.includes(`App release: ${releaseVersion}`));
 // A real existing structure is replaced by the explicit MZ1 shortcut.
 await page.locator('[data-page=structure]').click();await page.locator('#pdb-id').fill('1BRS');await page.locator('#pdb-form button').click();
 await page.waitForFunction(()=>document.querySelector('.file-tag')?.textContent==='1BRS'&&!document.querySelector('#save-run').disabled);
 await page.locator('[data-page=library]').click();await page.locator('#case-search').fill('MZ1');await page.locator('#case-action').click();
 await page.waitForFunction(()=>document.querySelector('.file-tag')?.textContent==='5T35'&&!document.querySelector('#save-run').disabled);
 check('MZ1 shortcut actually reloads 5T35',await page.locator('.file-tag').innerText()==='5T35');
 for(const theme of ['dark','light']){
  if(theme==='light')await page.locator('#theme').click();
  for(const view of ['library','evidence']){
   await page.locator(`[data-page=${view}]`).click();
   if(view==='library'){await page.locator('#case-search').fill('');await page.locator('#case-article').selectOption('switch');}
   await screenshot(`desktop-${view}-${theme}`);
   check(`desktop ${view} ${theme} fits`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
 }
 await page.locator('#theme').click();
 await page.setViewportSize({width:375,height:812});
 for(const view of ['library','evidence']){
  await page.locator(`[data-page=${view}]`).click();
  await page.locator('h1').scrollIntoViewIfNeeded();await screenshot(`mobile-${view}`);
  check(`375px ${view} fits`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.locator(view==='library'?'#case-detail':'#component-info').scrollIntoViewIfNeeded();
  await screenshot(`mobile-${view}-detail`);
 }
 check('no unhandled browser errors',errors.length===0);
 check('no POST requests or coordinate uploads',requests.every(r=>r.method==='GET'));
 await writeFile('qa/library-results.json',JSON.stringify({checks,errors,externalRequests:requests.filter(r=>!r.url.startsWith('http://127.0.0.1'))},null,2));
 console.log(JSON.stringify({passed:checks.length,errors,liveAnnotation:liveText.slice(0,200)},null,2));
}finally{await browser.close();}
