import {readFile,writeFile,mkdir,copyFile,readdir,rm} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {buildInventory} from './build-inventory.mjs';
const pkg=JSON.parse(await readFile('package.json','utf8'));
const version=`v${pkg.version}`,out=path.resolve('release',version);
const commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
if(execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim())throw Error('Commit source changes before packaging.');
const source=JSON.parse(await readFile('qa/release-source.json','utf8'));
if(source.commit!==commit)throw Error('Verification receipt belongs to a different source commit.');
if(JSON.stringify(source.build)!==JSON.stringify(await buildInventory()))throw Error('Built files changed after verification. Verify again before packaging.');
execFileSync(process.execPath,['scripts/distribution-check.mjs'],{stdio:'inherit'});
const unit=await readFile('qa/release-unit.tap','utf8');
const tests=Number(unit.match(/# tests (\d+)/)?.[1]),pass=Number(unit.match(/# pass (\d+)/)?.[1]);
if(tests<32||pass!==tests||!/# fail 0\b/.test(unit))throw Error('Current unit test receipt is incomplete or failed.');
const crosscheck=JSON.parse(await readFile('qa/release-crosscheck.json','utf8'));
if(!crosscheck.pass)throw Error('Independent SASA cross-check failed.');
const kinetics=JSON.parse(await readFile('qa/release-kinetics.json','utf8'));
if(!kinetics.pass||kinetics.cases<100||kinetics.washoutCases<100)throw Error('Independent kinetic cross-check incomplete or failed.');
const browser={};
for(const kind of ['static','portable']){
 const baseline=JSON.parse(await readFile(`qa/release-${kind}-browser.json`,'utf8'));
 const library=JSON.parse(await readFile(`qa/release-${kind}-library.json`,'utf8'));
 const worker=JSON.parse(await readFile(`qa/release-${kind}-worker.json`,'utf8'));
 const checks=[...baseline.checks,...library.checks,...worker.checks];
 if(checks.length<214||worker.checks.length<16||checks.some(x=>!x.ok)||baseline.errors.length||library.errors.length||worker.errors.length)throw Error(`Browser receipt failed: ${kind}`);
 browser[kind]={passed:checks.length,errors:[],checks};
}
// Only generated local output for this version is replaced. Published tags and
// remote assets are immutable; old ZIP entries must never survive repackaging.
await rm(out,{recursive:true,force:true});
await mkdir(out,{recursive:true});
await copyFile('portable/Ternary-Check.html',path.join(out,`Ternary-Check-${version}.html`));
await copyFile('public/vendor/DEPENDENCY-LICENSES.txt',path.join(out,'DEPENDENCY-LICENSES.txt'));
await copyFile('LICENSE',path.join(out,'LICENSE.txt'));
await copyFile('THIRD-PARTY-NOTICES.md',path.join(out,'THIRD-PARTY-NOTICES.md'));
execFileSync('git',['archive','--format=zip',`--prefix=ternary-check-${version}/`,`--output=${path.join(out,`ternary-check-${version}-source.zip`)}`,commit]);
execFileSync('zip',['-qr',path.join(out,`ternary-check-${version}-site.zip`),'.'],{cwd:path.resolve('dist')});
const receipt={
 title:`Ternary Check ${version} verification`,version,commit,
 preparedAtUTC:new Date().toISOString(),
 node:process.version,unit:{total:tests,passed:pass,failed:0},
 browser,independentSASA:crosscheck,independentKinetics:kinetics,
 build:source.build,
 scope:'Software verification only. Not biological validation or evidence of predictive efficacy.',
 distribution:'Public clean-history research-prototype release. Original material MIT; no UbiBrowser database redistributed. Earlier private history and assets are excluded.',
 databaseTests:'Synthetic software-test fixtures, not biological interaction evidence.'
};
await writeFile(path.join(out,`ternary-check-${version}-verification.json`),JSON.stringify(receipt,null,2)+'\n');
const files=(await readdir(out)).filter(x=>x!=='SHA256SUMS.txt').sort();
const sums=await Promise.all(files.map(async f=>`${createHash('sha256').update(await readFile(path.join(out,f))).digest('hex')}  ${f}`));
await writeFile(path.join(out,'SHA256SUMS.txt'),sums.join('\n')+'\n');
console.log(JSON.stringify({version,commit,out,files:[...files,'SHA256SUMS.txt'],tests:pass,browserChecksPerEdition:browser.static.passed},null,2));
