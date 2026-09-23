import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
const label=process.argv[2]||'after';
const room=process.argv[3]||'salon';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1280,height:800}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.addInitScript(()=>localStorage.setItem('hayoung500.settings',JSON.stringify({version:2,quality:'high',motion:false,scares:false})));
 await page.goto(`http://127.0.0.1:5186/?e2e=1${room==='heaven'?'&preview=heaven':''}`,{waitUntil:'networkidle'});
 await page.locator(room==='heaven'?'#princess-preview':'#start').click();
 await page.locator('#hud').waitFor({state:'visible',timeout:120000});await page.waitForFunction(()=>window.__roomTest?.ready);
 await page.addStyleTag({content:'#hud,#resume-capture,#subtitle{visibility:hidden!important}'});
 await page.evaluate(room=>{window.__roomTest.setPosition(room==='heaven'?.5:0,room==='heaven'?4.2:3.5);window.__roomTest.look(room==='heaven'?-1:-1.5,2.2,-3.5);},room);
 await page.waitForTimeout(1000);
 const frames=await page.evaluate(()=>new Promise(resolve=>{const times=[];let start=performance.now(),last=start;function tick(now){times.push(now-last);last=now;if(now-start<4000)requestAnimationFrame(tick);else resolve(times);}requestAnimationFrame(tick);}));
 await page.screenshot({path:`test-results/look-${room}-${label}.png`});
 const view=await page.evaluate(()=>window.__roomTest.view());
 if(room==='salon'){await page.evaluate(()=>window.__roomTest.focus('violinist'));await page.waitForTimeout(200);await page.screenshot({path:`test-results/look-dolls-${label}.png`});}
 const report={room,label,viewport:[1280,800],view,averageFps:+(frames.length*1000/frames.reduce((a,b)=>a+b,0)).toFixed(1),errors};
 await fs.writeFile(`test-results/look-${room}-${label}.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 if(errors.length)throw new Error(errors.join('\n'));
}finally{await browser.close();}
