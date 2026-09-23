import {chromium} from '@playwright/test';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{const p=await browser.newPage({viewport:{width:1440,height:900}});await p.goto('http://127.0.0.1:5179/?e2e=1');await p.locator('#start').click();await p.waitForFunction(()=>window.__roomTest?.ready,null,{timeout:60000});
await p.evaluate(()=>document.querySelector('#hud').hidden=true);
for(const [name,x,z,target] of [['salon',3.6,4.9,[-2,2.1,-.7]],['dolls',-3.55,-.8,[-4.65,1.34,-.8]],['carousel',-3.4,1.65,[-4.62,1.44,1.65]],['ceiling',0,2,[0,4.4,-.7]]]){
 await p.evaluate(({x,z,target})=>{window.__roomTest.setPosition(x,z);window.__roomTest.look(...target);},{x,z,target});await p.waitForTimeout(250);await p.screenshot({path:`test-results/v2-${name}.png`});
}console.log('Visual review screenshots saved');}finally{await browser.close();}
