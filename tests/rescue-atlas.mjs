import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {usStates} from '../src/rescue-us-states.js';
import {lookRadiansPerPixel} from '../src/look-controls.js';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.url().includes('/assets/')&&r.status()>=400)errors.push(r.status()+' '+r.url());});
const read=()=>page.evaluate(()=>window.__roomTest.read().rescue),input=()=>page.evaluate(()=>window.__roomTest.input());
const click=async selector=>{await page.locator(selector).focus();await page.keyboard.press('Enter');};
const focus=async id=>{await page.evaluate(id=>window.__roomTest.focus(id),id);await page.evaluate(()=>new Promise(requestAnimationFrame));await page.keyboard.press('KeyE');};
const next=async id=>{await focus(id);await page.waitForFunction(()=>!window.__roomTest.view().rescue.transition);};
try{
 // Other authoring tasks may save source files during this long interaction test.
 await page.routeWebSocket('**/*',socket=>socket.onMessage(()=>{}));
 await page.goto('http://127.0.0.1:5179/?preview=rescue&e2e=1',{waitUntil:'domcontentloaded',timeout:120000});await page.waitForFunction(()=>window.__roomTest?.ready&&window.__roomTest.view().mode==='rescue',null,{timeout:120000});
 await page.mouse.move(600,500);const before=await input();await page.mouse.move(800,520,{steps:8});await page.evaluate(()=>new Promise(requestAnimationFrame));const moved=await input(),gain=lookRadiansPerPixel(65,1000);
 assert.ok(Math.abs(moved.yaw-before.yaw+200*gain)<1e-6);assert.ok(Math.abs(moved.pitch-before.pitch+20*gain)<1e-6);
 await page.keyboard.press('Tab');await page.mouse.move(600,500);const drag=await input();await page.mouse.down({button:'right'});await page.mouse.move(800,520,{steps:2});await page.mouse.up({button:'right'});assert.ok(Math.abs((await input()).yaw-drag.yaw+200*gain)<1e-6);
 await page.setViewportSize({width:1200,height:800});await page.mouse.move(500,400);const smaller=await input();await page.mouse.down({button:'right'});await page.mouse.move(660,416);await page.mouse.up({button:'right'});assert.ok(Math.abs((await input()).yaw-smaller.yaw+200*gain)<1e-6);
 await page.setViewportSize({width:1440,height:1000});
 await page.evaluate(()=>window.__roomTest.focus('rescue-cabinet'));await page.waitForTimeout(250);await page.screenshot({path:'test-results/glass-cabinet-closed.png'});
 await page.keyboard.press('KeyE');assert.match(await page.locator('#modal-body').innerText(),/유리/);await click('#rescue-search');assert.equal((await read()).cabinetOpen,true);await click('#rescue-search');assert.equal((await read()).medicine,true);
 await focus('rescue-bed');await click('#rescue-give');await next('rescue-door-0');
 await focus('rescue-rack');await click('[data-garment="polo-navy"]');await click('[data-garment="tomboy-coat"]');await click('#rescue-leave-shop');await focus('rescue-cashier');await click('#rescue-pay');await click('#rescue-checkout-leave');await focus('rescue-cold');await click('#rescue-give');await next('rescue-door-1');
 await focus('rescue-map');await click('#map-zoom');assert.equal(await page.locator('[data-state]').count(),50);
 for(const s of usStates){await click(`[data-state="${s.code}"]`);assert.equal((await read()).pins.blue.region,s.name);}
 await page.locator('[data-label-for="NJ"] .us-state-label').click();assert.equal((await read()).pins.blue.region,'New Jersey');
 // Zooming, panning and insets must not change the geographic meaning of a pin.
 await click('#map-larger');await click('#map-larger');assert.equal(await page.locator('#map-scale').innerText(),'150%');
 await click('[data-state="TX"]');assert.equal((await read()).pins.blue.region,'Texas');
 await page.locator('[data-state="TX"]').scrollIntoViewIfNeeded();await page.screenshot({path:'test-results/rescue-us-atlas.png'});
 const oldPin=(await read()).pins.blue;const box=await page.locator('.rescue-map-scroll').boundingBox();await page.mouse.move(box.x+box.width*.55,box.y+box.height*.6);await page.mouse.down();await page.mouse.move(box.x+box.width*.35,box.y+box.height*.5,{steps:8});await page.mouse.up();assert.deepEqual((await read()).pins.blue,oldPin);
 await click('#map-world');await click('[data-pin="red"]');const worldBox=await page.locator('#rescue-map-surface').boundingBox();await page.mouse.click(worldBox.x+(-52+180)/360*worldBox.width,worldBox.y+(90+13)/180*worldBox.height);assert.equal((await read()).pins.red.region,'Brazil');
 await page.screenshot({path:'test-results/rescue-world-pins.png'});await click('#map-zoom');assert.match(await page.locator('#map-red').innerText(),/브라질/);
 await page.setViewportSize({width:390,height:844});await click('#map-reset');await click('[data-state="RI"]');assert.equal((await read()).pins.red.region,'Rhode Island');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:'test-results/rescue-atlas-mobile.png'});
 await page.setViewportSize({width:1440,height:1000});await click('#map-world');const b=await page.locator('#rescue-map-surface').boundingBox();await page.mouse.click(b.x+128/360*b.width,b.y+103/180*b.height);await click('#rescue-board');assert.equal((await read()).board,true);
 assert.deepEqual(errors,[]);console.log('PASS: cabinet open/search/medicine, viewport-matched mouse gain, 50 states, AK/HI, zoom/pan, mobile keyboard selection and Texas/Brazil proposal.');
}catch(e){await page.screenshot({path:'test-results/rescue-atlas-failure.png'});console.log(errors);throw e;}finally{await browser.close();}
