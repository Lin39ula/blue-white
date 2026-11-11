import {Component,Suspense,useEffect,useState} from 'react';
import type {useModelDownload} from './useModelDownload';
class Boundary extends Component<{children:React.ReactNode},{error:boolean}>{state={error:false};static getDerivedStateFromError(){return {error:true}}componentDidCatch(error:Error){document.documentElement.dataset.moduleError=String(/dynamically imported|Importing a module|Loading chunk/i.test(error.message));document.documentElement.dataset.modelError='true';window.dispatchEvent(new Event('model-error'))}render(){return this.state.error?null:this.props.children}}
export function ModelBoundary({children}:{children:React.ReactNode}){return <Boundary><Suspense fallback={null}>{children}</Suspense></Boundary>}
export function LoadStatus({model,ready}:{model:ReturnType<typeof useModelDownload>;ready:boolean}){
 const [failed,F]=useState(false);
 useEffect(()=>{F(false)},[model.attempt]);
 useEffect(()=>{const f=()=>F(true);window.addEventListener('model-error',f);return()=>window.removeEventListener('model-error',f)},[]);
 if(ready&&!failed&&!model.error)return null;
 const error=failed||model.error;
 return <div className="load-overlay"><strong role="status">{error?'器物暂时无法呈现':model.url?'正在呈现器物…':'正在唤醒器物'}</strong>{!error&&!model.url&&<><progress aria-label="器物下载进度" value={model.total?model.loaded:undefined} max={model.total||1}/><span>{(model.loaded/1048576).toFixed(1)} MB{model.total?' / '+(model.total/1048576).toFixed(1)+' MB':''}</span></>}<p>{model.adapted?"连接较慢，已切换省流模型。":"先读卷首，或继续探索藏品与传承。"}</p>{error&&<button onClick={()=>document.documentElement.dataset.moduleError==='true'?location.reload():model.retry()}>重试器物</button>}<a href="#s3">先看经典藏品 →</a></div>
}
