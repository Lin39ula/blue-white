import {chromium} from '@playwright/test';
import fs from 'node:fs';
process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY='1';
const dir='qa/refinement-round2';fs.mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({headless:true,channel:'chromium',args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});
const context=await browser.newContext({viewport:{width:1440,height:1000},recordVideo:{dir:dir+'/video',size:{width:1152,height:800}}});
const page=await context.newPage();page.setDefaultTimeout(90000);
const report={errors:[],console:[],network:[],http:[],checks:[],transitions:[]};
page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(['error','warning'].includes(m.type()))report.console.push({type:m.type(),message:m.text()})});page.on('requestfailed',r=>report.network.push({url:r.url(),failure:r.failure()}));page.on('response',r=>{if(r.status()>=400)report.http.push({url:r.url(),status:r.status()})});
const check=(name,pass,detail)=>{report.checks.push({name,pass,detail});console.log(name,pass)};
const snap=async(name)=>{await page.screenshot({path:`${dir}/${name}.png`,timeout:120000})};
const go=async i=>{await page.locator('#s'+i).evaluate(e=>e.scrollIntoView({behavior:'instant'}));await page.waitForFunction(i=>Number(document.querySelector('.stage').dataset.chapter)===i,i);await page.waitForTimeout(2800)};
try{
 await page.goto('http://127.0.0.1:5175/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.querySelector('.stage')?.dataset.pose);await page.waitForTimeout(3000);
 await page.evaluate(()=>{window.__frames=[];window.__record=false;function tick(){if(window.__record){const e=document.querySelector('.stage');if(e?.dataset.pose){const state=JSON.parse(e.dataset.pose);window.__frames.push({...state,time:performance.now(),scroll:scrollY,galleryOpacity:getComputedStyle(document.querySelector('.gallery')).opacity});}}requestAnimationFrame(tick)}requestAnimationFrame(tick)});
 for(let i=0;i<6;i++){await go(i);await snap(`chapter-${i+1}`);}
 await go(1);
 for(let i=0;i<3;i++){await page.locator('.material-tabs button').nth(i).click();await page.waitForTimeout(450);await snap(`material-${i+1}`);check(`material ${i+1} loaded`,await page.locator('.material-detail img').evaluate(e=>e.complete&&e.naturalWidth>0));}
 await page.locator('.material-tabs button').nth(2).click();check('material deselect',await page.locator('.material-tabs [aria-pressed=true]').count()===0);
 await go(3);
 for(let i=0;i<8;i++){await page.locator('.thumbs button').nth(i).click();await page.waitForTimeout(850);await snap(`artifact-${i+1}`);check(`artifact ${i+1} loaded`,await page.locator('.artifact-visual img').evaluate(e=>e.complete&&e.naturalWidth>0));}
 await page.getByRole('button',{name:'上一件文物',exact:true}).click();await page.waitForTimeout(70);await snap('artifact-switch-exit');await page.waitForTimeout(220);await snap('artifact-switch-enter');await page.waitForTimeout(650);
 await page.keyboard.press('ArrowRight');await page.waitForTimeout(800);check('artifact keyboard',await page.locator('.gallery').getAttribute('data-artifact')==='7');
 await page.locator('.thumbs button').nth(0).click();await page.waitForTimeout(40);await page.locator('.thumbs button').nth(7).click();await page.waitForTimeout(800);check('artifact interrupted return visible',await page.locator('.artifact-visual').evaluate(e=>+getComputedStyle(e).opacity>.99));
 await page.locator('.thumbs button').nth(1).click();await page.locator('.thumbs button').nth(3).click();await page.locator('.thumbs button').nth(5).click();await page.waitForTimeout(900);check('artifact rapid final selection',await page.locator('.gallery').getAttribute('data-artifact')==='5');
 // Record every browser animation frame, including endpoints and reverse directions.
 for(const [from,to] of [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[3,2],[2,1],[1,0]]){
  await go(from);await page.evaluate(()=>{window.__frames=[];window.__record=true});
  await page.locator('#s'+to).evaluate(e=>e.scrollIntoView({behavior:'instant'}));await page.waitForTimeout(650);await snap(`transition-${from}-${to}-process`);await page.waitForFunction(()=>+document.querySelector('.stage').dataset.progress>.90);await snap(`transition-${from}-${to}-end`);await page.waitForTimeout(650);await snap(`transition-${from}-${to}-settled`);
  const frames=await page.evaluate(()=>{window.__record=false;return window.__frames});fs.writeFileSync(`${dir}/transition-${from}-${to}.json`,JSON.stringify(frames,null,2));
  const f=frames.filter(s=>s.chapter===to),before=f.filter(s=>s.p<1).at(-1),end=f.find(s=>s.p===1),settled=f.at(-1);
  const delta=before&&end?{position:Math.hypot(...end.position.map((v,i)=>v-before.position[i])),scale:Math.abs(end.scale-before.scale),camera:Math.hypot(...end.camera.map((v,i)=>v-before.camera[i])),alpha:Math.abs(end.alpha-before.alpha)}:null;
  report.transitions.push({from,to,start:f[0],middle:f.reduce((a,b)=>Math.abs(b.p-.5)<Math.abs(a.p-.5)?b:a,f[0]),before,end,settled,endpointDelta:delta});check(`transition ${from}->${to} settles`,!!end&&settled.p===1,delta);
 }
 // Navigation interrupted by reverse wheel input should settle at one real section.
 await go(0);await page.locator('nav a').nth(2).click();await page.waitForTimeout(150);await page.mouse.wheel(0,-400);await page.waitForTimeout(4000);check('scroll interrupt settles',await page.evaluate(()=>Array.from(document.querySelectorAll('section')).some(e=>Math.abs(e.getBoundingClientRect().top)<3)));
 await go(0);await page.locator('.view-mode').click();const before=JSON.parse(await page.locator('.stage').getAttribute('data-pose')).camera;await page.mouse.move(850,500);await page.mouse.down();await page.mouse.move(950,530,{steps:12});await page.mouse.up();await page.mouse.wheel(0,-250);await page.waitForTimeout(600);const after=JSON.parse(await page.locator('.stage').getAttribute('data-pose')).camera;check('orbit and zoom change camera',Math.hypot(...after.map((v,i)=>v-before[i]))>.1);await snap('model-inspection');await page.locator('.view-mode').click();
 await go(2);await page.getByRole('button',{name:'进入青花工坊'}).click();await page.waitForTimeout(1300);
 for(let i=0;i<6;i++){
  await page.locator('.steps button').nth(i).click();await page.waitForFunction(()=>{const v=document.querySelector('video');return v&&v.readyState>=2});await page.waitForTimeout(350);
  if(i===0){await page.mouse.move(640,560);await page.mouse.down();await page.mouse.move(690,570,{steps:12});await page.mouse.up();check('kneading responds',await page.locator('progress').evaluate(e=>e.value>0));}
  if(i===1){await page.getByRole('button',{name:'暂停陶轮'}).click();await page.mouse.move(640,560);await page.mouse.down();await page.mouse.move(690,530,{steps:12});await page.mouse.up();check('wheel pause',await page.getByRole('button',{name:'继续旋转'}).count()===1);}
  if(i===2){await page.getByRole('button',{name:'开始修坯'}).click();await page.waitForTimeout(1900);}
  if(i===3){await page.mouse.move(640,520);await page.mouse.down();await page.mouse.move(680,590,{steps:12});await page.mouse.up();check('painting responds',await page.locator('.workshop').getAttribute('data-painted')==='true');await page.getByRole('button',{name:'撤销',exact:true}).click();await page.getByRole('button',{name:'重做',exact:true}).click();}
  if(i===4){await page.locator('input[type=range]').fill('0.9');}
  if(i===5){await page.getByRole('button',{name:'开始烧制',exact:true}).click();await page.waitForTimeout(800);await snap('diy-firing');await page.waitForTimeout(4700);check('firing completes',await page.getByRole('button',{name:'烧制完成 · 再烧一次'}).count()===1);}
  await snap(`diy-${i+1}`);check(`video ${i+1} ready`,await page.locator('video').evaluate(e=>e.readyState>=2&&!e.error));
 }
 await page.getByRole('button',{name:'返回经典文物'}).click();await page.waitForTimeout(3200);await snap('diy-exit');check('exit restores original scene',await page.locator('.stage').evaluate(e=>e.dataset.chapter==='2'&&!e.classList.contains('is-diy')&&JSON.parse(e.dataset.pose).alpha===1));
 await page.setViewportSize({width:390,height:844});for(let i=0;i<6;i++){await go(i);await snap(`mobile-${i+1}`);check(`mobile ${i+1} no horizontal overflow`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 await go(2);await page.getByRole('button',{name:'进入青花工坊'}).click();await page.waitForTimeout(1200);await page.locator('.steps button').nth(1).click();await snap('mobile-diy-model');await page.locator('.demo').scrollIntoViewIfNeeded();await snap('mobile-diy-video');check('mobile video readable',await page.locator('video').evaluate(e=>e.getBoundingClientRect().width>320));await page.getByRole('button',{name:'返回经典文物'}).click();
 check('no internal UI notes',await page.locator('body').evaluate(e=>!/ZIP|用户提供|程序化|待补充|原始资料/.test(e.innerText)));
 check('no page errors',report.errors.length===0);check('no HTTP errors',report.http.length===0);
}catch(e){report.errors.push(String(e));console.error(e)}finally{fs.writeFileSync(`${dir}/report.json`,JSON.stringify(report,null,2));await context.close();await browser.close();}
