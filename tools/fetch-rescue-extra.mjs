import fs from 'node:fs/promises';
const dir='public/assets/rescue';
for(const [url,name] of [['https://texasdebrazil.com/wp-content/uploads/2021/04/homepage-mobile.jpg.png','restaurant.jpg'],['https://texasdebrazil.com/wp-content/uploads/2019/05/TDB-04.png','restaurant-logo.png']]){const r=await fetch(url);if(!r.ok)throw Error(url);await fs.writeFile(dir+'/'+name,Buffer.from(await r.arrayBuffer()));}
const r=await fetch('https://api.github.com/repos/flawlesshappiness/EmotionCreatures/git/trees/main?recursive=1');const tree=await r.json();console.log((tree.tree||[]).filter(x=>/Men|Male|Casual/.test(x.path)&&/gltf$/i.test(x.path)).map(x=>x.path));
