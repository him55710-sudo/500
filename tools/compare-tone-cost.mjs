import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1280,height:800}});
try{
 // No Vite client or game UI: unrelated live edits cannot reload this measurement.
 await page.route('**/render-audit.html',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><body style="margin:0;overflow:hidden"><canvas id="scene"></canvas></body>'}));
 await page.goto('http://127.0.0.1:5186/render-audit.html');
 await page.evaluate(async()=>{
  const {World}=await import('/src/world.js');const {initialState}=await import('/src/state.js');const {enterHeaven}=await import('/src/heaven.js');
  const world=new World(document.querySelector('canvas'),()=>{});await world.ready;world.sync(initialState(),false);await enterHeaven(world,()=>{});
  world.started=true;world.active=true;world.setQuality('high');world.player.set(.5,0,4.2);world.lookAtPoint([-1,2.2,-3.5]);
  window.__auditWorld=world;let previous=performance.now();const frame=now=>{world.update(Math.min((now-previous)/1000,.25),now/1000,()=>{});previous=now;requestAnimationFrame(frame);};requestAnimationFrame(frame);
 });
 const results=[];
 for(const tone of ['ACESFilmicToneMapping','NeutralToneMapping']){
  await page.evaluate(async tone=>{const THREE=await import('/node_modules/.vite/deps/three.js');window.__auditWorld.renderer.toneMapping=THREE[tone];},tone);
  await page.waitForTimeout(1500);
  const measurement=await page.evaluate(()=>new Promise(resolve=>{const samples=[];let start=performance.now(),last=start;const frame=now=>{samples.push(now-last);last=now;if(now-start<5000)requestAnimationFrame(frame);else resolve({averageFps:1000*samples.length/samples.reduce((a,b)=>a+b,0),drawCalls:window.__auditWorld.renderer.info.render.calls,triangles:window.__auditWorld.renderer.info.render.triangles});};requestAnimationFrame(frame);}));
  results.push({tone,...measurement});
 }
 await fs.writeFile('test-results/tone-cost.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results));
}finally{await browser.close();}
