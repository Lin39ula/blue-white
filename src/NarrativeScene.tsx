import {useMemo,useRef,useEffect} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {Center,useGLTF,Edges,Environment,Lightformer} from '@react-three/drei';
import {CanvasTexture,Group,Mesh,MeshStandardMaterial,SRGBColorSpace,InstancedMesh,Object3D} from 'three';
import {asset} from './asset';

type Pose={x:number;y:number;h:number;alpha:number;blocks:number;spread:number;photo:number;angle:number};
const smooth=(t:number)=>t*t*(3-2*t);
const mix=(a:Pose,b:Pose,t:number)=>Object.fromEntries(Object.keys(a).map(k=>[k,a[k as keyof Pose]+(b[k as keyof Pose]-a[k as keyof Pose])*t])) as Pose;
function goal(ch:number,mobile:boolean):Pose {return {x:ch===1?.34:ch===3?(mobile?.30:.47):(mobile?.55:[0,5].includes(ch)?.73:.59),y:mobile?(ch===1?.43:ch===3?.57:[0,5].includes(ch)?.75:.64):.53,h:ch===3?(mobile?.35:.56):(mobile?([0,5].includes(ch)?.26:.38):.64),alpha:[1,4].includes(ch)?0:ch===3?0:1,blocks:ch===1?1:0,spread:ch===1?1:0,photo:ch===3?1:0,angle:0};}
function grain(cobalt:boolean){const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d')!;let seed=42;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};const d=ctx.createImageData(256,256);for(let i=0;i<d.data.length;i+=4){const n=rand(),cloud=Math.sin(i/4%256*.06)*Math.cos(Math.floor(i/1024)*.05)*.12;const v=.65+n*.35+cloud;d.data[i]=(cobalt?19:223)*v;d.data[i+1]=(cobalt?48:213)*v;d.data[i+2]=(cobalt?88:190)*v;d.data[i+3]=255;}ctx.putImageData(d,0,0);const t=new CanvasTexture(c);t.colorSpace=SRGBColorSpace;return t;}
export function NarrativeScene({chapter,selected,onSelect,onSettled}:{chapter:number;selected:number;onSelect:(i:number)=>void;onSettled:()=>void}){
 const {scene}=useGLTF(asset('/模型.glb'));const {camera,size,viewport}=useThree();
 const original=useMemo(()=>{const copy=scene.clone(true);copy.traverse(o=>{if(o instanceof Mesh){o.material=Array.isArray(o.material)?o.material.map(m=>m.clone()):o.material.clone();}});return copy},[scene]);
 const textures=useMemo(()=>[grain(false),grain(true)],[]);useEffect(()=>()=>{textures.forEach(t=>t.dispose());original.traverse(o=>{if(o instanceof Mesh)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose())})},[original,textures]);
 const vase=useRef<Group>(null),blocks=useRef<Group>(null);const hover=useRef(-1);const current=useRef(chapter===0?{...goal(chapter,size.width<800),x:.5,h:size.width<800?.8:1.35,alpha:0,angle:-.65}:goal(chapter,size.width<800));const motion=useRef({chapter,start:0,elapsed:chapter===0?0:2.4,from:current.current,via:null as Pose|null,done:false});
 const callback=useRef(onSettled);callback.current=onSettled;
 useFrame(({clock},dt)=>{
  if(!vase.current||!blocks.current)return;
  const m=motion.current;const target=goal(chapter,size.width<800);
  if(m.chapter!==chapter){const previous=m.chapter;m.from={...current.current};m.start=clock.elapsedTime;m.elapsed=0;m.done=false;m.chapter=chapter;m.via=null;
   if(previous===0&&chapter===1)m.via={...target,x:.42,h:1.65,alpha:1,blocks:.08,spread:0,photo:0,angle:current.current.angle+.22};
   if(previous===2&&chapter===3)m.via={...target,alpha:1,photo:0};
   if(previous===1&&chapter===2)m.via={...target,h:target.h*.9,alpha:0,blocks:.85,spread:.02,photo:0,angle:0};
  }
  const duration=window.matchMedia('(prefers-reduced-motion: reduce)').matches?.05:chapter===0?5.5:chapter===2?3.2:2.4;
  m.elapsed+=Math.min(dt,.05);const p=Math.min(1,m.elapsed/duration);
  let value=m.via?(p<.45?mix(m.from,m.via,smooth(p/.45)):mix(m.via,target,smooth((p-.45)/.55))):mix(m.from,target,smooth(p));
  if(p>=1&&[0,2,5].includes(chapter))value.angle=current.current.angle+Math.min(dt,.05)*.065;
  current.current=value;
  const v=viewport.getCurrentViewport(camera);vase.current.position.set((value.x-.5)*v.width,(.5-value.y)*v.height,0);vase.current.scale.setScalar(value.h*v.height/1.144);vase.current.rotation.y=value.angle;
  vase.current.visible=value.alpha>.001;original.traverse(o=>{if(o instanceof Mesh)(Array.isArray(o.material)?o.material:[o.material]).forEach(mat=>{const mm=mat as MeshStandardMaterial;mm.transparent=value.alpha<.999;mm.opacity=value.alpha;mm.depthWrite=value.alpha>.98;})});
  blocks.current.visible=value.blocks>.001;blocks.current.position.set(((chapter===2?value.x:size.width<800?.5:.34)-.5)*v.width,(.5-(size.width<800?.43:.53))*v.height,0);blocks.current.scale.setScalar(value.blocks*(size.width<800?.48:.85));
  blocks.current.children.forEach((o,i)=>{o.position.set((i-1)*.48*value.spread,(i-1)*1.18*value.spread,(i-1)*.25*value.spread);o.rotation.y=(i-1)*.13*value.spread;o.scale.lerp({x:hover.current===i?1.09:1,y:hover.current===i?1.09:1,z:hover.current===i?1.09:1} as any,1-Math.exp(-dt*10))});
  document.documentElement.style.setProperty('--photo-reveal',String(value.photo));
  const el=document.querySelector('.stage');if(el){el.setAttribute('data-progress',p.toFixed(4));el.setAttribute('data-pose',JSON.stringify({chapter,p,camera:camera.position.toArray(),position:vase.current.position.toArray(),scale:vase.current.scale.x,rotation:value.angle,alpha:value.alpha,blocks:value.blocks,photo:value.photo}));}
  if(p===1&&!m.done){m.done=true;callback.current();}
 });
 return <><Environment resolution={64} frames={1}><Lightformer position={[0,5,-5]} scale={[8,3,1]} intensity={3}/><Lightformer position={[-5,1,3]} rotation={[0,Math.PI/3,0]} scale={[2,8,1]} intensity={4}/><Lightformer position={[5,2,2]} rotation={[0,-Math.PI/3,0]} scale={[1,6,1]} intensity={3}/></Environment><group ref={vase}><Center><primitive object={original}/></Center></group><group ref={blocks} rotation={[.29,-.38,.09]}>{[0,1,2].map(i=><group key={i}><mesh renderOrder={i===2?3:0} onClick={e=>{e.stopPropagation();onSelect(selected===i?-1:i)}} onPointerOver={e=>{e.stopPropagation();hover.current=i;document.body.style.cursor='pointer'}} onPointerOut={()=>{hover.current=-1;document.body.style.cursor=''}}>
 <boxGeometry args={[2.6,i===0?.38:i===1?.16:.18,1.8]}/><meshPhysicalMaterial transparent={i===2} opacity={i===2?.65:1} depthWrite={i!==2} color={i===2?'#e4f3fa':'#ffffff'} map={i<2?textures[i]:null} bumpMap={i<2?textures[i]:null} bumpScale={i===1?.065:.018} roughness={i===2?.06:i===1?.94:.7} metalness={0} transmission={i===2?.65:0} thickness={.7} ior={1.47} envMapIntensity={i===2?1:.7} clearcoat={i===2?1:0} emissive={selected===i?'#24425d':'#000000'} emissiveIntensity={.18}/>
 <Edges threshold={20} color={selected===i?'#dfebf3':i===2?'#8eafbe':'#6b7d8b'} transparent opacity={i===2?.65:.16}/></mesh>{i===1&&<MineralGrains/>}</group>)}</group></>;
}

function MineralGrains(){const ref=useRef<InstancedMesh>(null);useEffect(()=>{const m=new Object3D();let seed=91;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};for(let i=0;i<300;i++){m.position.set((random()-.5)*2.54,.08+random()*.025,(random()-.5)*1.74);m.rotation.set(random()*3,random()*3,random()*3);m.scale.setScalar(.008+random()*.018);m.updateMatrix();ref.current!.setMatrixAt(i,m.matrix)}ref.current!.instanceMatrix.needsUpdate=true},[]);return <instancedMesh ref={ref} args={[undefined,undefined,300]}><icosahedronGeometry args={[1,0]}/><meshStandardMaterial color="#426295" roughness={.95}/></instancedMesh>}
