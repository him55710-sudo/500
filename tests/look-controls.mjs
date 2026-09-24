import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {Quaternion,Euler} from 'three';
import {lookRadiansPerPixel} from '../src/look-controls.js';
const gain=lookRadiansPerPixel(65,900);
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));
const input=()=>page.evaluate(()=>window.__roomTest.input());
async function frame(){await page.evaluate(()=>new Promise(requestAnimationFrame));}
function matchesCamera(value){
 const q=new Quaternion().fromArray(value.quaternion),expected=new Quaternion().setFromEuler(new Euler(value.pitch,value.yaw,0,'YXZ'));
 assert.ok(q.angleTo(expected)<.0001,'Camera must use current input without trailing interpolation');
}
try{
 await fs.mkdir('test-results/design',{recursive:true});
 await page.goto(new URL('?e2e=1',process.env.GAME_BASE_URL||'http://127.0.0.1:5179/').href);await page.locator('#start').focus();await page.keyboard.press('Enter');
 await page.waitForFunction(()=>window.__roomTest?.ready);
 await page.evaluate(()=>document.exitPointerLock());await page.waitForFunction(()=>!document.pointerLockElement);
 await page.mouse.move(750,450);const free=await input();
 await page.mouse.move(900,470,{steps:5});await frame();const freeMoved=await input();
 assert.equal(freeMoved.dragging,false);assert.ok(Math.abs(freeMoved.yaw-free.yaw+150*gain)<.00001);assert.ok(Math.abs(freeMoved.pitch-free.pitch+20*gain)<.00001);matchesCamera(freeMoved);
 checks.push('First person follows mouse movement without a held button or pointer lock');
 await page.keyboard.press('Tab');const cursor=await input();await page.mouse.move(750,450,{steps:5});await frame();assert.equal((await input()).yaw,cursor.yaw);
 checks.push('Tab releases the cursor without moving the first-person camera');
 await page.mouse.move(750,450);const before=await input();await page.mouse.down({button:'right'});
 await page.mouse.move(1050,470,{steps:5});await frame();const moved=await input();
 assert.ok(moved.dragging);assert.ok(Math.abs(moved.yaw-before.yaw+300*gain)<.00001);assert.ok(Math.abs(moved.pitch-before.pitch+20*gain)<.00001);matchesCamera(moved);
 checks.push('Right drag applies exact displacement once, visible in the next frame');
 // Cross an interactive HUD element while holding the pointer; capture keeps the drag.
 await page.mouse.move(1388,46,{steps:5});await frame();assert.ok((await input()).dragging);matchesCamera(await input());
 await page.mouse.up({button:'right'});assert.equal((await input()).dragging,false);const stopped=await input();
 await page.mouse.move(600,420);await frame();assert.equal((await input()).yaw,stopped.yaw);
 checks.push('Drag continues over HUD and stops immediately when released');
 await page.mouse.down({button:'right'});await page.mouse.move(630,420);await page.keyboard.press('KeyJ');
 assert.equal((await input()).dragging,false);const modal=await input();await page.mouse.move(700,500);await page.mouse.up({button:'right'});assert.equal((await input()).yaw,modal.yaw);
 await page.locator('#close-modal').click();await page.mouse.move(760,460);const resumed=await input();await page.mouse.down({button:'right'});await page.mouse.move(800,460);await frame();
 assert.ok((await input()).dragging);assert.ok(Math.abs((await input()).yaw-resumed.yaw+40*gain)<.00001);await page.mouse.up({button:'right'});
 checks.push('Opening a modal cancels dragging; the next drag starts with fresh coordinates');
 await page.mouse.down({button:'right'});await page.evaluate(()=>dispatchEvent(new Event('blur')));assert.equal((await input()).dragging,false);await page.mouse.up({button:'right'});await page.locator('#close-modal').click();
 checks.push('Losing window focus cannot leave rotation stuck');
 await page.locator('#scene').click({position:{x:750,y:420}});await page.waitForFunction(()=>document.pointerLockElement?.id==='scene');
 const locked=await input();await page.mouse.move(800,430);await frame();const lockMoved=await input();assert.notEqual(lockMoved.yaw,locked.yaw);matchesCamera(lockMoved);
 await page.evaluate(()=>document.exitPointerLock());await frame();await page.mouse.move(750,450);await page.mouse.down({button:'right'});await page.mouse.move(775,450);await frame();assert.ok((await input()).dragging);matchesCamera(await input());await page.mouse.up({button:'right'});
 checks.push('Pointer lock and right drag switch cleanly without double-applying motion');
 await page.keyboard.press('KeyV');assert.equal(await page.evaluate(()=>window.__roomTest.view().thirdPerson),false);await page.mouse.wheel(0,500);await frame();assert.equal(await page.evaluate(()=>window.__roomTest.view().thirdPerson),false);
 await page.mouse.move(880,460);const fixedFirst=await input();await page.mouse.move(920,460);await frame();assert.ok(Math.abs((await input()).yaw-fixedFirst.yaw+40*gain)<.00001);matchesCamera(await input());
 checks.push('V and wheel retain first person; mouse look continues without switching modes');
 await page.evaluate(()=>window.__roomTest.focus('letter'));await frame();await page.keyboard.press('KeyE');
 const typography=await page.locator('.letter-paper').evaluate(e=>{const s=getComputedStyle(e);return {font:s.fontFamily,color:s.color,background:s.backgroundColor,size:s.fontSize};});
 assert.ok(typography.font.includes('Noto Sans KR'));assert.equal(typography.background,'rgb(255, 255, 255)');
 await page.screenshot({path:'test-results/design/letter-final.png'});
 await page.setViewportSize({width:390,height:844});await frame();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 assert.ok(await page.locator('#letter-close').isVisible());await page.screenshot({path:'test-results/design/letter-mobile.png'});
 checks.push('Letter uses the new typography and remains usable on a narrow screen');
 assert.deepEqual(errors,[]);await fs.writeFile('test-results/design/controls-report.json',JSON.stringify({ok:true,checks,typography,errors},null,2));console.log(checks.join('\n'));
}catch(e){await page.screenshot({path:'test-results/design/controls-failure.png'});throw e;}finally{await browser.close();}
