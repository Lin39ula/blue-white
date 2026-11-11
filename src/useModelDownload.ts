import {useEffect, useState} from 'react';
import {asset} from './asset';
export type ModelQuality='lite'|'standard'|'original';
type Mode=ModelQuality|'auto';
const files:Record<ModelQuality,string>={lite:'/models/vase-lite.glb',standard:'/models/vase-standard.glb',original:'/模型.glb'};
function automaticQuality():ModelQuality {
 const connection=(navigator as Navigator & {connection?:{saveData?:boolean;effectiveType?:string;downlink?:number}}).connection;
 return connection&&(connection.saveData||['slow-2g','2g','3g'].includes(connection.effectiveType||'')||(connection.downlink!==undefined&&connection.downlink<1.5))?'lite':'standard';
}
function initial(){let mode:Mode='auto';try{const saved=sessionStorage.getItem('bw-model-mode');if(['auto','lite','standard','original'].includes(saved||''))mode=saved as Mode}catch{}return {mode,quality:mode==='auto'?automaticQuality():mode,attempt:0,adapted:false}}
export function useModelDownload() {
 const [request,setRequest]=useState(initial);
 const [state,setState]=useState({url:'',loaded:0,total:0,error:false});
 useEffect(()=>{
  const abort=new AbortController();let url='',loaded=0,total=0;
  const started=performance.now();
  setState({url:'',loaded:0,total:0,error:false});
  document.documentElement.dataset.modelPending='true';
  document.documentElement.dataset.modelQuality=request.quality;
  delete document.documentElement.dataset.modelError;
  const slow=setInterval(()=>{
   const elapsed=(performance.now()-started)/1000;
   if(request.mode==='auto'&&request.quality==='standard'&&elapsed>=8&&loaded/elapsed<200*1024&&(!total||total-loaded>512*1024)){
    abort.abort();setRequest(prev=>prev.attempt===request.attempt?{...prev,quality:'lite',attempt:prev.attempt+1,adapted:true}:prev);
   }
  },1000);
  async function download(){try{
   const response=await fetch(asset(files[request.quality]),{signal:abort.signal});
   if(!response.ok)throw Error('Model HTTP '+response.status);
   total=Number(response.headers.get('content-length'))||0;
   const reader=response.body?.getReader(),parts:ArrayBuffer[]=[];let lastUpdate=0;
   if(reader){while(true){const {done,value}=await reader.read();if(done)break;parts.push(value.slice().buffer as ArrayBuffer);loaded+=value.byteLength;
    if(performance.now()-lastUpdate>150){lastUpdate=performance.now();setState({url:'',loaded,total,error:false})}
   }}else{const bytes=await response.arrayBuffer();parts.push(bytes);loaded=bytes.byteLength}
   clearInterval(slow);if(abort.signal.aborted)return;
   url=URL.createObjectURL(new Blob(parts,{type:'model/gltf-binary'}));setState({url,loaded,total:loaded,error:false});
  }catch{clearInterval(slow);if(!abort.signal.aborted)setState(s=>({...s,error:true}))}}
  void download();return()=>{clearInterval(slow);abort.abort();if(url)URL.revokeObjectURL(url)};
 },[request.attempt,request.quality]);
 const select=(mode:Mode)=>{try{sessionStorage.setItem('bw-model-mode',mode)}catch{}setRequest(prev=>({...prev,mode,quality:mode==='auto'?automaticQuality():mode,attempt:prev.attempt+1,adapted:false}))};
 return {...state,...request,select,retry:()=>setRequest(p=>({...p,attempt:p.attempt+1}))};
}
