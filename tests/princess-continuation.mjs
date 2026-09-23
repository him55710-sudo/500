import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {initialState,transition,SAVE_KEY} from '../src/state.js';
let complete=initialState();
for(const event of [{type:'read-letter'},{type:'lock',code:'VITA500'},{type:'frames',order:['yellow','green','blue','red']},{type:'give-violin',doll:'violinist'},{type:'take-carousel'},{type:'place-carousel'},{type:'take-bench'},{type:'place-bench',tile:9},{type:'place-beef',cut:'살치살'},{type:'taste',which:'hyunsu'},{type:'taste',which:'alpero'},{type:'vote',which:'hyunsu'},{type:'exit'}]){const r=transition(complete,event);assert.equal(r.ok,true);complete=r.state;}
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1280,height:800}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 const url=process.env.GAME_BASE_URL||'http://127.0.0.1:5179/';
 await page.goto(url,{waitUntil:'domcontentloaded'});await page.evaluate(({key,state})=>localStorage.setItem(key,JSON.stringify(state)),{key:SAVE_KEY,state:complete});await page.reload();
 await page.locator('#continue').click();await page.locator('#enter-heaven').waitFor({state:'visible',timeout:90000});await page.locator('#enter-heaven').click();
 await page.locator('body.heaven').waitFor({state:'attached',timeout:90000});assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).location,SAVE_KEY),'heaven');
 await page.reload();await page.locator('#continue').click();await page.locator('body.heaven').waitFor({state:'attached',timeout:90000});await page.locator('#hud').waitFor({state:'visible'});
 assert.equal(await page.locator('.chapter span:last-child').innerText(),'하영이의 구름 위 공주방');assert.deepEqual(errors,[]);
 console.log('Completed room -> princess room -> reload and continue: PASS');
}finally{await browser.close();}
