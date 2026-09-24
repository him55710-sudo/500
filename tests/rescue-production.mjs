import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {initialState,SAVE_KEY} from '../src/state.js';
const url='http://127.0.0.1:5178';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.url().startsWith(url)&&r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
const hash=b=>createHash('sha256').update(b).digest('hex');
try{
 await page.goto(url+'/?preview=rescue');
 const saved=JSON.stringify({...initialState(),stage:5});
 await page.evaluate(({key,saved})=>localStorage.setItem(key,saved),{key:SAVE_KEY,saved});
 await page.locator('#princess-preview').focus();await page.keyboard.press('Enter');
 await page.waitForFunction(()=>document.body.classList.contains('rescue')&&document.querySelector('#loading').hidden,null,{timeout:120000});
 await page.waitForTimeout(1000);await page.screenshot({path:'test-results/rescue-production.png'});
 await page.keyboard.press('KeyV');assert.equal(await page.locator('#view-btn span').innerText(),'3인칭');
 await page.keyboard.press('KeyH');await page.locator('#modal').waitFor({state:'visible'});await page.locator('#close-modal').click();
 assert.equal(await page.evaluate(()=>typeof window.__roomTest),'undefined');
 assert.equal(await page.evaluate(key=>localStorage.getItem(key),SAVE_KEY),saved);
 const catalog=await (await page.request.get(url+'/assets/rescue/catalog.json')).json();assert.equal(catalog.length,22);
 for(const item of catalog){const response=await page.request.get(url+item.photo);assert.equal(response.status(),200);assert.ok((await response.body()).length>1000);}
 const model=await page.request.get(url+'/assets/rescue/rescue-room.glb');assert.equal(hash(await model.body()),hash(await fs.readFile('public/assets/rescue/rescue-room.glb')));
 const audioDuration=await page.evaluate(()=>new Promise((resolve,reject)=>{const a=new Audio('/assets/rescue/earthquake-ja.mp3');a.onloadedmetadata=()=>resolve(a.duration);a.onerror=()=>reject(new Error('Japanese audio cannot be decoded'));a.load();}));assert.ok(audioDuration>5&&audioDuration<60);
 assert.deepEqual(errors,[]);
 await fs.writeFile('test-results/rescue-production-report.json',JSON.stringify({ok:true,url,checks:['Built preview renders','View and hint controls respond','No test controls in production','Existing save preserved','All 22 product photographs load','Built model matches Blender export','Japanese voice audio decodes'],audioDuration,errors},null,2));
 console.log('PASS: production entry, controls, save isolation, 22 photos, exact model and Japanese audio',audioDuration);
}finally{await browser.close();}
