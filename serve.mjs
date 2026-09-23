// Local-only production launcher. No build tools or dependencies needed at runtime.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.join(here,'dist');
if(!fs.existsSync(path.join(root,'index.html'))){console.error('먼저 pnpm build를 실행해 주세요.');process.exit(1);}
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.glb':'model/gltf-binary','.woff2':'font/woff2','.mp3':'audio/mpeg','.wav':'audio/wav','.json':'application/json'};
const server=http.createServer((req,res)=>{
 let name;try{name=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);}catch{res.writeHead(400);res.end();return;}
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
 const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));
 if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 fs.stat(file,(err,stat)=>{if(err||!stat.isFile()){res.writeHead(404);res.end('Not found');return;}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Content-Length':stat.size,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});if(req.method==='HEAD'){res.end();return;}fs.createReadStream(file).pipe(res);});
});
const port=5178,url=`http://127.0.0.1:${port}`;
function open(){if(process.argv.includes('--no-open'))return;if(process.platform==='win32'){const p=spawn('explorer.exe',[url],{detached:true,stdio:'ignore',windowsHide:true});p.unref();}else console.log(url);}
server.on('error',e=>{if(e.code==='EADDRINUSE'){http.get(url,res=>{let data='';res.on('data',c=>data+=c);res.on('end',()=>{if(data.includes('오백 번째 기억')){open();console.log('이미 실행 중인 게임을 열었습니다.');}else console.error('5178 포트를 다른 프로그램이 사용하고 있습니다.');process.exit(0);});}).on('error',()=>process.exit(1));}else{console.error(e);process.exit(1);}});
server.listen(port,'127.0.0.1',()=>{console.log(`오백 번째 기억: ${url}\n이 창을 닫으면 게임 서버가 종료됩니다.`);open();});
