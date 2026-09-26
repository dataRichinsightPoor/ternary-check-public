import {chromium} from 'playwright';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});
const checks=[],errors=[];
const check=(name,ok)=>{checks.push({name,ok});if(!ok)throw Error(name);};
const origin='https://worker-test.invalid';
const edition=process.env.TEST_URL?'portable':'static';
try{
 for(const mode of ['sandbox','construction','runtime','message','timeout']){
  console.log(`Worker QA: ${edition} / ${mode}`);
  const context=await browser.newContext({viewport:{width:1440,height:1050}});
  await context.route(`${origin}/**`,async route=>{
   const pathname=new URL(route.request().url()).pathname;
   if(pathname==='/host')return route.fulfill({contentType:'text/html',body:`<iframe title="App" sandbox="allow-scripts allow-downloads" src="${origin}/" style="border:0;width:100%;height:98vh"></iframe>`});
   const file=pathname==='/'?(edition==='portable'?'portable/Ternary-Check.html':'dist/index.html'):'dist'+pathname;
   try{await route.fulfill({body:await readFile(file),headers:{'access-control-allow-origin':'*'},contentType:({'.js':'application/javascript','.css':'text/css','.html':'text/html','.pdb':'text/plain'})[path.extname(file)]??'application/octet-stream'});}
   catch{await route.fulfill({status:404,body:'Not found'});}
  });
  if(mode!=='sandbox')await context.addInitScript(mode=>{
   const NativeWorker=window.Worker, nativeTimer=window.setTimeout;
   window.__blockWorker=true;
   // Retry is a real user click, and restores native Worker construction.
   document.addEventListener('click',e=>{if(e.target.closest?.('#analyze'))window.__blockWorker=false;},true);
   if(mode==='timeout')window.setTimeout=(fn,ms,...args)=>nativeTimer(fn,window.__blockWorker&&ms===120000?250:ms,...args);
   window.Worker=class{
    constructor(...args){
     if(!window.__blockWorker)return new NativeWorker(...args);
     if(mode==='construction')throw new DOMException('Test browser policy blocks workers','SecurityError');
    }
    postMessage(){
     if(mode==='runtime')nativeTimer(()=>this.onerror?.({preventDefault(){}}),30);
     if(mode==='message')nativeTimer(()=>this.onmessageerror?.({}),30);
    }
    terminate(){}
    addEventListener(){}
   };
  },mode);
  const page=await context.newPage();
  page.on('pageerror',e=>errors.push(`${mode}: ${e.message}`));
  await page.goto(`${origin}/host`,{waitUntil:'domcontentloaded'});
  const app=page.frameLocator('iframe');
  if(mode==='sandbox'){
   await app.locator('#save-run:not([disabled])').waitFor({timeout:45000});
   check(`${edition}: opaque-origin worker completes`,Number.parseFloat(await app.locator('#metrics strong').first().innerText())>0);
   check(`${edition}: iframe origin is opaque`,await page.frames()[1].evaluate(()=>self.origin)==='null');
   await app.locator('#points').selectOption('128');
   await app.locator('#analyze').click();
   await app.locator('#save-run:not([disabled])').waitFor();
   check(`${edition}: sandbox rerun completes`,!(await app.locator('#analysis-status').innerText()).includes('Calculating'));
   await mkdir('qa',{recursive:true});
   await page.screenshot({path:`qa/${edition}-sandbox-worker.png`});
  }else{
   await app.locator('#analyze:not([disabled])').waitFor();
   const expected={construction:'could not start',runtime:'could not run',message:'could not be read',timeout:'timed out'}[mode];
   await app.locator('#analysis-status').filter({hasText:expected}).waitFor();
   check(`${edition}: ${mode} error persists in status`,(await app.locator('#analysis-status').innerText()).includes(expected));
   check(`${edition}: ${mode} failure leaves no exportable result`,await app.locator('#save-run').isDisabled());
   await app.locator('#analyze').click();
   await app.locator('#save-run:not([disabled])').waitFor({timeout:45000});
   check(`${edition}: ${mode} retry recovers`,!(await app.locator('#analysis-status').innerText()).includes(expected));
  }
  await context.close();
 }
 check(`${edition}: no unhandled browser errors`,errors.length===0);
 await writeFile('qa/worker-results.json',JSON.stringify({edition,checks,errors},null,2));
 console.log(JSON.stringify({edition,passed:checks.length,errors}));
}finally{await browser.close();}
