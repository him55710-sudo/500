import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {SAVE_KEY,initialState} from '../src/state.js';
const url=process.env.GAME_BASE_URL||'http://127.0.0.1:5179/';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1440,height:960}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.url().startsWith(new URL(url).origin)&&r.status()>=400)errors.push(r.status()+' '+r.url());});
const hash=b=>createHash('sha256').update(b).digest('hex');
try{
 await page.goto(url,{waitUntil:'networkidle'});
 const saved=JSON.stringify({...initialState(),stage:5});
 await page.evaluate(({key,saved})=>localStorage.setItem(key,saved),{key:SAVE_KEY,saved});
 await page.goto(new URL('?preview=kitchen',url).href);
 await page.locator('#princess-preview').click();
 await page.waitForFunction(()=>document.body.classList.contains('kitchen'),null,{timeout:120000});
 await page.waitForTimeout(1000);await page.screenshot({path:'test-results/kitchen-public-dark.png'});
 await page.keyboard.press('KeyE');await page.locator('[data-station="상동"]').waitFor();
 for(const name of ['상동','신대방삼거리','철산'])await page.locator(`[data-station="${name}"]`).click();
 await page.locator('#subway-check').click();
 await page.waitForFunction(()=>!document.body.classList.contains('dark'));await page.waitForTimeout(1000);
 await page.screenshot({path:'test-results/kitchen-public-lights.png'});
 await page.keyboard.press('KeyV');assert.equal(await page.locator('#view-btn span').innerText(),'3인칭');
 await page.keyboard.press('KeyH');await page.locator('#modal').waitFor({state:'visible'});await page.locator('#close-modal').click();
 assert.equal(await page.evaluate(k=>localStorage.getItem(k),SAVE_KEY),saved,'Preview must preserve the existing first-room save');
 const assets=['philippines.jpg','park.jpg','day100.jpg','violin-keyring.png','hayoung-painting.png'];
 for(const name of assets){const response=await page.request.get(new URL('/assets/memories/'+name,url).href);assert.equal(response.status(),200);assert.equal(hash(await response.body()),hash(await fs.readFile('public/assets/memories/'+name)));}
 const model=await page.request.get(new URL('/assets/day-200-kitchen.glb',url).href);assert.equal(model.status(),200);assert.equal(hash(await model.body()),hash(await fs.readFile('public/assets/day-200-kitchen.glb')));
 for(const file of ['food-reference/kimchi.jpg','food-reference/pepero.jpg','food-reference/chili.jpg','food-reference/chicken.jpg','food-reference/CREDITS.md','market-icons/carrot.png','market-icons/LICENSE.txt']){const response=await page.request.get(new URL('/assets/'+file,url).href);assert.equal(response.status(),200);assert.equal(hash(await response.body()),hash(await fs.readFile('public/assets/'+file)));}
 assert.deepEqual(errors,[]);
 await fs.writeFile('test-results/kitchen-public-report.json',JSON.stringify({ok:true,url,checks:['Real controls open the dark-room map','Confirmed station order turns on lights','Third-person view and hints work','Preview preserves previous save','Five uploaded images match source bytes','Compressed kitchen model matches deployment','Four user-provided food photographs, model icon and credits match source bytes'],errors},null,2));
 console.log('PASS: kitchen entry, subway, lighting, camera, hints, preview save isolation and 13 deployed assets');
}finally{await browser.close();}
