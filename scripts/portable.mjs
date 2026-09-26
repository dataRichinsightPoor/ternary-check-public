import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('dist');
const html=await readFile(path.join(root,'index.html'),'utf8');
const assetFiles=await readdir(path.join(root,'assets'));
const mainName=assetFiles.find(x=>/^index-.*\.js$/.test(x));
const cssName=assetFiles.find(x=>/^index-.*\.css$/.test(x));
if(!mainName||!cssName)throw Error('Run npm run build first.');
let main=await readFile(path.join(root,'assets',mainName),'utf8');
// The production entry embeds the worker through Vite's worker&inline loader.
// Both hosted sandbox and file:// editions use the same worker construction.
const [css,vendor,pdb,license]=await Promise.all([
 readFile(path.join(root,'assets',cssName),'utf8'),
 readFile(path.join(root,'vendor/3Dmol-min.js'),'utf8'),
 readFile(path.join(root,'data/5T35.pdb'),'utf8'),
 readFile(path.join(root,'vendor/DEPENDENCY-LICENSES.txt'),'utf8')
]);
const safe=s=>s.replace(/<\/script/gi,'<\\/script');
const encoded=s=>Buffer.from(s).toString('base64');
const bootstrap=`
// Embedded public data, no upload or server component. External lookups remain opt-in.
const decode=s=>new TextDecoder().decode(Uint8Array.from(atob(s),c=>c.charCodeAt(0)));
const embedded={"./data/5T35.pdb":decode("${encoded(pdb)}")};
const nativeFetch=window.fetch.bind(window);
window.fetch=(input,options)=>Object.prototype.hasOwnProperty.call(embedded,String(input))
 ?Promise.resolve(new Response(embedded[String(input)],{status:200,headers:{"Content-Type":String(input).endsWith(".json")?"application/json":"text/plain"}}))
 :nativeFetch(input,options);
`;
let result=html.replace(/<script src="\.\/vendor\/3Dmol-min\.js"><\/script>/,'')
 .replace(/<script type="module" crossorigin src="[^"]+"><\/script>/,'')
 .replace(/<link rel="stylesheet" crossorigin href="[^"]+">/,()=>`<style>${css}</style>`);
result=result.replace('</body>',()=>`<script>${safe(bootstrap)}</script><script>${safe(vendor)}</script><script type="module">${safe(main)}</script>\n<script type="text/plain" id="third-party-license">${safe(license)}</script></body>`);
await mkdir('portable',{recursive:true});
await writeFile('portable/Ternary-Check.html',result);
console.log(`Portable browser edition: ${Buffer.byteLength(result).toLocaleString()} bytes. Open portable/Ternary-Check.html directly in a current desktop browser.`);
