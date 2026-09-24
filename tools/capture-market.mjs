import {chromium} from '@playwright/test';
import {SAVE_KEY,initialState} from '../src/state.js';
import {initialKitchen} from '../src/kitchen-state.js';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage({viewport:{width:1600,height:1000}});
 await page.goto('http://127.0.0.1:5179/?e2e=1');
 await page.evaluate(({key,state})=>localStorage.setItem(key,JSON.stringify(state)),{key:SAVE_KEY,state:{...initialState(),stage:8,completed:true,location:'kitchen',cooking:{...initialKitchen(),lights:true}}});
 await page.reload();await page.locator('#continue').click();await page.waitForFunction(()=>window.__roomTest?.view().mode==='kitchen');
 await page.evaluate(()=>{window.__roomTest.setPosition(6.5,12);window.__roomTest.look(0,2.1,-2);});
 await page.waitForTimeout(8200);await page.screenshot({path:'test-results/market-final.png'});console.log('Saved actual game view: test-results/market-final.png');
}finally{await browser.close();}
