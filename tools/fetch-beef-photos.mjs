// Download documented photographs, without generated artwork or remote hotlinks.
import fs from 'node:fs/promises';
const cuts=[
 ['ansim','안심','Eye Fillet, Grass-Fed Beef.jpg'],
 ['salchi','살치살','Hokkaido Beef "Zabuton".jpg'],
 ['deungsim','등심','4 rib eye steaks being prepped for cooking.JPG'],
 ['chaekkeut','채끝','StripSteak.jpg'],
 ['udun','우둔살','Beef round top round steak in pan, raw.jpg'],
 ['galbi','갈비','Bone-in chuck short ribs.jpg'],
];
const dir='public/assets/beef-photos';await fs.mkdir(dir,{recursive:true});
const headers={'User-Agent':'500DayEscapeRoom/1.0 (photo attribution; https://github.com/him55710-sudo/500)'};
const query=new URLSearchParams({action:'query',format:'json',prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'960',titles:cuts.map(c=>'File:'+c[2]).join('|')});
const response=await fetch('https://commons.wikimedia.org/w/api.php?'+query,{headers,signal:AbortSignal.timeout(30000)});
if(!response.ok)throw Error('Commons metadata: '+response.status);
const pages=Object.values((await response.json()).query.pages),sources=[];
const plain=s=>s?.replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').trim()||'';
for(const [id,name,title]of cuts){
 const info=pages.find(p=>p.title==='File:'+title)?.imageinfo?.[0];if(!info)throw Error('Missing photo: '+title);
 const url=info.thumburl||info.url,r=await fetch(url,{headers,signal:AbortSignal.timeout(30000)});
 if(!r.ok||!r.headers.get('content-type')?.startsWith('image/'))throw Error('Photo download failed: '+title+' '+r.status);
 await fs.writeFile(`${dir}/${id}.jpg`,Buffer.from(await r.arrayBuffer()));
 const m=info.extmetadata;
 sources.push({id,name,file:`${id}.jpg`,title,source:info.descriptionurl,download:url,author:plain(m.Artist?.value),license:plain(m.LicenseShortName?.value),licenseUrl:m.LicenseUrl?.value,description:plain(m.ImageDescription?.value),changes:'Wikimedia thumbnail at 960px; displayed with CSS object-fit: contain. No generated imagery.'});
 console.log(id,sources.at(-1).license);
}
await fs.writeFile(`${dir}/sources.json`,JSON.stringify(sources,null,2)+'\n');
await fs.writeFile('src/beef-photos.json',JSON.stringify(sources,null,2)+'\n');
await fs.writeFile(`${dir}/CREDITS.md`,'# Beef cut photographs\n\nActual photographs from Wikimedia Commons. Individual image licenses apply.\n\n'+sources.map(s=>`- **${s.name}**: [${s.title}](${s.source}) — ${s.author}; [${s.license}](${s.licenseUrl}). ${s.changes}`).join('\n')+'\n');
