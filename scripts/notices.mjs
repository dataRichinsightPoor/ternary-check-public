import {readFile,writeFile,mkdir} from 'node:fs/promises';
const notices=[
 ['Ternary Check original software and documentation: MIT','LICENSE'],
 ['Third-party data and software scope','THIRD-PARTY-NOTICES.md'],
 ['3Dmol.js','public/vendor/3Dmol-LICENSE.txt'],
 ['3Dmol.js bundled-code notices','node_modules/3dmol/build/3Dmol-min.js.LICENSE.txt'],
 ['Chart.js','node_modules/chart.js/LICENSE.md'],
 ['@kurkle/color','node_modules/@kurkle/color/LICENSE.md'],
 ['Lucide','node_modules/lucide/LICENSE'],
 ['iobuffer','node_modules/iobuffer/LICENSE'],
 ['netcdfjs','node_modules/netcdfjs/LICENSE'],
 ['pako','node_modules/pako/LICENSE'],
 ['upng-js','node_modules/upng-js/LICENSE']
];
const contents=await Promise.all(notices.map(async([name,file])=>`${'='.repeat(72)}\n${name}\n${'='.repeat(72)}\n\n${await readFile(file,'utf8')}`));
await mkdir('public/vendor',{recursive:true});
await writeFile('public/vendor/DEPENDENCY-LICENSES.txt',contents.join('\n\n'));
await writeFile('public/LICENSE.txt',await readFile('LICENSE','utf8'));
await writeFile('public/THIRD-PARTY-NOTICES.md',await readFile('THIRD-PARTY-NOTICES.md','utf8'));
console.log(`Collected ${notices.length} dependency notice sections.`);
