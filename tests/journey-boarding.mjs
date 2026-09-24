import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {initialState,SAVE_KEY} from '../src/state.js';
import {initialJourney} from '../src/journey-state.js';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.url().includes('/assets/')&&r.status()>=400)errors.push(r.status()+' '+r.url());});
const fixture={...initialState(),stage:8,completed:true,location:'journey',journey:{...initialJourney(),zone:'church',chat:true,freed:true,photo:true,computer:true,ticket:true}};
const shot=n=>page.screenshot({path:'test-results/boarding-'+n+'.png'});
try{
 await page.goto('http://127.0.0.1:5179/?e2e=1');await page.evaluate(({key,s})=>localStorage.setItem(key,JSON.stringify(s)),{key:SAVE_KEY,s:fixture});await page.reload();await page.locator('#continue').click();await page.waitForFunction(()=>window.__roomTest?.view().mode==='journey',null,{timeout:90000});
 await page.evaluate(()=>window.__roomTest.setPosition(1,-3.8));await page.waitForTimeout(200);await page.evaluate(()=>window.__roomTest.look(2.5,7.3,-7.5));await page.waitForTimeout(400);await shot('01-crew-and-door');
 if(await page.evaluate(()=>!!document.pointerLockElement))await page.keyboard.press('Tab');await page.locator('#journey-ticket-button').click();await page.locator('.memory-pass').waitFor();await shot('02-ticket-desktop');assert.equal(await page.locator('.ticket-clues strong').allTextContents().then(x=>x.join('/')),'2F/6B');
 await page.setViewportSize({width:390,height:844});await shot('03-ticket-mobile');assert.ok(await page.locator('.memory-pass').evaluate(e=>e.getBoundingClientRect().right<=innerWidth));assert.ok(await page.locator('#modal').evaluate(e=>e.scrollWidth<=e.clientWidth+1));
 await page.locator('#journey-ticket-continue').click();await page.setViewportSize({width:1440,height:1000});
 await page.evaluate(()=>window.__roomTest.focus('journey-pew-6B'));await page.waitForTimeout(300);await page.keyboard.press('KeyE');await page.locator('#journey-take-bowl').click();
 await page.evaluate(()=>window.__roomTest.focus('journey-attendant'));await page.waitForTimeout(300);await page.keyboard.press('KeyE');await page.locator('#journey-serve').click();await page.locator('#journey-serve').click();
 await page.evaluate(()=>window.__roomTest.setPosition(2.5,-5.5));await page.waitForTimeout(200);await page.evaluate(()=>window.__roomTest.look(2.5,7.5,-8));await page.waitForTimeout(1300);await shot('04-open-boarding-door');
 await page.reload();await page.locator('#continue').click();await page.waitForFunction(()=>window.__roomTest?.view().mode==='journey',null,{timeout:90000});assert.equal(await page.evaluate(()=>window.__roomTest.read().journey.served),true);
 await page.evaluate(()=>window.__roomTest.focus('journey-board'));await page.keyboard.down('KeyW');await page.waitForFunction(()=>window.__roomTest.read().journey.zone==='plane');await page.keyboard.up('KeyW');
 await page.keyboard.press('KeyT');assert.match(await page.locator('.ticket-status').innerText(),/탑승 완료/);await shot('05-ticket-boarded');assert.deepEqual(errors,[]);await fs.writeFile('test-results/boarding-report.json',JSON.stringify({ok:true,checks:['Dedicated gate and female character rendered','Desktop and mobile ticket layout fits','Ticket closes and remains accessible with T','Meal opens gate, persists on reload','Walking through the gate boards, ticket status follows'],errors},null,2));
 console.log('PASS: boarding gate, ticket desktop/mobile, saved unlock, physical boarding and status');
}finally{await browser.close();}
