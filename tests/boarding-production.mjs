import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {initialState,SAVE_KEY} from '../src/state.js';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith('http://127.0.0.1:5178/')&&r.status()>=400)errors.push(r.status()+' '+r.url());});
try{
 await page.goto('http://127.0.0.1:5178/?preview=boarding');
 const saved=JSON.stringify({...initialState(),stage:5});await page.evaluate(({key,value})=>localStorage.setItem(key,value),{key:SAVE_KEY,value:saved});
 await page.locator('#princess-preview').click();await page.waitForFunction(()=>document.body.classList.contains('journey'),null,{timeout:120000});await page.waitForTimeout(500);await page.screenshot({path:'test-results/boarding-production-gate.png'});
 await page.keyboard.press('KeyT');await page.locator('.memory-pass').waitFor();await page.screenshot({path:'test-results/boarding-production-ticket.png'});assert.match(await page.locator('.ticket-guide').innerText(),/6B/);
 await page.locator('#journey-ticket-continue').click();assert.equal(await page.evaluate(k=>localStorage.getItem(k),SAVE_KEY),saved);
 const response=await page.request.get('http://127.0.0.1:5178/assets/journey/journey-room.glb');assert.equal(response.status(),200);const hash=b=>createHash('sha256').update(b).digest('hex');assert.equal(hash(await response.body()),hash(await fs.readFile('public/assets/journey/journey-room.glb')));
 assert.deepEqual(errors,[]);console.log('PASS: production boarding preview, T ticket access, save preservation and rebuilt Blender asset');
}finally{await browser.close();}
