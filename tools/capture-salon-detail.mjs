import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
const label=process.argv[2]||'after';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1440,height:960}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('fonts.googleapis'))errors.push(m.text());});
await fs.mkdir('test-results',{recursive:true});
try{
 await page.addInitScript(()=>localStorage.setItem('hayoung500.settings',JSON.stringify({version:2,quality:'high',motion:false,scares:false})));
 await page.goto('http://127.0.0.1:5179/?e2e=1',{waitUntil:'networkidle'});
 await page.locator('#start').click();
 await page.waitForFunction(()=>window.__roomTest?.ready,null,{timeout:120000});
 await page.addStyleTag({content:'#hud,#resume-capture,#subtitle{visibility:hidden!important}'});
 const views=[['overview',[1.1,3.6],[-2.5,2.1,-3.4]],['window',[-2.55,-3.1],[-5.65,2.68,-3.5]],['curtain',[-3.45,2.9],[-5.5,2.8,3.85]],['rug',[0,2.6],[0,0,-.8]]];
 const report={label,errors,views:{}};
 for(const [name,position,target] of views){
  await page.evaluate(({position,target})=>{window.__roomTest.setPosition(...position);window.__roomTest.look(...target);},{position,target});
  await page.waitForTimeout(800);
  await page.screenshot({path:`test-results/salon-${name}-${label}.png`});
  report.views[name]=await page.evaluate(()=>window.__roomTest.view());
 }
 await fs.writeFile(`test-results/salon-detail-${label}.json`,JSON.stringify(report,null,2));
 console.log(JSON.stringify(report));
 if(errors.length)throw new Error(errors.join('\n'));
}finally{await browser.close();}
