import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1280,height:800}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const label=process.argv[2]||'after';
try{
 await page.goto('http://127.0.0.1:5179/?e2e=1',{waitUntil:'networkidle'});
 await page.locator('#start:not([disabled])').waitFor({timeout:120000});
 await page.screenshot({path:`test-results/${label}-poster.png`});
 await page.locator('#start').click();
 await page.waitForFunction(()=>window.__roomTest?.ready,null,{timeout:120000});
 await page.waitForTimeout(1800);
 await page.evaluate(()=>{window.__roomTest.setPosition(0,3.5);window.__roomTest.look(-2,2,-4);});
 const frames=await page.evaluate(()=>new Promise(resolve=>{const list=[];let prev=performance.now(),start=prev;function frame(now){list.push(now-prev);prev=now;if(now-start<8000)requestAnimationFrame(frame);else resolve(list);}requestAnimationFrame(frame);}));
 const view=await page.evaluate(()=>window.__roomTest.view());
 await page.screenshot({path:`test-results/${label}-room.png`});
 frames.sort((a,b)=>a-b);
 const report={label,viewport:'1280x800',frames:frames.length,averageFps:+(1000/(frames.reduce((a,b)=>a+b,0)/frames.length)).toFixed(1),p50Ms:frames[Math.floor(frames.length*.5)],p95Ms:frames[Math.floor(frames.length*.95)],view,errors};
 await fs.writeFile(`test-results/performance-${label}.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close();}
