import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1440,height:960}}),errors=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.url().includes('/assets/')&&r.status()>=400)errors.push(r.status()+' '+r.url());});
const view=()=>page.evaluate(()=>window.__roomTest.view());
async function frame(){await page.evaluate(()=>new Promise(requestAnimationFrame));}
async function focus(id){await page.evaluate(id=>window.__roomTest.focus(id),id);await frame();await page.keyboard.press('KeyE');}
try{
 await fs.mkdir('test-results/kitchen-enclosure',{recursive:true});
 await page.goto(new URL('?preview=kitchen&e2e=1',process.env.GAME_BASE_URL||'http://127.0.0.1:5179/').href);
 await page.locator('#princess-preview').click();await page.waitForFunction(()=>window.__roomTest?.view().mode==='kitchen',null,{timeout:120000});
 await focus('kitchen-power');for(const name of ['상동','신대방삼거리','철산'])await page.locator(`[data-station="${name}"]`).click();await page.locator('#subway-check').click();
 await page.waitForFunction(()=>!document.body.classList.contains('dark'));await page.waitForTimeout(1600);
 await page.evaluate(()=>{document.exitPointerLock();window.__roomTest.setPosition(6,-10);window.__roomTest.look(0,4.2,-16);});await frame();
 await page.screenshot({path:'test-results/kitchen-enclosure/walls.png'});
 const input=await page.evaluate(()=>window.__roomTest.input());await page.mouse.move(700,480);await page.mouse.move(800,500,{steps:5});await frame();
 assert.notEqual((await page.evaluate(()=>window.__roomTest.input())).yaw,input.yaw);assert.equal((await view()).thirdPerson,false);
 checks.push('Kitchen first-person view follows the mouse without right-click');
 await focus('kitchen-door-kimchi');await page.waitForTimeout(1300);
 await page.evaluate(()=>{window.__roomTest.setPosition(0,-12.9);window.__roomTest.look(0,1.63,-16);});await page.keyboard.down('KeyW');await page.waitForTimeout(650);await page.keyboard.up('KeyW');
 assert.ok((await view()).position[2]<-14,'player must pass the open doorway');
 await page.evaluate(()=>window.__roomTest.look(3.5,4.5,-13.85));await frame();await page.screenshot({path:'test-results/kitchen-enclosure/interior-corner.png'});
 checks.push('Open doorway remains walkable; front corner and upper walls are sealed');
 await page.keyboard.press('KeyV');
 for(let i=0;i<48;i++){
  const a=(i+.5)*Math.PI/24;await page.evaluate(a=>{window.__roomTest.setPosition(21.15*Math.cos(a),21.15*Math.sin(a));window.__roomTest.look(0,1.45,0);},a);await frame();
  const s=await view();assert.ok(Math.hypot(s.camera[0],s.camera[2])<21.82,`camera escaped outer wall at ${i}`);
 }
 await page.evaluate(()=>{window.__roomTest.setPosition(12,10);window.__roomTest.look(12,20,9);});await frame();assert.ok((await view()).camera[1]>.05,'orbit camera passed below the floor');
 checks.push('Third-person camera stays inside the full perimeter and above the floor');
 assert.deepEqual(errors,[]);await fs.writeFile('test-results/kitchen-enclosure/report.json',JSON.stringify({ok:true,checks,errors},null,2));console.log(checks.join('\n'));
}catch(error){await page.screenshot({path:'test-results/kitchen-enclosure/failure.png'});throw error;}finally{await browser.close();}
