import fs from 'node:fs/promises';
let p='src/rescue-world.js',s=await fs.readFile(p,'utf8');s=s.replace("world.mode='rescue';world.state=","world.mode='rescue-loading';world.state=");s=s.replace('};world.rescueRuntime=rt;','};world.mode=\'rescue\';world.rescueRuntime=rt;');await fs.writeFile(p,s);
p='src/main.js';s=await fs.readFile(p,'utf8');s=s.replace("}else if(modalType)return;","}else if(modalType&&world.mode!=='rescue')return;");await fs.writeFile(p,s);
