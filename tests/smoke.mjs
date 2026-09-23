import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'});
const page=await browser.newPage({viewport:{width:1440,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:5178/?e2e=1');await page.waitForFunction(()=>window.__roomTest?.ready);await page.locator('#start').click();
 let a=await page.evaluate(()=>window.__roomTest.assets());assert.equal(a.violin,false);assert.equal(a.carousel,true);assert.equal(a.audio,'running');
 await page.keyboard.press('KeyV');await page.screenshot({path:'test-results/final-third-person.png'});await page.keyboard.press('KeyV');
 await page.evaluate(()=>window.__roomTest.setPosition(1.2,3.9));await page.evaluate(()=>window.__roomTest.look(-1,1.9,-4));await page.screenshot({path:'test-results/final-room.png'});
 await page.keyboard.press('Tab');await page.locator('#menu-btn').click();await page.locator('#settings').click();await page.locator('#scares').uncheck();await page.locator('#settings-done').click();
 await page.keyboard.press('KeyH');await page.locator('summary').click();await page.locator('#next-hint').click();assert.ok((await page.locator('#hint-text').innerText()).length>0);await page.locator('#close-modal').click();
 await page.setViewportSize({width:360,height:740});await page.keyboard.press('Escape');await page.locator('#settings').click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.screenshot({path:'test-results/narrow-settings.png'});
 assert.deepEqual(errors,[]);console.log('PASS: original asset visibility, audio running, third-person, hints, 360px settings, no runtime errors.');
}finally{await browser.close();}
