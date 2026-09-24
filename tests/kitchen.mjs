import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {initialState,SAVE_KEY} from '../src/state.js';
import {recipes,recipeKeys,employmentOrder} from '../src/kitchen-data.js';

const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[],checks=[];
page.on('pageerror',error=>errors.push(error.message));
page.on('response',response=>{if(response.url().includes('/assets/')&&response.status()>=400)errors.push(`${response.status()} ${response.url()}`);});
const read=()=>page.evaluate(()=>window.__roomTest.read());
async function focus(id){await page.evaluate(id=>window.__roomTest.focus(id),id);await page.waitForTimeout(120);await page.keyboard.press('KeyE');}
async function shot(name){await page.screenshot({path:`test-results/kitchen-${name}.png`});}
async function enter(){await page.goto('http://127.0.0.1:5179/?e2e=1');await page.evaluate(({key,state})=>localStorage.setItem(key,JSON.stringify(state)),{key:SAVE_KEY,state:{...initialState(),stage:8,completed:true,location:'kitchen'}});await page.reload();await page.locator('#continue').click();await page.waitForFunction(()=>window.__roomTest?.view().mode==='kitchen',null,{timeout:120000});}
try{
 await enter();await focus('kitchen-power');for(const station of employmentOrder)await page.locator(`[data-station="${station}"]`).click();await page.locator('#subway-check').click();assert.equal((await read()).cooking.lights,true);await shot('lit');checks.push('7호선 정답 후 요리방 점등');
 await focus('kitchen-door-pepero');assert.equal((await read()).cooking.opened.pepero,false);checks.push('두 번째 방 선행 잠금');
 await focus('kitchen-market');const counts={};for(const recipe of Object.values(recipes))for(const step of recipe.steps)for(const item of step.need)counts[item]=(counts[item]||0)+1;for(const [item,count] of Object.entries(counts))for(let n=0;n<count;n++)await page.locator(`[data-ingredient="${item}"]`).click();await page.locator('#close-modal').click();
 for(const key of recipeKeys){await focus('kitchen-door-'+key);assert.equal((await read()).cooking.opened[key],true);await focus('cook-'+key);await page.waitForTimeout(150);assert.equal(await page.locator('#photo-view img').getAttribute('src'),`/assets/food-reference/${key}.jpg`);await shot('recipe-'+key);
  for(let index=0;index<recipes[key].steps.length;index++){const step=recipes[key].steps[index];if(step.id==='order'){await page.locator('#delivery-search').fill('BBQ');await page.locator('#delivery-find').click();await page.locator('#chicken-cut').selectOption('drumsticks');await page.locator('#chicken-flavor').selectOption('half');await page.locator('#send-delivery').click();}
   else if(step.id==='receive'){await page.locator('#go-receive').click();await page.waitForFunction(()=>window.__roomTest.read().cooking.orderAt+10000<=Date.now(),null,{timeout:15000});await focus('kitchen-courier');}
   else await page.locator(`[data-action="${step.id}"]`).click();
   assert.equal((await read()).cooking.progress[key],index+1,`${key} ${step.id}`);
  }
  await shot('done-'+key);await page.locator('#leave-kitchen').click();checks.push(`${recipes[key].name} 순서대로 완성`);
 }
 assert.equal((await read()).cooking.completed,true);await page.reload();await page.locator('#continue').click();await page.waitForFunction(()=>window.__roomTest?.view().mode==='kitchen',null,{timeout:120000});assert.equal((await read()).cooking.completed,true);assert.deepEqual(errors,[]);checks.push('새로고침 후 완성 상태 유지');await fs.writeFile('test-results/kitchen-report.json',JSON.stringify({ok:true,checks,errors},null,2));
}catch(error){await shot('failure');await fs.writeFile('test-results/kitchen-report.json',JSON.stringify({ok:false,checks,errors,error:error.stack},null,2));throw error;}finally{await browser.close();}
