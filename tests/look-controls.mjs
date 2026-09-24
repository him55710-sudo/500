import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {Quaternion,Euler} from 'three';
import {lookRadiansPerPixel} from '../src/look-controls.js';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));
const input=()=>page.evaluate(()=>window.__roomTest.input());
const frame=()=>page.evaluate(()=>new Promise(requestAnimationFrame));
// Chromium rate-limits rapid reacquisition. Space gestures as a person would.
const locked=async()=>{await page.waitForFunction(()=>document.pointerLockElement?.id==='scene');await page.waitForTimeout(2100);};
function matchesCamera(value){
 const q=new Quaternion().fromArray(value.quaternion),expected=new Quaternion().setFromEuler(new Euler(value.pitch,value.yaw,0,'YXZ'));
 assert.ok(q.angleTo(expected)<.0001,'Camera must render current input without trailing interpolation');
}
try{
 await fs.mkdir('test-results/design',{recursive:true});
 await page.goto(new URL('?e2e=1',process.env.GAME_BASE_URL||'http://127.0.0.1:5179/').href);
 await page.locator('#start').click();await page.waitForFunction(()=>window.__roomTest?.ready);
 if(!await page.evaluate(()=>!!document.pointerLockElement))await page.locator('#resume-capture').click();
 await locked();assert.equal(await page.locator('#scene').evaluate(e=>getComputedStyle(e).cursor),'none');
 const before=await input();await page.mouse.move(800,420);await frame();assert.notEqual((await input()).yaw,before.yaw);matchesCamera(await input());
 checks.push('Playing locks and hides the cursor; camera responds on the next frame');

 await page.keyboard.press('Tab');await page.waitForFunction(()=>!document.pointerLockElement);
 const free=await input();await page.mouse.move(300,400);await page.mouse.move(800,460);await frame();assert.equal((await input()).yaw,free.yaw);
 assert.ok(await page.locator('#resume-capture').isVisible());
 const gain=lookRadiansPerPixel(65,900);await page.mouse.down({button:'right'});await page.mouse.move(950,480,{steps:5});await frame();const dragged=await input();
 assert.ok(dragged.dragging);assert.ok(Math.abs(dragged.yaw-free.yaw+150*gain)<.00001);matchesCamera(dragged);
 await page.mouse.up({button:'right'});assert.equal((await input()).dragging,false);
 checks.push('Released cursor does not steer; right drag remains an exact, button-held fallback');

 await page.keyboard.press('Tab');await locked();await page.keyboard.press('KeyJ');await page.locator('#modal').waitFor({state:'visible'});
 await page.waitForFunction(()=>!document.pointerLockElement);assert.notEqual(await page.locator('#close-modal').evaluate(e=>getComputedStyle(e).cursor),'none');
 const modal=await input();await page.mouse.move(600,500);await frame();assert.equal((await input()).yaw,modal.yaw);
 await page.locator('#close-modal').click();await locked();assert.equal(await page.locator('#scene').evaluate(e=>getComputedStyle(e).cursor),'none');
 checks.push('Dialogs release the cursor; closing a dialog restores pointer lock automatically');

 await page.keyboard.press('Tab');await page.waitForFunction(()=>!document.pointerLockElement);
 await page.keyboard.press('KeyF');await page.waitForFunction(()=>!!document.fullscreenElement);await locked();
 assert.equal(await page.locator('#scene').evaluate(e=>getComputedStyle(e).cursor),'none');
 const start=await input();await page.mouse.move(750,400);await page.mouse.move(900,480);await page.waitForFunction(yaw=>window.__roomTest.input().yaw!==yaw,start.yaw);await frame();matchesCamera(await input());
 const largeBefore=await input();const largeGain=await page.locator('#scene').evaluate(e=>2*Math.tan(65*Math.PI/360)/e.clientHeight);
 await page.evaluate(()=>document.dispatchEvent(new MouseEvent('mousemove',{movementX:2400,movementY:0})));await frame();
 assert.ok(Math.abs((await input()).yaw-largeBefore.yaw+2400*largeGain)<.00001,'Locked deltas are not clamped to the viewport');matchesCamera(await input());
 await page.keyboard.press('KeyH');await page.locator('#modal').waitFor({state:'visible'});await page.waitForFunction(()=>!document.pointerLockElement);
 assert.ok(await page.evaluate(()=>!!document.fullscreenElement));await page.locator('#close-modal').click();await locked();
 await page.screenshot({path:'test-results/design/fullscreen-pointer-lock.png'});
 await page.keyboard.press('KeyF');await page.waitForFunction(()=>!document.fullscreenElement);
 checks.push('F enters fullscreen and locks in one gesture; large motion and modal resume work in fullscreen');

 await page.keyboard.press('KeyJ');await page.locator('#modal').waitFor({state:'visible'});
 await page.evaluate(()=>{const canvas=document.querySelector('#scene');window.originalLock=canvas.requestPointerLock;canvas.requestPointerLock=()=>Promise.reject(new DOMException('Denied by test','NotAllowedError'));});
 await page.locator('#close-modal').click();await page.waitForFunction(()=>!document.pointerLockElement&&!document.querySelector('#resume-capture').hidden);
 const failed=await input();await page.mouse.move(200,200);await frame();assert.equal((await input()).yaw,failed.yaw);
 await page.evaluate(()=>{document.querySelector('#scene').requestPointerLock=window.originalLock;delete window.originalLock;});
 await page.locator('#resume-capture').click();await locked();
 checks.push('A rejected lock keeps the cursor available and offers a working retry');

 await page.evaluate(()=>dispatchEvent(new Event('blur')));await page.locator('#modal').waitFor({state:'visible'});await page.waitForFunction(()=>!document.pointerLockElement);
 assert.equal((await input()).dragging,false);await page.locator('#resume').click();await locked();
 checks.push('Losing focus releases input; resume restores capture');
 assert.deepEqual(errors,[]);console.log(checks.join('\n'));
}finally{
 await fs.writeFile('test-results/design/look-controls-report.json',JSON.stringify({checks,errors},null,2));await browser.close();
}
