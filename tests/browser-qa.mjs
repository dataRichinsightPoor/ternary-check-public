import { chromium } from 'playwright';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('dist');
await mkdir('qa',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const context=await browser.newContext({viewport:{width:1440,height:1050},acceptDownloads:true});
// Intercept only the local app origin; external RCSB and font requests remain real.
await context.route('http://127.0.0.1:4173/**',async route=>{
  const pathname=decodeURIComponent(new URL(route.request().url()).pathname);
  const file=path.join(root,pathname==='/'?'index.html':pathname);
  const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.pdb':'text/plain','.txt':'text/plain'};
  try{await route.fulfill({body:await readFile(file),contentType:mime[path.extname(file)]??'application/octet-stream'});}
  catch{await route.fulfill({status:404,body:'Not found'});}
});
const page=await context.newPage();
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.TEST_URL??'http://127.0.0.1:4173/',{waitUntil:'networkidle'});
await page.waitForFunction(()=>document.querySelector('#save-run')&&!document.querySelector('#save-run').disabled);
await page.screenshot({path:'qa/desktop-structure.png'});
console.log(JSON.stringify({title:await page.title(),metrics:await page.locator('#metrics').innerText(),canvas:await page.locator('#viewer canvas').count(),errors},null,2));
if(process.argv.includes('--visual-only')){await browser.close();process.exit(0);}
const checks=[];
const check=(name,ok)=>{checks.push({name,ok});if(!ok)throw Error(name);};
const completed=()=>page.waitForFunction(()=>document.querySelector('#save-run')&&!document.querySelector('#save-run').disabled);
await page.locator('#save-run').click();
check('structural run saved',await page.locator('#run-count').innerText()==='1');
await page.locator('#sticks').click();await page.locator('#cartoon').click();
await page.locator('#show-lys').uncheck();await page.locator('#show-lys').check();
await page.locator('#show-ligand').uncheck();await page.locator('#show-ligand').check();
await page.locator('.focus-residue').first().click();
await page.locator('#reset-view').click();
await page.locator('#lys-filter').selectOption('exposed');
check('lysine exposure filter',await page.locator('tbody tr').count()===8);
await page.locator('#lys-filter').selectOption('all');
await page.locator('[data-tab="contacts"]').click();
check('contact view',await page.locator('tbody tr').count()===10);
await page.locator('[data-tab="sensitivity"]').click();
check('sensitivity bars',await page.locator('.sensitivity-chart>div').count()===7);
await page.screenshot({path:'qa/desktop-sensitivity.png'});
await page.locator('[data-tab="lysines"]').click();
await page.locator('#target').selectOption('D');
await page.locator('#analyze').click();
check('same chain error', (await page.locator('#toast').innerText()).includes('different'));
await page.locator('#target').selectOption('E');
await page.locator('#partner').selectOption('H');
await page.locator('#cutoff').fill('5');
await page.locator('#probe').fill('1.5');
await page.locator('#exposure').fill('10');
await page.locator('#points').selectOption('960');
await page.locator('#analyze').click();await completed();
check('changed audit settings', (await page.locator('#metrics').innerText()).includes('5.0 Å'));
await page.locator('#save-run').click();
await page.locator('#pdb-id').fill('BAD');
await page.locator('#pdb-form button').click();
check('invalid PDB ID', (await page.locator('#toast').innerText()).includes('four-character'));
await page.locator('#file-input').setInputFiles({name:'bad.pdb',mimeType:'text/plain',buffer:Buffer.from('invalid')});
await page.waitForFunction(()=>document.querySelector('#toast').textContent.includes('No usable'));
check('malformed file rejected', (await page.locator('#toast').innerText()).includes('No usable'));
await page.locator('#file-input').setInputFiles('public/data/5T35.pdb');
await page.waitForFunction(()=>document.querySelector('.file-tag')?.textContent==='5T35.pdb');await completed();
check('local PDB accepted', (await page.locator('.file-tag').innerText()).includes('5T35.pdb'));
// The local file defaults to A/B; choose the scientifically intended A/D pair.
await page.locator('#target').selectOption('A');await page.locator('#partner').selectOption('D');
await page.locator('#points').selectOption('256');await page.locator('#probe').fill('1.4');await page.locator('#exposure').fill('5');await page.locator('#cutoff').fill('4');
await page.locator('#analyze').click();await completed();
for(const kind of ['csv','json','md','png','kinetics']){
  await page.locator('#export').click();
  const promise=page.waitForEvent('download');
  await page.locator(`[data-export="${kind}"]`).click();
  const d=await promise;
  await d.saveAs('qa/'+d.suggestedFilename());
  check('export '+kind,!(await d.failure()));
  if(await page.locator('#export-dialog').isVisible())await page.locator('#close-dialog').click();
}
await page.locator('#session-input').setInputFiles('qa/ternary-check-session.json');await completed();
await page.waitForFunction(()=>document.querySelector('#run-count').textContent==='0');
await completed();
check('session reimport recomputes', (await page.locator('#metrics').innerText()).includes('8'));
const validSession=JSON.parse(await readFile('qa/ternary-check-session.json','utf8'));
for(const [key,value] of [['overlap',5],['cutoff',40],['probe',0],['exposure',-1]]){
 const session={...validSession,config:{...validSession.config,[key]:value}};
 await page.evaluate(()=>document.querySelector('#toast').textContent='');
 await page.locator('#session-input').setInputFiles({name:'out-of-range.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(session))});
 await page.waitForFunction(()=>document.querySelector('#toast').textContent.includes('Could not import'));
 check(`unsupported ${key} cannot replace valid audit`,!await page.locator('#save-run').isDisabled());
}
await page.locator('#session-input').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"bad":1}')});
await page.waitForFunction(()=>document.querySelector('#toast').textContent.includes('Could not import'));
check('bad session rejected',(await page.locator('#toast').innerText()).includes('Could not import'));
await page.locator('[data-page="mechanism"]').click();
check('mechanism renders',await page.locator('#heatmap button').count()===140);
await page.screenshot({path:'qa/desktop-mechanism.png',fullPage:true});
await page.locator('#heatmap button').nth(25).click();
check('landscape cell inspection',(await page.locator('#heatmap-readout').innerText()).includes('simulated'));
for(const scenario of ['fast','loss','cooperative','baseline']){
 await page.locator('#scenario').selectOption(scenario);
 check('scenario '+scenario,await page.locator('#dose-chart').count()===1);
}
await page.locator('#k-wash').fill('30');await page.locator('#kinetic-form button[type="submit"]').click();
check('invalid washout rejected',(await page.locator('#toast').innerText()).includes('at or before'));
await page.locator('#k-wash').fill('6');await page.locator('#k-e3').fill('3');await page.locator('#kinetic-form button[type="submit"]').click();
await page.locator('#save-scenario').click();
await page.locator('#reset-model').click();
await page.locator('#save-scenario').click();
await page.locator('[data-page="compare"]').click();
check('mechanism comparisons saved',await page.locator('.comparison-card').count()===2);
await page.screenshot({path:'qa/desktop-compare.png'});
await page.locator('.load-scenario').first().click();
check('saved parameters restored',await page.locator('#k-e3').inputValue()==='3');
await page.locator('[data-page="compare"]').click();
await page.locator('.remove-run').first().click();await page.locator('.remove-run').first().click();
check('empty comparison state',await page.locator('#start-compare').count()===1);
await page.locator('[data-page="methods"]').click();
check('methods have model equations',(await page.locator('.methods-prose').innerText()).includes('dT/dt'));
await page.locator('a[href="#method-kinetics"]').click();
await page.screenshot({path:'qa/desktop-methods.png'});
await page.locator('[data-page="structure"]').click();
await page.locator('#theme').click();
const exportContrast=await page.locator('#export').evaluate(el=>{
 const s=getComputedStyle(el),lum=c=>{
  const v=c.match(/[\d.]+/g).slice(0,3).map(x=>Number(x)/255)
   .map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);
  return .2126*v[0]+.7152*v[1]+.0722*v[2];
 };
 const a=lum(s.color),b=lum(s.backgroundColor);
 return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
});
check('light theme Export text meets 4.5:1 contrast',exportContrast>=4.5);
await page.screenshot({path:'qa/desktop-light.png'});
await page.locator('#theme').click();
// Real external fetch verifies RCSB CORS and legacy PDB loading.
await page.locator('#pdb-id').fill('1BRS');await page.locator('#pdb-form button').click();
await page.waitForFunction(()=>document.querySelector('.file-tag')?.textContent==='1BRS'&&!document.querySelector('#save-run').disabled,{timeout:30000});
check('real remote PDB fetch',await page.locator('.file-tag').innerText()==='1BRS');
await page.locator('#example').click();await page.waitForFunction(()=>document.querySelector('.file-tag')?.textContent==='5T35');await completed();
await page.setViewportSize({width:390,height:844});
await page.screenshot({path:'qa/mobile-structure.png',fullPage:true});
check('mobile structure fits viewport',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
await page.locator('[data-page="mechanism"]').click();
await page.screenshot({path:'qa/mobile-mechanism.png',fullPage:true});
check('mobile mechanism fits viewport',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
await page.locator('[data-page="methods"]').click();
await page.screenshot({path:'qa/mobile-methods.png',fullPage:true});
check('mobile methods fits viewport',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
check('no unhandled browser errors',errors.length===0);
await writeFile('qa/browser-results.json',JSON.stringify({checks,errors},null,2));
console.log(JSON.stringify({checks,errors},null,2));
await browser.close();
