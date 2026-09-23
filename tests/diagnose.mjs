import {chromium} from '@playwright/test';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{const p=await browser.newPage();p.on('pageerror',e=>console.log('PAGE ERROR',e.message));p.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text());});
await p.goto('http://127.0.0.1:5179/?e2e=1');await p.locator('#start').click();await p.waitForTimeout(5000);console.log(await p.locator('#loading-label').innerText());await p.screenshot({path:'test-results/diagnostic.png'});
}finally{await browser.close();}
