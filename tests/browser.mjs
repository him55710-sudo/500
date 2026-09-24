import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
await fs.mkdir('test-results',{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'});
const page=await browser.newPage({viewport:{width:1280,height:800}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('fonts.googleapis'))errors.push(m.text());});
let log=[];
const record=s=>{log.push(s);console.log(s);};
async function shot(name){await page.screenshot({path:`test-results/${name}.png`});}
async function focus(id){await page.evaluate(id=>window.__roomTest.focus(id),id);await page.waitForTimeout(150);await page.waitForFunction(id=>document.querySelector('#prompt')?.hidden===false, id);await page.keyboard.press('KeyE');}
async function close(){await page.locator('#close-modal').click();await page.waitForTimeout(120);}
try{
 await page.goto('http://127.0.0.1:5179/?e2e=1',{waitUntil:'domcontentloaded'});
 await shot('01-intro');await page.locator('#start').click();await page.waitForFunction(()=>window.__roomTest?.ready,null,{timeout:120000});await page.waitForTimeout(300);
 record('3D asset loaded; start button enters the room');
 await page.keyboard.press('KeyV');assert.equal(await page.evaluate(()=>window.__roomTest.view().thirdPerson),true);await shot('02-third-person');await page.keyboard.press('KeyV');
 await page.evaluate(()=>window.__roomTest.setPosition(1,3.5));const before=await page.evaluate(()=>window.__roomTest.view().position);await page.keyboard.down('KeyW');await page.waitForTimeout(700);await page.keyboard.up('KeyW');const after=await page.evaluate(()=>window.__roomTest.view().position);assert.ok(after[2]<before[2]-.2);record('First/third person and WASD movement work');
 await page.evaluate(()=>{window.__roomTest.setPosition(1,-5.35);window.__roomTest.look(1,1.63,-8);});await page.keyboard.down('KeyW');await page.waitForTimeout(350);await page.keyboard.up('KeyW');assert.ok((await page.evaluate(()=>window.__roomTest.view().position))[2]>=-5.43);record('Room boundary collision holds');
 await focus('letter');await page.locator('.letter-paper').waitFor();await shot('03-letter');await close();
 await focus('lock');await page.locator('#try-lock').click();assert.match(await page.locator('#lock-error').innerText(),/잠겨/);
 const target=[21,8,19,0,5,0,0],len=[26,26,26,26,10,10,10];for(let i=0;i<7;i++){const up=target[i]<=len[i]/2;for(let k=0;k<(up?target[i]:len[i]-target[i]);k++)await page.locator(`${up?'.dial-up':'.dial-down'}[data-i="${i}"]`).click();}
 await shot('04-lock');await page.locator('#try-lock').click();await page.waitForFunction(()=>window.__roomTest.read().stage===1);record('Wrong lock rejects; VITA500 opens and reveals frames');
 await page.waitForTimeout(1200);await focus('frames');for(const c of ['red','yellow','green','blue'])await page.locator(`[data-color="${c}"]`).click();assert.match(await page.locator('#frame-error').innerText(),/순서/);await page.locator('#sequence-reset').click();for(const c of ['yellow','green','blue','red'])await page.locator(`[data-color="${c}"]`).click();assert.equal((await page.evaluate(()=>window.__roomTest.read())).framesSolved,true);assert.equal((await page.evaluate(()=>window.__roomTest.read())).inventory.includes('violin'),false);await page.waitForTimeout(1300);await focus('memory-safe');await page.locator('#open-memory-safe').click();await shot('04b-real-keyring-safe');await page.locator('#take-violin').click();assert.equal((await page.evaluate(()=>window.__roomTest.read())).stage,2);record('Chronology opens frame; player opens hidden safe and takes actual violin keepsake');
 await focus('bear');await page.locator('#give-violin').click();assert.match(await page.locator('#doll-error').innerText(),/아닌/);await close();await focus('violinist');await page.locator('#give-violin').click();assert.equal((await page.evaluate(()=>window.__roomTest.read())).stage,3);record('Violin retained on wrong doll and accepted by violinist');
 await focus('carousel');await shot('05-carousel');await page.locator('#take-carousel').click();assert.ok((await page.evaluate(()=>window.__roomTest.read())).inventory.includes('carousel'));
 await focus('painting');await page.locator('#place-carousel').click();await shot('06-painting');await close();record('Carousel pickup and painting placement advance two steps');
 await focus('bench');assert.ok((await page.evaluate(()=>window.__roomTest.read())).inventory.includes('bench'));
 await focus('tile8');assert.equal((await page.evaluate(()=>window.__roomTest.read())).stage,5);
 await focus('tile9');assert.equal((await page.evaluate(()=>window.__roomTest.read())).stage,6);record('Bench at 8 rejected; at 9 grants beef');
 await page.reload();await page.locator('#continue').click();await page.waitForFunction(()=>window.__roomTest?.ready,null,{timeout:120000});await page.waitForTimeout(200);assert.equal((await page.evaluate(()=>window.__roomTest.read())).stage,6);record('Automatic save restores stage and inventory after reload');
 await focus('cow');await page.locator('[data-cut="등심"]').click();await page.locator('[data-cut="등심"]').click();assert.match(await page.locator('#cut-error').innerText(),/아니/);await page.locator('[data-cut="살치살"]').click();await shot('07-beef-map');await page.locator('[data-cut="살치살"]').click();assert.equal((await page.evaluate(()=>window.__roomTest.read())).stage,7);
 await focus('steaks');assert.equal(await page.locator('#vote-area').isVisible(),false);await page.locator('[data-which="hyunsu"]').click();assert.equal(await page.locator('#vote-area').isVisible(),false);await page.locator('[data-which="alpero"]').click();assert.equal(await page.locator('#vote-area').isVisible(),true);await page.locator('#vote-alpero').click();assert.match(await page.locator('#vote-message').innerText(),/다시/);await shot('08-tasting');await page.locator('#vote-hyunsu').click();assert.equal((await page.evaluate(()=>window.__roomTest.read())).stage,8);record('Both distinct tastings required, wrong vote retry and correct vote work');
 await page.waitForTimeout(1600);await focus('exit');await page.locator('.ending-stamp').waitFor();await shot('09-complete');assert.equal((await page.evaluate(()=>window.__roomTest.read())).completed,true);record('Exit opens and the first-room ending is reachable');
 await page.locator('#explore-again').click();await page.keyboard.press('KeyH');await page.locator('.native-help').waitFor();await shot('10-hints');await close();await page.keyboard.press('Escape');await page.locator('#settings').click();await page.locator('#scares').uncheck();await page.locator('#quality').selectOption('standard');await shot('11-settings');record('Contact hint, pause, and atmosphere settings open');
 assert.deepEqual(errors,[]);record('No browser console or runtime errors');
 await fs.writeFile('test-results/browser-report.json',JSON.stringify({ok:true,checks:log,errors},null,2));
}catch(e){console.error(e);await fs.writeFile('test-results/browser-report.json',JSON.stringify({ok:false,checks:log,errors,error:e.stack},null,2));try{await shot('failure');}catch{}throw e;}finally{await browser.close();}
