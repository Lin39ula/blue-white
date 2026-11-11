import fs from 'node:fs';
const dir=process.argv[2]||'qa/competition-verified';
const report=JSON.parse(fs.readFileSync(dir+'/report.json','utf8'));
const groups=[];
for(const frame of report.transitions){
  if(groups.at(-1)?.chapter!==frame.chapter)groups.push({chapter:frame.chapter,frames:[]});
  groups.at(-1).frames.push(frame);
}
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
// Audit the six deliberate journeys in order. Earlier reports also contain
// subsequent interrupted navigation and viewport resizing; do not mistake those
// intentionally unfinished motions for a completed transition endpoint.
const expected=[1,2,3,4,5,0], selected=[], excluded=[];
for(const g of groups){
 if(selected.length===expected.length)break;
 if(g.chapter===expected[selected.length]&&g.frames.some(f=>f.p>0&&f.p<1)&&g.frames.some(f=>f.p===1))selected.push(g);
 else excluded.push({chapter:g.chapter,startProgress:g.frames[0].p,endProgress:g.frames.at(-1).p,reason:'initial settled state or intermediate chapter traversed during navigation'});
}
const transitions=selected.map(g=>{
  const before=g.frames.filter(f=>f.p<1).at(-1);
  const end=g.frames.find(f=>f.p===1);
  const stable=g.frames.at(-1);
  const delta=end?{position:distance(before.position,end.position),camera:distance(before.camera,end.camera),scale:Math.abs(before.scale-end.scale),alpha:Math.abs(before.alpha-end.alpha)}:null;
  return {chapter:g.chapter,start:g.frames[0],beforeEnd:before,end,stable,delta,pass:!!delta&&delta.position<.03&&delta.camera<.02&&delta.scale<.05&&delta.alpha<.02};
});
const result={browser:report.version,scope:'six completed journeys [1,2,3,4,5,0], excluding later resize and interruption tests',excluded,transitions,pass:transitions.length>=6&&transitions.every(t=>t.pass)};
fs.writeFileSync(dir+'/transition-audit.json',JSON.stringify(result,null,2));
console.log(JSON.stringify({pass:result.pass,transitions:transitions.map(t=>({chapter:t.chapter,pass:t.pass,delta:t.delta}))},null,2));
if(!result.pass)process.exitCode=1;
