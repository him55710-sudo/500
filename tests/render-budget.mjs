import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const results=[];
try{for(const [label,port] of [['previous',5178],['revised',5179]]){
 const page=await browser.newPage({viewport:{width:1280,height:800}});
 await page.addInitScript(()=>{
  window.__draws=0;window.__shadowSizes=[];
  for(const proto of [WebGLRenderingContext.prototype,WebGL2RenderingContext.prototype]){
   for(const name of ['drawElements','drawArrays','drawElementsInstanced','drawArraysInstanced']){
    if(!proto[name])continue;const original=proto[name];proto[name]=function(...args){window.__draws++;return original.apply(this,args);};
   }
  }
 });
 await page.goto(`http://127.0.0.1:${port}`,{waitUntil:'networkidle'});
 await page.locator('#start:not([disabled])').waitFor({timeout:120000});
 let at=await page.evaluate(()=>window.__draws);await page.waitForTimeout(1000);const posterDraws=(await page.evaluate(()=>window.__draws))-at;
 await page.locator('#start').click();await page.locator('#hud').waitFor({state:'visible',timeout:120000});await page.waitForTimeout(2000);
 const perf=await page.evaluate(()=>new Promise(resolve=>{let t=performance.now(),last=t,lastDraws=window.__draws;const frames=[],calls=[];function tick(now){frames.push(now-last);calls.push(window.__draws-lastDraws);last=now;lastDraws=window.__draws;if(now-t<5000)requestAnimationFrame(tick);else{calls.sort((a,b)=>a-b);resolve({fps:1000/(frames.reduce((a,b)=>a+b,0)/frames.length),drawCallsPerFrame:calls[Math.floor(calls.length/2)]});}}requestAnimationFrame(tick);}));
 results.push({label,posterDrawsPerSecond:posterDraws,...perf});await page.close();
}await fs.writeFile('test-results/render-budget.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results));}finally{await browser.close();}
