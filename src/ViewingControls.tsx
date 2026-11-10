import {useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import {Vector3} from 'three';
export function ViewingControls({diy,inspect,enabled=true}:{enabled?:boolean;diy:boolean;inspect:boolean;chapter:number}){
 const {camera}=useThree();const ref=useRef<any>(null);const last=useRef(diy);const settling=useRef(true);
 useFrame((_,dt)=>{if(last.current!==diy){last.current=diy;settling.current=true;}if(!inspect&&(!diy||settling.current)){
  const destination=new Vector3(0,diy?1.5:0,diy?6:8);camera.position.lerp(destination,1-Math.exp(-dt*7));ref.current?.target.lerp(new Vector3(0,diy?-.32:0,0),1-Math.exp(-dt*7));ref.current?.update();if(camera.position.distanceTo(destination)<.001)settling.current=false;
 }});
 return <OrbitControls enabled={enabled&&(diy||inspect)} ref={ref} enableZoom={diy||inspect} enablePan={false} zoomSpeed={.45} enableDamping={false} minDistance={4} maxDistance={12} minPolarAngle={.4} maxPolarAngle={Math.PI*.75}/>;
}
