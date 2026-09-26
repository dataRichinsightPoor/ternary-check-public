import {readdir,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
export async function buildInventory(){
 const result={};
 const walk=async dir=>{
  for(const entry of (await readdir(dir,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){
   const file=`${dir}/${entry.name}`;
   if(entry.isDirectory())await walk(file);
   else result[file]=createHash('sha256').update(await readFile(file)).digest('hex');
  }
 };
 await walk('dist');await walk('portable');
 return result;
}
