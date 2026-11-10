import {chromium} from '@playwright/test';import fs from 'node:fs';
process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY='1';
const round=process.argv[2]||'baseline',dir=`qa/${round}`;fs.mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({headless:true,channel:"chromium",args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:1000}});page.setDefaultTimeout(120000);const report={console:[],errors:[],failed:[],checks:[]};
page.on('console',m=>{if(['warning','error'].includes(m.type()))report.console.push({type:m.type(),text:m.text()})});page.on('pageerror',e=>report.errors.push(e.message));page.on('requestfailed',r=>report.failed.push({url:r.url(),error:r.failure()}));
await page.goto((process.env.BASE_URL||'http://127.0.0.1:5175/'),{waitUntil:'domcontentloaded',timeout:120000});await page.waitForTimeout(15000);
for(let i=0;i<6;i++){await page.locator(`#s${i}`).evaluate(e=>e.scrollIntoView({behavior:'instant'}));await page.waitForTimeout(3400);await page.screenshot({path:`${dir}/chapter-${i+1}.png`});}
await page.locator('#s2').evaluate(e=>e.scrollIntoView({behavior:'instant'}));await page.waitForTimeout(3400);await page.getByRole('button',{name:'进入青花工坊'}).click();await page.waitForTimeout(1000);
for(let i=0;i<6;i++){await page.locator('.steps button').nth(i).click();await page.waitForTimeout(600);await page.screenshot({path:`${dir}/diy-${i+1}.png`});}await page.getByRole('button',{name:'返回经典文物'}).click();
await page.setViewportSize({width:390,height:844});for(let i=0;i<5;i++){await page.locator(`#s${i}`).evaluate(e=>e.scrollIntoView({behavior:'instant'}));await page.waitForTimeout(3400);await page.screenshot({path:`${dir}/mobile-${i+1}.png`});}
report.checks.push({name:'webgl',value:await page.locator('canvas').count()});fs.writeFileSync(`${dir}/report.json`,JSON.stringify(report,null,2));await browser.close();


