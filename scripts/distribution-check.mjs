import {existsSync,readFileSync,readdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const blocked=['public/data/ubibrowser.json','tests/fixtures/literature.E3.txt'];
for(const file of blocked)if(existsSync(file))throw Error(`Provider dataset must not be distributed: ${file}`);
const tree=execFileSync('git',['ls-files'],{encoding:'utf8'}).split('\n');
for(const file of tree.filter(f=>existsSync(f)&&/\.(json|txt|tsv|csv|js|html)$/.test(f))){
 if(file.includes('/vendor/')||file==='package-lock.json')continue;
 const text=readFileSync(file,'utf8');
 if(text.includes('"e3Acc"')&&text.includes('"sourceId"')&&text.length>100000)throw Error(`Unexpected bulk interaction payload: ${file}`);
}
if(JSON.parse(readFileSync('package.json')).license!=='MIT')throw Error('Project license metadata missing');
if(!readFileSync('LICENSE','utf8').includes('MIT License'))throw Error('MIT license missing');
if(existsSync('dist')){
 const files=readdirSync('dist/data');
 if(files.some(f=>f!=='5T35.pdb'))throw Error('Unexpected distributed data asset');
 for(const f of ['LICENSE.txt','THIRD-PARTY-NOTICES.md','vendor/DEPENDENCY-LICENSES.txt'])if(!existsSync('dist/'+f))throw Error(`Missing distributed notice: ${f}`);
}
console.log('Distribution guard passed: no bundled UbiBrowser dataset; project license and notices present.');
