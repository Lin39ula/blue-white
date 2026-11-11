import {useEffect} from 'react';

export function useChapterSnap(disabled:boolean){
 useEffect(()=>{
  if(disabled)return;
  let timer:ReturnType<typeof setTimeout>|undefined,raf=0;
  const cancel=()=>{if(timer)clearTimeout(timer);cancelAnimationFrame(raf);raf=0};
  const target=(element:Element)=>{
   cancel();const y=scrollY+element.getBoundingClientRect().top;
   if(matchMedia('(prefers-reduced-motion: reduce)').matches){window.scrollTo({top:y,behavior:'instant'});return;}
   const start=scrollY,t=performance.now();
   const frame=(now:number)=>{const p=Math.min(1,(now-t)/700);window.scrollTo({top:start+(y-start)*(p*p*(3-2*p)),behavior:'instant'});raf=p<1?requestAnimationFrame(frame):0};
   raf=requestAnimationFrame(frame);
  };
  const scroll=()=>{
   if(timer)clearTimeout(timer);if(raf)return;
   timer=setTimeout(()=>{const sections=Array.from(document.querySelectorAll('main>section'));if(!sections.length)return;
    const near=sections.reduce((a,b)=>Math.abs(b.getBoundingClientRect().top)<Math.abs(a.getBoundingClientRect().top)?b:a);
    if(Math.abs(near.getBoundingClientRect().top)>3)target(near);
   },240);
  };
  const click=(e:MouseEvent)=>{const a=(e.target as HTMLElement).closest('a[href^="#s"]');if(!a)return;const el=document.querySelector(a.getAttribute('href')!);if(el){e.preventDefault();target(el)}};
  // Resize or fresh user input invalidates an animation's captured scroll target.
  window.addEventListener('scroll',scroll,{passive:true});
  for(const event of ['wheel','touchstart','pointerdown','keydown','resize'])window.addEventListener(event,cancel,{passive:true});
  document.addEventListener('click',click);
  return()=>{cancel();window.removeEventListener('scroll',scroll);for(const event of ['wheel','touchstart','pointerdown','keydown','resize'])window.removeEventListener(event,cancel);document.removeEventListener('click',click)};
 },[disabled]);
}
