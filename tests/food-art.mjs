import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1280,height:900}});
const errors=[],loaded=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(/beef-cuts-photo|steak-photo-pair/.test(r.url())){assert.equal(r.status(),200);loaded.push(r.url());}});
const fixture={version:1,stage:6,letterRead:true,inventory:['beef'],selected:'beef',tasted:[],journal:[],completed:false,elapsed:60};
await page.addInitScript(s=>localStorage.setItem('hayoung500.room1.v1',JSON.stringify(s)),fixture);
async function focus(id){await page.evaluate(id=>window.__roomTest.focus(id),id);await page.waitForFunction(name=>!document.querySelector('#prompt').hidden&&document.querySelector('#target-label').textContent===name,{cow:'가려진 소고기 부위표',steaks:'두 접시의 스테이크'}[id]);await page.keyboard.press('KeyE');}
try{
 await page.goto('http://127.0.0.1:5187/?e2e=1',{waitUntil:'domcontentloaded',timeout:60000});
 await page.locator('#continue').click();await page.waitForFunction(()=>window.__roomTest?.ready,null,{timeout:120000});
 await focus('cow');assert.equal(await page.locator('.cut-photo').count(),6);
 await page.locator('[data-cut="등심"]').click();assert.equal(await page.locator('[data-cut="등심"] .cut-photo').count(),1);
 assert.equal(await page.locator('[data-cut="등심"] .cut-name').innerText(),'등심');
 await page.locator('[data-cut="등심"]').click();assert.match(await page.locator('#cut-error').innerText(),/아니/);
 assert.ok((await page.evaluate(()=>window.__roomTest.read())).inventory.includes('beef'));
 await page.locator('[data-cut="살치살"]').click();await page.waitForTimeout(250);
 await page.screenshot({path:'test-results/food-cuts-upgraded.png'});
 await page.setViewportSize({width:390,height:844});assert.equal(await page.locator('#modal').evaluate(e=>e.scrollWidth<=e.clientWidth),true);
 await page.screenshot({path:'test-results/food-cuts-mobile.png'});await page.setViewportSize({width:1280,height:900});
 await page.locator('[data-cut="살치살"]').click();assert.equal((await page.evaluate(()=>window.__roomTest.read())).stage,7);
 await focus('steaks');assert.equal(await page.locator('.steak-photo').count(),2);assert.equal(await page.locator('#vote-area').isVisible(),false);
 await page.locator('[data-which="hyunsu"]').click();assert.equal(await page.locator('#vote-area').isVisible(),false);
 await page.locator('[data-which="alpero"]').click();assert.equal(await page.locator('#vote-area').isVisible(),true);
 await page.waitForTimeout(250);await page.screenshot({path:'test-results/food-steaks-upgraded.png'});
 assert.equal(new Set(loaded).size,2);assert.deepEqual(errors,[]);
 await fs.writeFile('test-results/food-art-report.json',JSON.stringify({ok:true,checks:['six photo cards','photo survives name reveal','wrong answer retains beef','correct cut advances','390px modal has no horizontal overflow','two steak images','both tastings required'],loaded,errors},null,2));
 console.log('Food photos, reveal labels, answer retry, mobile layout and steak tasting gates PASS');
}finally{await browser.close();}
