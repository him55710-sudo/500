import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];
page.on('pageerror',e=>errors.push(e.message));
const base=process.env.GAME_BASE_URL||'http://127.0.0.1:5179/';
const focus=async id=>{await page.evaluate(id=>window.__roomTest.focus(id),id);await page.waitForTimeout(200);await page.keyboard.press('KeyE');};
try{
 await page.goto(base+'?e2e=1&preview=heaven',{waitUntil:'domcontentloaded'});
 // Preview must never overwrite an existing first-room save.
 await page.evaluate(()=>localStorage.setItem('hayoung500.room1.v1','saved-progress-sentinel'));
 await page.locator('#princess-preview').click();await page.locator('body.heaven').waitFor({state:'attached',timeout:120000});await page.locator('#hud').waitFor({state:'visible'});await page.waitForTimeout(1300);
 await page.screenshot({path:'test-results/princess-game-wide.png'});
 assert.equal(await page.evaluate(()=>localStorage.getItem('hayoung500.room1.v1')),'saved-progress-sentinel');
 await page.keyboard.press('KeyV');assert.equal(await page.locator('#view-btn span').innerText(),'3인칭');await page.keyboard.press('KeyV');
 if(await page.evaluate(()=>!!window.__roomTest)){
  await focus('heaven-gift');await page.locator('.letter-paper').waitFor();assert.match(await page.locator('.letter-paper').innerText(),/500일/);await page.locator('#close-modal').click();
  await focus('heaven-photo-0');await page.locator('.kitty-photo').waitFor();await page.screenshot({path:'test-results/princess-gallery.png'});await page.locator('#close-modal').click();
  await focus('heaven-kitty');await page.locator('#hug-kitty').click();assert.match(await page.locator('#subtitle').innerText(),/꼬옥/);
  await focus('heaven-music');assert.match(await page.locator('#toast').innerText(),/쉬게/);await focus('heaven-music');assert.match(await page.locator('#toast').innerText(),/켰어요/);
  await page.evaluate(()=>{window.__roomTest.setPosition(0,1);window.__roomTest.look(0,1.63,-5);});await page.keyboard.down('KeyW');await page.waitForTimeout(1100);await page.keyboard.up('KeyW');
  assert.ok((await page.evaluate(()=>window.__roomTest.view().position))[2]>-1.60,'Canopy bed blocks walking');
  await page.evaluate(()=>{window.__roomTest.setPosition(0,4.8);window.__roomTest.look(0,2.4,-4);});await page.waitForTimeout(300);await page.screenshot({path:'test-results/princess-game-wide.png'});
  const view=await page.evaluate(()=>window.__roomTest.view());await fs.writeFile('test-results/princess-runtime.json',JSON.stringify(view,null,2));assert.ok(view.drawCalls<150,'Static room remains batched');
 }
 await page.keyboard.press('KeyH');await page.locator('#modal-title').waitFor();assert.match(await page.locator('#modal-title').innerText(),/쉬어/);await page.locator('#close-modal').click();
 assert.deepEqual(errors,[]);console.log('Princess room: loaded, camera, preview save isolation, gallery, gift, hug, music and collision PASS');
}finally{await browser.close();}
