import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
import {initialState,SAVE_KEY} from '../src/state.js';
import {initialKitchen} from '../src/kitchen-state.js';
const label=process.argv[2]||'baseline';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const results=[];
await fs.mkdir('test-results/design',{recursive:true});
try{
 for(const mode of process.argv.slice(3).length?process.argv.slice(3):['salon','heaven','arrival','kitchen','rescue','journey']){
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:5179/?e2e=1&preview=${mode}`);
  let start=mode==='salon'?'#start':'#princess-preview';
  if(mode==='kitchen'){
   await page.evaluate(({key,state})=>localStorage.setItem(key,JSON.stringify(state)),{key:SAVE_KEY,state:{...initialState(),stage:8,completed:true,location:'kitchen',cooking:{...initialKitchen(),lights:true}}});
   await page.reload();start='#continue';
  }
  await page.locator(start).focus();await page.keyboard.press('Enter');
  await page.waitForFunction(()=>window.__roomTest?.ready,null,{timeout:90000});
  await page.waitForTimeout(2200);
  // A development HMR reload invalidates this capture rather than being a game result.
  await page.waitForFunction(()=>window.__roomTest?.ready,null,{timeout:90000});
  await page.screenshot({path:`test-results/design/${label}-${mode}.png`});
  const timing=await page.evaluate(()=>new Promise(resolve=>{let previous=performance.now(),times=[];function frame(now){times.push(now-previous);previous=now;if(times.length<45)requestAnimationFrame(frame);else resolve(times);}requestAnimationFrame(frame);}));
  results.push({mode,errors,view:await page.evaluate(()=>window.__roomTest.view()),frameMs:timing.reduce((a,b)=>a+b,0)/timing.length});
  if(mode==='salon'){
   await page.evaluate(()=>window.__roomTest.focus('letter'));await page.waitForTimeout(150);await page.keyboard.press('KeyE');
   await page.screenshot({path:`test-results/design/${label}-letter.png`});
  }
  if(mode==='rescue'){
   await page.evaluate(()=>window.__roomTest.focus('rescue-bed'));await page.waitForTimeout(150);
   await page.screenshot({path:`test-results/design/${label}-hyunsu.png`});
   await page.evaluate(()=>{window.__roomTest.setPosition(-2.5,3.1);window.__roomTest.look(-5.5,1.8,1.05);});await page.waitForTimeout(100);
   await page.screenshot({path:`test-results/design/${label}-window.png`});
  }
  await page.close();
  console.log(mode,JSON.stringify(results.at(-1)));
 }
 await fs.writeFile(`test-results/design/${label}.json`,JSON.stringify(results,null,2));
}finally{await browser.close();}
