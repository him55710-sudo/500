import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {initialState,SAVE_KEY} from '../src/state.js';
import {initialKitchen} from '../src/kitchen-state.js';
import {rescueInitial} from '../src/rescue-state.js';
import {initialJourney} from '../src/journey-state.js';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const results=[],errors=[];
await fs.mkdir('test-results/design',{recursive:true});
const fixtures=[
 ['salon',{},[['letter','letter','#letter-close'],['journal','KeyJ','#journal-close'],['hint','KeyH','#close-modal'],['pause','Escape','#close-modal']]],
 ['kitchen',{cooking:{...initialKitchen(),lights:true,opened:{kimchi:true,rose:true,chicken:true,pepero:true}}},[['market','kitchen-market','#market-search'],['recipe','cook-kimchi','#shop-ingredients'],['power','kitchen-power','#subway-reset']]],
 ['rescue',{rescue:{...rescueInitial(),healed:true,room:1}},[['wardrobe','rescue-rack','#rescue-leave-shop'],['receipt','rescue-cashier','#rescue-checkout-leave']]],
 ['rescue',{rescue:{...rescueInitial(),healed:true,warmed:true,room:2}},[['map','rescue-map','#map-zoom']]],
 ['journey',{journey:{...initialJourney(),chat:true,freed:true,photo:true,computer:true,ticket:true}},[['chat','journey-phone','#close-modal'],['passport','journey-passport','#journey-show-pass']]],
 ['journey',{journey:{...initialJourney(),chat:true,freed:true,photo:true,computer:true,ticket:true,zone:'church'}},[['crew','journey-attendant','#journey-serve']]],
 ['journey',{journey:{...initialJourney(),chat:true,freed:true,photo:true,computer:true,ticket:true,served:true,seat:'1A',flight:10,arrived:true,zone:'restaurant'}},[['dining','journey-dine','#journey-leave-belt']]],
];
try{
 for(const [mode,partial,dialogs] of fixtures.slice(Number(process.argv[2]||0))){
  const page=await browser.newPage({viewport:{width:1440,height:900}});page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:5179/?e2e=1');
  if(mode!=='salon'){
   const state={...initialState(),stage:8,completed:true,location:mode,...partial};
   await page.evaluate(({key,state})=>localStorage.setItem(key,JSON.stringify(state)),{key:SAVE_KEY,state});await page.reload();
  }
  await page.locator(mode==='salon'?'#start':'#continue').focus();await page.keyboard.press('Enter');
  await page.waitForFunction(mode=>window.__roomTest?.ready&&window.__roomTest.view().mode===mode,mode,{timeout:90000});await page.evaluate(()=>document.exitPointerLock());
  for(const [name,trigger,action] of dialogs){
   await page.setViewportSize({width:1440,height:900});
   if(trigger.startsWith('Key')||trigger==='Escape')await page.keyboard.press(trigger);
   else{await page.evaluate(id=>window.__roomTest.focus(id),trigger);await page.waitForTimeout(160);await page.keyboard.press('KeyE');}
   await page.locator('#modal').waitFor({state:'visible'});
   for(const viewport of [{width:1440,height:900},{width:390,height:844},{width:844,height:390}]){
    await page.setViewportSize(viewport);await page.evaluate(()=>document.querySelector('#modal').scrollTop=0);await page.waitForTimeout(100);
    const layout=await page.locator('#modal').evaluate(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,scroll:el.scrollWidth,client:el.clientWidth,title:getComputedStyle(document.querySelector('#modal-title')).fontFamily};});
    await page.screenshot({path:`test-results/design/ui-${name}-${viewport.width}.png`});
    assert.ok(layout.x>=0&&layout.y>=0&&layout.x+layout.w<=viewport.width+1&&layout.y+layout.h<=viewport.height+1,`${name} dialog outside viewport: ${JSON.stringify(layout)}`);
    assert.ok(layout.scroll<=layout.client+2,`${name} dialog has horizontal overflow at ${viewport.width}: ${JSON.stringify(layout)}`);
    assert.ok(layout.title.includes('Noto Sans KR'));
    const target=page.locator(action);await target.scrollIntoViewIfNeeded();
    assert.ok(await target.evaluate(el=>{const r=el.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;return x>=0&&x<=innerWidth&&y>=0&&y<=innerHeight&&el.contains(document.elementFromPoint(x,y));}),`${name}: action unreachable at ${viewport.width}`);
    results.push({name,viewport,layout});
   }
   await page.setViewportSize({width:390,height:844});
   if(name==='market'){await page.locator('#market-search').fill('브로콜리');await page.locator('[data-ingredient="broccoli"]').click();assert.equal(await page.evaluate(()=>window.__roomTest.read().cooking.bag.broccoli),1);}
   if(name==='wardrobe'){await page.locator('[data-garment="polo-navy"]').click();assert.deepEqual(await page.evaluate(()=>window.__roomTest.read().rescue.selected),['polo-navy']);}
   if(name==='map'){await page.locator('#map-zoom').click();assert.ok(await page.locator('#rescue-map-surface').evaluate(e=>e.classList.contains('zoomed')));}
   if(name==='passport'){
    await page.locator('#journey-show-pass').click();await page.screenshot({path:'test-results/design/ui-ticket-390.png'});
    assert.ok(await page.locator('#modal').evaluate(e=>e.scrollWidth<=e.clientWidth+2));await page.locator('#journey-ticket-continue').click();
   }else await page.locator('#close-modal').click();
   console.log(mode,name,'desktop/mobile/landscape passed');
  }
  await page.close();
 }
 assert.deepEqual(errors,[]);
}finally{
 await fs.writeFile('test-results/design/reading-ui-report.json',JSON.stringify({results,errors},null,2));await browser.close();
}
