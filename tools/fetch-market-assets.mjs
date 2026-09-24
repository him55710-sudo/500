import fs from 'node:fs/promises';
import path from 'node:path';
const headers={'User-Agent':'MemoryRoomGameAssetResearch/1.0 (personal anniversary game; source credit retained)'};
async function json(url){const r=await fetch(url,{headers});if(!r.ok)throw new Error(r.status+' '+url);return r.json();}
async function download(url,file){await fs.mkdir(path.dirname(file),{recursive:true});const r=await fetch(url,{headers});if(!r.ok)throw new Error(r.status+' '+url);await fs.writeFile(file,new Uint8Array(await r.arrayBuffer()));}
// The four recipe photos are supplied by the user. This importer only refreshes
// public-domain grocery props and never overwrites those personal photographs.
for(const id of ['food_apple_01']){
 const data=await json('https://api.polyhaven.com/files/'+id),bundle=data.gltf['1k'].gltf;
 const root='external/polyhaven/'+id;await download(bundle.url,root+'/'+id+'.gltf');
 for(const [file,entry] of Object.entries(bundle.include))await download(entry.url,root+'/'+file);
 await fs.writeFile(root+'/source.json',JSON.stringify({source:'https://polyhaven.com/a/'+id,license:'CC0',bundle},null,2));console.log(id,'downloaded');
}
