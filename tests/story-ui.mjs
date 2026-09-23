import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1440,height:1040}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{
 window.__copiedHint='';
 Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{if(window.__clipboardFail)throw new Error('Clipboard unavailable');window.__copiedHint=text;}}});
});
async function focus(id){
 await page.evaluate(id=>window.__roomTest.focus(id),id);
 // Let the next rendered frame update the ray target before pressing E.
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 await page.waitForFunction(()=>document.querySelector('#prompt')?.hidden===false);
 await page.keyboard.press('KeyE');
}
async function screenshot(name){await page.screenshot({path:`test-results/${name}.png`});}
try{
 await page.goto((process.env.GAME_BASE_URL||'http://127.0.0.1:5186/')+'?e2e=1',{waitUntil:'networkidle'});
 await page.locator('#start').click();await page.waitForFunction(()=>window.__roomTest?.ready,null,{timeout:120000});await page.locator('#hud').waitFor({state:'visible'});
 await focus('letter');await page.locator('.keepsake-paper').waitFor();assert.match(await page.locator('.letter-lines').innerText(),/500[\s\S]*오로나민 C[\s\S]*다른 거/);await screenshot('story-letter-desktop');
 await page.setViewportSize({width:390,height:844});assert.equal(await page.locator('#modal').evaluate(el=>el.scrollWidth<=el.clientWidth),true);await screenshot('story-letter-mobile');
 await page.setViewportSize({width:1440,height:1040});await page.locator('#letter-help').click();assert.match(await page.locator('#hint-question').inputValue(),/편지 속 음료와 자물쇠/);assert.equal(await page.locator('.hint-envelope').getAttribute('open'),null);assert.equal(await page.locator('.hint-card').count(),0);await screenshot('story-hint-desktop');
 await page.locator('#copy-hint').click();assert.equal(await page.evaluate(()=>window.__copiedHint),await page.locator('#hint-question').inputValue());assert.match(await page.locator('#copy-status').innerText(),/복사했어/);
 await page.evaluate(()=>{window.__clipboardFail=true;});await page.locator('#copy-hint').click();assert.match(await page.locator('#copy-status').innerText(),/Ctrl\+C/);assert.equal(await page.locator('#hint-question').evaluate(el=>el.selectionEnd-el.selectionStart),await page.locator('#hint-question').evaluate(el=>el.value.length));
 await page.locator('.hint-envelope summary').click();
 await page.locator('#next-hint').click();assert.equal(await page.locator('.hint-card').count(),1);assert.doesNotMatch(await page.locator('#hint-text').innerText(),/V.*I.*T.*A/);
 await page.locator('#next-hint').click();assert.equal(await page.locator('.hint-card').count(),2);assert.doesNotMatch(await page.locator('#hint-text').innerText(),/V.*I.*T.*A/);
 await page.locator('#next-hint').click();assert.equal(await page.locator('.hint-card').count(),3);assert.match(await page.locator('#hint-text').innerText(),/V · I · T · A/);assert.equal(await page.locator('#next-hint').isDisabled(),true);
 await page.locator('#hint-close').click();await page.keyboard.press('KeyH');assert.equal(await page.locator('.hint-card').count(),3);assert.equal(await page.locator('#next-hint').isDisabled(),true);
 await page.setViewportSize({width:390,height:844});assert.equal(await page.locator('#modal').evaluate(el=>el.scrollWidth<=el.clientWidth),true);await screenshot('story-hint-mobile');
 await page.setViewportSize({width:1440,height:1040});await page.locator('#close-modal').click();await page.keyboard.press('KeyJ');await page.locator('.journal-empty').waitFor();await screenshot('story-journal-empty');await page.locator('#journal-close').click();
 await focus('lock');const target=[21,8,19,0,5,0,0],len=[26,26,26,26,10,10,10];for(let i=0;i<7;i++){const up=target[i]<=len[i]/2;for(let k=0;k<(up?target[i]:len[i]-target[i]);k++)await page.locator(`${up?'.dial-up':'.dial-down'}[data-i="${i}"]`).click();}
 await page.locator('#try-lock').click();await page.waitForFunction(()=>window.__roomTest.read().stage===1);
 await page.keyboard.press('KeyH');assert.equal(await page.locator('.hint-card').count(),0);assert.equal(await page.locator('.hint-envelope').getAttribute('open'),null);assert.match(await page.locator('#hint-question').inputValue(),/네 장의 기억/);await page.locator('#hint-close').click();
 await page.keyboard.press('KeyJ');assert.equal(await page.locator('.memory-pages li').count(),1);assert.match(await page.locator('.memory-pages').innerText(),/VITA500/);await screenshot('story-journal-desktop');
 await page.setViewportSize({width:390,height:844});assert.equal(await page.locator('#modal').evaluate(el=>el.scrollWidth<=el.clientWidth),true);await screenshot('story-journal-mobile');
 await page.keyboard.press('Escape');assert.equal(await page.locator('#modal-backdrop').isVisible(),false);
 assert.deepEqual(errors,[]);
 const report={ok:true,checks:['Original letter clues retained','Desktop and 390px letter, hint and journal layouts fit','Hint question follows current puzzle','Copy succeeds and manual selection fallback works without touching system clipboard','Three hint cards reveal sequentially; final answer requires third click','Opened hints persist when reopening and reset for the next puzzle','Original seven-wheel lock still solves through actual UI','Journal changes from empty to one completed memory','Escape closes dialog; no page errors'],errors};
 await fs.writeFile('test-results/story-ui-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}catch(error){await screenshot('story-ui-failure');throw error;}finally{await browser.close();}
