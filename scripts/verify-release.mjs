import {execFileSync} from 'node:child_process';
import {mkdir,writeFile,copyFile,readdir,rm} from 'node:fs/promises';
import {buildInventory} from './build-inventory.mjs';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const run=(command,args,env=process.env)=>execFileSync(command,args,{encoding:'utf8',env,timeout:180000,maxBuffer:12*1024*1024});
if(run('git',['status','--porcelain']).trim())throw Error('Commit source changes before release verification.');
const commit=run('git',['rev-parse','HEAD']).trim();
await mkdir('qa',{recursive:true});
await rm('qa/release-source.json',{force:true});
console.log(run('npm',['run','portable']));
console.log(run(process.execPath,['scripts/distribution-check.mjs']));
await writeFile('qa/release-unit.tap',run(process.execPath,['--test',...(await readdir('tests')).filter(f=>f.endsWith('.test.js')).sort().map(f=>`tests/${f}`)]));
await writeFile('qa/release-crosscheck.json',run('python',['tests/crosscheck.py']));
await writeFile('qa/release-kinetics.json',run('python',['tests/kinetics-crosscheck.py']));
for(const edition of ['static','portable']){
 const env={...process.env};
 if(edition==='portable')env.TEST_URL=pathToFileURL(path.resolve('portable/Ternary-Check.html')).href;
 else delete env.TEST_URL;
 for(const [script,result] of [['browser-qa.mjs','browser'],['library-qa.mjs','library'],['worker-qa.mjs','worker']]){
  const output=run(process.execPath,[`tests/${script}`],env);
  await writeFile(`qa/release-${edition}-${result}.log`,output);
  await copyFile(`qa/${result}-results.json`,`qa/release-${edition}-${result}.json`);
  console.log(`${edition}: ${script} passed.`);
 }
}
if(run('git',['rev-parse','HEAD']).trim()!==commit||run('git',['status','--porcelain']).trim())throw Error('Source changed during verification.');
await writeFile('qa/release-source.json',JSON.stringify({commit,verifiedAtUTC:new Date().toISOString(),build:await buildInventory()})+'\n');
console.log('Release verification complete. Run npm run release:package on this exact commit.');
