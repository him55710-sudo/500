import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1280,height:800}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 const glbRequests=[];page.on('request',r=>{if(r.url().endsWith('.glb'))glbRequests.push(r.url());});
 await page.goto('http://127.0.0.1:5179/?e2e=1',{waitUntil:'networkidle'});
 assert.equal(glbRequests.length,0,'Poster must not download or initialize the 3D scene');
 await page.locator('#intro-settings').click();await page.locator('#speed').selectOption('1.3');await page.locator('#quality').selectOption('standard');await page.locator('#settings-done').click();
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'test-results/v2-poster-mobile.png'});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.setViewportSize({width:1280,height:800});await page.locator('#start').click();await page.waitForFunction(()=>window.__roomTest?.ready,null,{timeout:120000});await page.waitForTimeout(500);
 await page.evaluate(()=>{window.__roomTest.setPosition(1.3,3);window.__roomTest.look(1.3,1.63,-4);});
 await page.keyboard.down('KeyW');await page.waitForTimeout(600);await page.keyboard.up('KeyW');
 const p=await page.evaluate(()=>window.__roomTest.view().position);assert.ok(3-p[2]>2,'Walk is faster and moves forward in real time');
 await page.keyboard.press('KeyV');assert.equal((await page.evaluate(()=>window.__roomTest.view())).thirdPerson,true);
 await page.keyboard.press('Escape');await page.locator('#settings').click();assert.equal(await page.locator('#speed').inputValue(),'1.3');assert.equal(await page.locator('#quality').inputValue(),'standard');
 assert.deepEqual(errors,[]);console.log('Poster lazy load, intro settings, mobile layout, fast walking, third-person and persisted options PASS');
}finally{await browser.close();}
