import {Vector2,LatheGeometry,SplineCurve} from 'three';
export function makeVessel(r:number[],h:number[]){const curve=new SplineCurve(r.map((v,i)=>new Vector2(v,h[i])));const pts=curve.getPoints(100).map(v=>new Vector2(Math.max(.12,v.x),v.y));return new LatheGeometry(pts,64)}
