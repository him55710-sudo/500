import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {initialState,SAVE_KEY} from '../src/state.js';
import {employmentOrder} from '../src/kitchen-data.js';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],checks=[];
page.on('pageerror',e=>errors.push(e.stack));
page.on('response',r=>{if(r.url().includes('/assets/')&&r.status()>=400)errors.push(r.status()+' '+r.url());});
const read=()=>page.evaluate(()=>window.__roomTest.read()),view=()=>page.evaluate(()=>window.__roomTest.view());
const shot=name=>page.screenshot({path:'test-results/market-'+name+'.png'});
async function focus(id){await page.evaluate(id=>window.__roomTest.focus(id),id);await page.waitForTimeout(200);await page.keyboard.press('KeyE');}
async function pose(x,z,tx,ty,tz){await page.evaluate(p=>{window.__roomTest.setPosition(p[0],p[1]);window.__roomTest.look(p[2],p[3],p[4]);},[x,z,tx,ty,tz]);await page.waitForTimeout(300);}
const close=()=>page.locator('#close-modal').click();
try{
 await page.goto('http://127.0.0.1:5179/?e2e=1');
 await page.evaluate(({key,state})=>localStorage.setItem(key,JSON.stringify(state)),{key:SAVE_KEY,state:{...initialState(),stage:8,completed:true,location:'kitchen'}});
 await page.reload();await page.locator('#continue').click();await page.waitForFunction(()=>window.__roomTest?.view().mode==='kitchen',null,{timeout:90000});
 await focus('kitchen-power');for(const name of employmentOrder)await page.locator(`[data-station="${name}"]`).click();await page.locator('#subway-check').click();await page.waitForTimeout(1500);
 await pose(7,11,0,2.2,0);await shot('wide');
 await pose(2.25,4.6,2.25,1.65,-5);await shot('aisle');
 await page.keyboard.down('KeyW');await page.waitForTimeout(700);await page.keyboard.up('KeyW');assert.ok((await view()).position[2]<3,'Player can walk down the widened aisle');
 await pose(2.25,0,0,1.6,0);await page.keyboard.down('KeyW');await page.waitForTimeout(1200);await page.keyboard.up('KeyW');assert.ok((await view()).position[0]>.7,'Shelf collision stops walking through stock');
 await pose(20,0,21,1.6,0);await page.keyboard.down('KeyW');await page.waitForTimeout(700);await page.keyboard.up('KeyW');assert.ok((await view()).position[0]<=21.3);checks.push('Wider aisle is walkable; shelf and outer wall stop movement');
 await focus('kitchen-market');assert.equal(await page.locator('[data-product]').count(),54);
 await page.locator('#market-search').fill('브로콜리');assert.equal(await page.locator('[data-product]:visible').count(),1);
 for(let i=0;i<2;i++)await page.locator('[data-ingredient="broccoli"]').click();assert.equal((await read()).cooking.bag.broccoli,2);
 await page.locator('[data-return="broccoli"]').click();assert.equal((await read()).cooking.bag.broccoli,1);
 await page.locator('[data-return="broccoli"]').click();assert.equal((await read()).cooking.bag.broccoli,undefined);assert.equal(await page.locator('[data-return="broccoli"]').isDisabled(),true);
 await page.locator('[data-category="produce"]').click();await page.waitForTimeout(600);assert.equal(await page.locator('[data-product="carrot"] img').evaluate(el=>el.naturalWidth>0),true);await shot('produce');
 await page.locator('[data-category="drinks"]').click();assert.equal(await page.locator('[data-product]').count(),3);
 await page.locator('[data-category="pack"]').click();assert.ok(await page.locator('[data-product="box"]').isVisible());
 await page.locator('[data-category="all"]').click();await page.locator('[data-ingredient="shrimp"]').click();await page.locator('[data-ingredient="garlic"]').click();await page.locator('[data-ingredient="oil"]').click();await close();checks.push('54 ingredients, category filters, real model icons, search, add and return');
 for(const key of ['chili','chicken','garlic','pepero']){
  await focus('cook-'+key);await page.locator('[data-food-view="photo"]').click();const photo=page.locator('#photo-view img');await photo.waitFor();assert.ok(await photo.evaluate(el=>el.complete&&el.naturalWidth>0));assert.ok(await page.locator('#photo-view a[href*="creativecommons"]').isVisible());if(key==='chicken')await shot('actual-chicken');
  await page.locator('[data-food-view="model"]').click();assert.ok(await page.locator('#dish-preview').isVisible());
  if(key==='chili'){await page.locator('[data-action="dry"]').click();await page.locator('[data-heat="medium"]').click();await page.locator('[data-action="garlic"]').click();await page.waitForTimeout(700);await shot('flame-preview');await close();await pose(0,-14,0,1.38,-17.6);await page.waitForTimeout(400);await shot('flame-world');await focus('cook-chili');await page.locator('[data-heat="off"]').click();}
  await close();
 }
 checks.push('Four actual food photographs load with credits; model/photo tabs and cooking heat controls work');
 await pose(-5.8,7,-4.5,1.8,0);await shot('stocked-store');const metrics=await view();
 assert.deepEqual(errors,[]);await fs.writeFile('test-results/market-report.json',JSON.stringify({ok:true,checks,metrics,errors},null,2));console.log(JSON.stringify({ok:true,checks,metrics},null,2));
}catch(error){await shot('failure');await fs.writeFile('test-results/market-report.json',JSON.stringify({ok:false,error:error.stack,errors,view:await view().catch(()=>null)},null,2));throw error;}finally{await browser.close();}
