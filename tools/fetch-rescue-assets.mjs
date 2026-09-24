import fs from 'node:fs/promises';
const dir='public/assets/rescue';await fs.mkdir(dir,{recursive:true});
async function get(url){const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(45000)});if(!r.ok)throw Error(r.status+' '+url);return r;}
async function download(url,name){await fs.writeFile(dir+'/'+name,Buffer.from(await(await get(url)).arrayBuffer()));console.log(name);}
const tasks=[
 ['https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson','countries.geojson'],
 ['https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_1_states_provinces.geojson','states.geojson'],
 ['https://image.shinsegaev.com/upload/C00001/goods/org/933/230809005940933.jpg?RS=750&SP=1','tomboy-coat.jpg']
];await Promise.all(tasks.map(async([u,n])=>{try{await download(u,n);}catch(e){console.log(e.message);}}));
const products=[];for(const category of ['mens-shirts','tops','womens-dresses']){const data=await(await get('https://dummyjson.com/products/category/'+category)).json();products.push(...data.products.map(p=>({id:'garment-'+p.id,name:p.title,image:p.images[0],category,source:'https://dummyjson.com/products/'+p.id})));}
try{const data=await(await get('https://fakestoreapi.com/products')).json();products.push(...data.filter(p=>p.category.includes('clothing')).map(p=>({id:'garment-f'+p.id,name:p.title,image:p.image,category:p.category,source:'https://fakestoreapi.com/products/'+p.id})));}catch(e){console.log(e.message);}
const garments=[];for(const p of products.slice(0,20)){try{await download(p.image,p.id+'.jpg');garments.push({...p,photo:'/assets/rescue/'+p.id+'.jpg'});}catch(e){console.log(e.message);}}
await fs.writeFile(dir+'/garments-source.json',JSON.stringify(garments,null,2));
for(const [label,url] of [['polo','https://www.ralphlauren.com/men-clothing-sweaters/cotton-full-zip-sweater/606443.html?dwvar_606443_colorname=Navy%20Heather'],['restaurant','https://texasdebrazil.com/']]){try{const html=await(await get(url)).text();await fs.writeFile('tools/'+label+'-source.html',html);const images=[...html.matchAll(/(?:src|content|data-src)=["']([^"']+\.(?:jpg|png|webp)[^"']*)["']/gi)].map(m=>m[1]);console.log(label,JSON.stringify(images.slice(0,25)));}catch(e){console.log(label,e.message);}}
