import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1280,height:800}});
let releaseFresco;
const gate=new Promise(resolve=>{releaseFresco=resolve;});
try{
 await page.route('**/assets/salon-fresco.png',async route=>{await gate;await route.continue();});
 await page.goto(process.env.GAME_BASE_URL||'http://127.0.0.1:5178/',{waitUntil:'networkidle'});
 const requested=page.waitForRequest('**/assets/salon-fresco.png');
 await page.locator('#start').click();await requested;await page.waitForTimeout(500);
 assert.equal(await page.locator('#hud').isVisible(),false,'Room must wait for its ceiling art on slow connections');
 releaseFresco();await page.locator('#hud').waitFor({state:'visible',timeout:60000});
 await page.keyboard.down('ArrowUp');await page.waitForTimeout(400);await page.keyboard.up('ArrowUp');
 await page.screenshot({path:'test-results/deployed-ceiling.png'});
 console.log('Delayed ceiling texture blocks entry until ready: PASS');
}finally{releaseFresco();await browser.close();}
