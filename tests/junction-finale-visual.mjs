import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {initialState,SAVE_KEY} from '../src/state.js';
import {initialJunction,junctionTransition,routeAnswer} from '../src/junction-state.js';
// Reach the cinematic through real transitions, then inspect its composition.
let junction=initialJunction();
function act(e){const r=junctionTransition(junction,e);assert.ok(r.ok,r.message);junction=r.state;}
function tick(n){for(let i=0;i<n*4;i++)act({type:'tick',dt:.25});}
act({type:'insert-usb'});act({type:'route',value:routeAnswer});
for(const color of ['red','red','red','red','red','red','green','green'])act({type:'red-button',color});
for(const id of ['victory','top']){act({type:'take-drink',id});act({type:'trash',id});}
act({type:'seconds',value:'3seconds'});act({type:'take-coat'});
for(let id=0;id<3;id++)act({type:'minion',id});
act({type:'offer'});act({type:'brand',value:'8seconds'});act({type:'dress'});act({type:'compliment'});tick(8);
act({type:'read-tablet'});act({type:'envelope'});act({type:'draft',value:'현수야, 500일 축하해. 사랑해!'});act({type:'send-letter'});tick(15);
assert.equal(junction.phase,'hearts');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:5179/?e2e=1');
 await page.evaluate(({key,s})=>localStorage.setItem(key,JSON.stringify(s)),{key:SAVE_KEY,s:{...initialState(),stage:8,completed:true,location:'junction',junction}});
 await page.reload();await page.waitForFunction(()=>!document.querySelector('#continue').hidden&&typeof document.querySelector('#continue').onclick==='function');await page.locator('#continue').focus();await page.keyboard.press('Enter');
 await page.waitForFunction(()=>window.__roomTest?.view().mode==='junction',null,{timeout:90000});
 await page.waitForFunction(()=>window.__roomTest.read().junction.phaseTime>=5.5,null,{timeout:25000});
 const v=await page.evaluate(()=>window.__roomTest.view());
 assert.deepEqual(v.junction.hearts,[true,true]);assert.equal(v.junction.ipadVisible,false);
 await page.screenshot({path:'test-results/junction-16-hearts.png'});
 await page.waitForFunction(()=>window.__roomTest.read().junction.completed,null,{timeout:15000});
 await page.waitForTimeout(600);await page.screenshot({path:'test-results/junction-17-finale.png'});
 await page.locator('#junction-prologue').click();
 await page.locator('.film-start').waitFor();
 assert.equal(await page.locator('#memory-film').isVisible(),true);
 assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).junction.completed,SAVE_KEY),true);
 assert.deepEqual(errors,[]);console.log('Finale composition, completion and photo-film handoff verified');
}finally{await browser.close();}
