import {useMemo,useEffect} from 'react';
import {CanvasTexture} from 'three';
import type {ComponentProps} from 'react';
import {Canvas} from '@react-three/fiber';
import {Pottery} from './Pottery';
import {NarrativeScene} from './NarrativeScene';
import {ViewingControls} from './ViewingControls';
import {ModelBoundary} from './Loading';

type Props = ComponentProps<typeof Pottery> & {
  diy:boolean; modelUrl:string; attempt:number; firing:boolean; inspect:boolean;
  chapter:number; settled:boolean; selected:number; onSelect:(n:number)=>void;
  onReady:()=>void; onSettled:()=>void;
};

export default function SceneCanvas(props:Props) {
  const {diy, modelUrl, attempt, firing, inspect, chapter, settled, selected, onSelect, onReady, onSettled, step, paint}=props;
  const texture=useMemo(()=>new CanvasTexture(paint.canvas),[paint.canvas]);paint.textureRef.current=texture;useEffect(()=>()=>{texture.dispose();if(paint.textureRef.current===texture)paint.textureRef.current=null},[texture,paint.textureRef]);
  return <Canvas frameloop={!diy&&!inspect&&settled&&[3,4].includes(chapter)?'demand':'always'} gl={{antialias:false}} dpr={[1,1]} camera={{position:[0,0,8],fov:38}}>
    <ambientLight intensity={1.3}/>
    <spotLight position={[5,8,5]} intensity={100}/>
    <pointLight position={[-4,2,3]} intensity={30} color={firing?'#ff6a12':'#9cbfff'}/>
    <ModelBoundary key={diy?'diy':'original'+attempt}>
      {diy?<Pottery {...props}/>:modelUrl?<NarrativeScene url={modelUrl} onReady={onReady} chapter={chapter} selected={selected} onSelect={onSelect} onSettled={onSettled}/>:null}
    </ModelBoundary>
    <ViewingControls diy={diy} inspect={inspect} enabled={!diy||step>1&&(step!==3||paint.observe)} chapter={chapter}/>
  </Canvas>;
}
