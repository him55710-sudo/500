import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const baseURL=process.env.GAME_BASE_URL||'http://127.0.0.1:5178/';
const origin=new URL(baseURL).origin;
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1280,height:800}});const errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(new URL(r.url()).origin===origin&&r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
try{
 await page.goto(baseURL,{waitUntil:'networkidle'});await page.screenshot({path:'test-results/production-poster.png'});
 await page.locator('#start').click();await page.locator('#hud').waitFor({state:'visible',timeout:60000});await page.waitForTimeout(1200);
 await page.keyboard.press('KeyV');assert.equal(await page.locator('#view-btn span').innerText(),'3인칭');
 await page.keyboard.press('KeyH');await page.locator('.native-help').waitFor();await page.locator('#close-modal').click();
 await page.keyboard.press('Escape');await page.locator('#settings').click();await page.locator('#quality').selectOption('standard');await page.locator('#settings-done').click();
 await page.screenshot({path:'test-results/production-room.png'});assert.deepEqual(errors,[]);console.log('Production: poster, compressed GLB, camera toggle, hints, settings and local assets PASS');
}finally{await browser.close();}
