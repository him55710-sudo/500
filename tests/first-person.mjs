import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {initialState,SAVE_KEY} from '../src/state.js';
import {rescueInitial} from '../src/rescue-state.js';
const base=process.env.GAME_BASE_URL||'http://127.0.0.1:5197/';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
const view=()=>page.evaluate(()=>window.__roomTest.view());
async function check(){await page.keyboard.press('KeyV');await page.mouse.wheel(0,600);assert.equal((await view()).thirdPerson,false);assert.equal(await page.locator('#view-btn').count(),0);}
try{
 await page.goto(new URL('?preview=transfer&e2e=1',base).href);await page.locator('#princess-preview').focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>window.__roomTest?.view().mode==='coaster',null,{timeout:90000});await check();await page.evaluate(()=>window.__roomTest.advanceRide(8));await check();await page.screenshot({path:'test-results/first-person-coaster.png'});
 // Resume directly in the earthquake chapter, which previously forced an external camera.
 await page.goto(new URL('?e2e=1',base).href);await page.evaluate(({key,s})=>localStorage.setItem(key,JSON.stringify(s)),{key:SAVE_KEY,s:{...initialState(),stage:8,completed:true,location:'rescue',rescue:{...rescueInitial(),room:3,healed:true,warmed:true,fed:true,quake:true}}});await page.reload();await page.locator('#continue').focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>window.__roomTest?.view().mode==='rescue',null,{timeout:90000});await check();let v=await view();assert.ok(Math.abs(v.camera[0]-v.position[0])<.04);assert.ok(Math.abs(v.camera[2]-v.position[2])<.04);
 await page.evaluate(()=>window.__roomTest.focus('rescue-hand'));await page.waitForTimeout(300);await page.keyboard.press('KeyE');assert.equal((await page.evaluate(()=>window.__roomTest.read())).rescue.holding,true);await check();await page.screenshot({path:'test-results/first-person-rescue.png'});
 assert.deepEqual(errors,[]);await fs.writeFile('test-results/first-person-report.json',JSON.stringify({ok:true,checks:['V and wheel never switch perspective','Coaster remains in the front seat','Earthquake and holding hands remain at player eye level','No perspective toggle in HUD'],errors},null,2));console.log('First-person ride and rescue chapter verified');
}finally{await browser.close();}
