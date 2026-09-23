import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1440,height:960}}),errors=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));
const base={version:1,stage:7,letterRead:true,inventory:[],selected:null,tasted:[],journal:[],completed:false,elapsed:60};
async function start(fixture){await page.goto('http://127.0.0.1:5191/?e2e');await page.evaluate(s=>localStorage.setItem('hayoung500.room1.v1',JSON.stringify(s)),fixture);await page.reload();await page.locator('#continue').click();await page.waitForFunction(()=>window.__roomTest?.ready,null,{timeout:120000});}
const view=()=>page.evaluate(()=>window.__roomTest.view());
async function shot(file){await page.screenshot({path:'test-results/'+file+'.png'});}
try{
 await start({...base,stage:5});await page.evaluate(()=>{window.__roomTest.setPosition(3.45,4.9);window.__roomTest.look(3.45,.1,1.7);});await page.waitForTimeout(500);await shot('transfer-01-clean-tiles');checks.push('Uniform ivory number tile appearance captured');
 await start(base);await page.evaluate(()=>window.__roomTest.focus('exit'));await page.waitForTimeout(200);assert.equal((await view()).doorAngle,0);
 await page.evaluate(()=>{window.__roomTest.setPosition(3.65,-5.2);window.__roomTest.look(3.65,1.63,-8);});await page.keyboard.down('KeyW');await page.waitForTimeout(400);await page.keyboard.up('KeyW');assert.ok((await view()).position[2]>=-5.43);checks.push('Locked door blocks movement');
 await page.evaluate(()=>window.__roomTest.focus('steaks'));await page.waitForFunction(()=>document.querySelector('#target-label').textContent==='두 접시의 스테이크');await page.keyboard.press('KeyE');await page.locator('[data-which="hyunsu"]').click();await page.locator('[data-which="alpero"]').click();await page.locator('#vote-hyunsu').click();
 await page.evaluate(()=>window.__roomTest.focus('exit'));await page.waitForTimeout(2200);assert.ok((await view()).doorAngle< -1.55);await shot('transfer-02-open-door');checks.push('Door swings on hinge after correct vote');
 await page.evaluate(()=>{window.__roomTest.setPosition(3.65,-5.1);window.__roomTest.look(3.65,1.63,-8);});await page.keyboard.down('KeyW');await page.waitForTimeout(1100);await page.keyboard.up('KeyW');await page.locator('#enter-heaven').waitFor();assert.ok((await view()).position[2]<-6.8);checks.push('Player physically crosses wall aperture');
 await page.locator('#enter-heaven').click();await page.waitForFunction(()=>window.__roomTest.view().mode==='coaster',null,{timeout:60000});await page.waitForTimeout(3300);await shot('transfer-03-board');assert.equal((await view()).thirdPerson,true);checks.push('Hayoung boards six-car train');
 await page.keyboard.press('KeyV');assert.equal((await view()).thirdPerson,false);await page.evaluate(()=>window.__roomTest.advanceRide(12));await shot('transfer-04-first-person-lift');await page.keyboard.press('KeyV');await page.evaluate(()=>window.__roomTest.advanceRide(9));await shot('transfer-05-summit');
 await page.keyboard.press('Escape');const paused=(await view()).rideProgress;await page.waitForTimeout(350);assert.equal((await view()).rideProgress,paused);await page.locator('#resume').click();checks.push('View switching and pause hold the ride correctly');
 await page.evaluate(()=>window.__roomTest.advanceRide(11));await shot('transfer-06-coaster');await page.evaluate(()=>window.__roomTest.advanceRide(75));
 await page.waitForFunction(()=>window.__roomTest.view().mode==='rotunda',null,{timeout:60000});await page.waitForTimeout(500);await shot('transfer-07-room-two');assert.equal(await page.evaluate(()=>window.__roomTest.read().location),'rotunda');checks.push('Ride completes and saves arrival in circular room');
 const before=(await view()).position;await page.keyboard.down('KeyW');await page.waitForTimeout(650);await page.keyboard.up('KeyW');assert.ok((await view()).position[2]<before[2]-.5);await page.keyboard.press('KeyV');await shot('transfer-08-room-two-third-person');
 await page.evaluate(()=>{window.__roomTest.setPosition(13.1,0);window.__roomTest.look(20,1.63,0);});await page.keyboard.down('KeyW');await page.waitForTimeout(500);await page.keyboard.up('KeyW');assert.ok(Math.hypot((await view()).position[0],(await view()).position[2])<=13.26);checks.push('Circular wall collision and arrival walking work');
 await page.reload();await page.locator('#continue').click();await page.waitForFunction(()=>window.__roomTest?.view().mode==='rotunda',null,{timeout:120000});checks.push('Reload resumes in room two without replaying ride');
 assert.deepEqual(errors,[]);await fs.writeFile('test-results/transfer-report.json',JSON.stringify({ok:true,checks,errors,view:await view()},null,2));console.log(checks.join('\n'));
}catch(e){await shot('transfer-failure');console.log({errors,view:await view().catch(()=>null)});throw e;}finally{await browser.close();}
