import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {initialState,SAVE_KEY} from '../src/state.js';
import {initialJourney} from '../src/journey-state.js';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.url().includes('/assets/')&&r.status()>=400)errors.push(r.status()+' '+r.url());});
const fixture={...initialState(),stage:8,completed:true,location:'journey',journey:{...initialJourney(),zone:'restaurant',chat:true,freed:true,photo:true,computer:true,ticket:true,served:true,seat:'2B',flight:10,arrived:true,dining:true,chosen:['beef','watermelon','noodles','bokchoy']}};
const read=()=>page.evaluate(()=>window.__roomTest.read().journey);
const shot=n=>page.screenshot({path:`test-results/journey-pacing-${n}.png`});
const beat=async id=>expect(page.locator('[data-story-beat]')).toHaveAttribute('data-story-beat',id);
async function focus(id){await page.evaluate(id=>window.__roomTest.focus(id),id);await page.waitForTimeout(300);await page.keyboard.press('KeyE');}
async function start(){await page.locator('#continue').click();await page.waitForFunction(()=>window.__roomTest?.view().mode==='journey',null,{timeout:90000});}
async function next(id){await page.locator('#journey-tea-action').click();await beat(id);}
try{
 await fs.mkdir('test-results',{recursive:true});
 await page.goto('http://127.0.0.1:5179/?e2e=1');await page.evaluate(({k,s})=>localStorage.setItem(k,JSON.stringify(s)),{k:SAVE_KEY,s:fixture});await page.reload();await start();
 await focus('journey-hyunsu');await page.locator('[data-food="chicken"]').click();await beat('table');assert.equal((await read()).tea,false);await expect(page.locator('.zagee-cup')).toHaveCount(0);await shot('01-table');
 await page.waitForTimeout(1700);await beat('table');
 await next('meal');await shot('02-meal');await page.locator('#journey-story-rest').click();await focus('journey-hyunsu');await beat('meal');
 await page.reload();await start();await focus('journey-hyunsu');await beat('meal');
 await next('offered');assert.equal((await read()).tea,false);await next('received');assert.equal((await read()).tea,true);await shot('03-tea');
 await next('after-sip');assert.equal((await read()).drank,true);await expect(page.locator('.cup-key')).toHaveCount(0);await expect(page.locator('.zagee-cup.open')).toHaveCount(0);await shot('04-sip');
 await page.locator('#journey-story-rest').click();if(await page.evaluate(()=>!!document.pointerLockElement))await page.keyboard.press('Tab');await page.locator('#journey-cup-button').click();await beat('after-sip');
 await next('sound');await expect(page.locator('.cup-key')).toHaveCount(0);await shot('05-sound');
 await page.setViewportSize({width:390,height:844});await shot('06-mobile');assert.ok(await page.locator('#modal').evaluate(e=>e.scrollWidth<=e.clientWidth+1));
 await next('revealed');await expect(page.locator('.cup-key')).toHaveCount(1);assert.equal((await read()).key,false);await shot('07-key-mobile');
 await page.setViewportSize({width:1440,height:1000});await page.reload();await start();await focus('journey-hyunsu');await beat('revealed');
 await next('found');assert.equal((await read()).key,true);await shot('08-found');await page.locator('#journey-tea-action').click();await focus('journey-exit');assert.equal((await read()).completed,true);
 const saved=await page.evaluate(k=>localStorage.getItem(k),SAVE_KEY);await page.goto('http://127.0.0.1:5179/?preview=hotpot&e2e=1');await page.locator('#princess-preview').click();await page.locator('[data-food="beef"]').click();assert.equal(await page.evaluate(k=>localStorage.getItem(k),SAVE_KEY),saved);
 assert.deepEqual(errors,[]);await fs.writeFile('test-results/journey-pacing-report.json',JSON.stringify({ok:true,checks:['Five dishes lead to shared meal, not instant tea','Beats wait for player action','Closing, inventory reopening and reload preserve the beat','Key stays hidden until cup inspection','390px layout fits and buttons work','Key unlocks the exit','Hotpot preview preserves saved game'],errors},null,2));
 console.log('PASS: dinner pacing, dialogue, staged cup discovery, saved progress, mobile and preview');
}catch(e){await shot('failure');throw e;}finally{await browser.close();}
