import fs from 'node:fs/promises';
import path from 'node:path';
const headers={'User-Agent':'MemoryRoomGameAssetResearch/1.0 (personal anniversary game; source credit retained)'};
async function json(url){const r=await fetch(url,{headers});if(!r.ok)throw new Error(r.status+' '+url);return r.json();}
async function download(url,file){await fs.mkdir(path.dirname(file),{recursive:true});const r=await fetch(url,{headers});if(!r.ok)throw new Error(r.status+' '+url);await fs.writeFile(file,new Uint8Array(await r.arrayBuffer()));}
const photos=[['chili','Korean Shrimp Fried Rice.jpg'],['chicken','Fried chicken drumsticks.jpg'],['garlic','Gambas Al Ajillo (Spanish Garlic Shrimp).jpg'],['pepero','Pepero-Almond-Sticks.jpg']];
const records={};
for(const [id,title] of photos){
 const data=await json('https://commons.wikimedia.org/w/api.php?'+new URLSearchParams({action:'query',format:'json',prop:'imageinfo',titles:'File:'+title,iiprop:'url|extmetadata',iiurlwidth:'960'}));
 const info=Object.values(data.query.pages)[0].imageinfo[0],meta=info.extmetadata;
 const file='public/assets/food-reference/'+id+'.jpg';await download(info.thumburl||info.url,file);
 records[id]={title,author:meta.Artist?.value.replace(/<[^>]+>/g,'')||'',license:meta.LicenseShortName?.value,licenseUrl:meta.LicenseUrl?.value,source:info.descriptionurl,remote:info.thumburl||info.url,file,change:'Wikimedia-provided thumbnail; no content edits'};
 console.log(id,records[id].license,(await fs.stat(file)).size);
}
await fs.mkdir('docs/market-references',{recursive:true});await fs.writeFile('docs/market-references/photos.json',JSON.stringify(records,null,2));
for(const id of ['food_apple_01']){
 const data=await json('https://api.polyhaven.com/files/'+id),bundle=data.gltf['1k'].gltf;
 const root='external/polyhaven/'+id;await download(bundle.url,root+'/'+id+'.gltf');
 for(const [file,entry] of Object.entries(bundle.include))await download(entry.url,root+'/'+file);
 await fs.writeFile(root+'/source.json',JSON.stringify({source:'https://polyhaven.com/a/'+id,license:'CC0',bundle},null,2));console.log(id,'downloaded');
}
