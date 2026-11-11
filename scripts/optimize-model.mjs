import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dedup,weld,simplify,textureCompress,meshopt} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptDecoder,MeshoptSimplifier} from 'meshoptimizer';
import sharp from 'sharp';import fs from 'node:fs';import crypto from 'node:crypto';
await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready,MeshoptSimplifier.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});
const original=process.argv[2];
if(!original||!fs.existsSync(original))throw Error('请提供仓库外的原始 GLB：node scripts/optimize-model.mjs <source.glb>');
const digest=()=>crypto.createHash('sha256').update(fs.readFileSync(original)).digest('hex');const hash=digest();
const stats=doc=>({triangles:doc.getRoot().listMeshes().reduce((s,m)=>s+m.listPrimitives().reduce((n,p)=>n+(p.getIndices()?.getCount()||p.getAttribute('POSITION').getCount())/3,0),0),textures:doc.getRoot().listTextures().map(t=>({name:t.getName(),size:t.getSize(),mime:t.getMimeType()}))});
fs.mkdirSync('public/models',{recursive:true});const report={source:{path:original,sha256:hash,bytes:fs.statSync(original).size,...stats(await io.read(original))},variants:[]};
for(const opt of [{name:'standard',ratio:.10,error:.0007,size:2048,quality:88},{name:'lite',ratio:.025,error:.002,size:1024,quality:82}]){
 const doc=await io.read(original);
 await doc.transform(dedup(),weld(),simplify({simplifier:MeshoptSimplifier,ratio:opt.ratio,error:opt.error}),textureCompress({encoder:sharp,targetFormat:'webp',resize:[opt.size,opt.size],quality:opt.quality,slots:/^(?!normalTexture).*$/}),textureCompress({encoder:sharp,targetFormat:'png',resize:[opt.size,opt.size],slots:/normalTexture/}),meshopt({encoder:MeshoptEncoder,level:'medium'}));
 const file=`public/models/vase-${opt.name}.glb`;await io.write(file,doc);const data={...opt,path:file,bytes:fs.statSync(file).size,...stats(doc)};report.variants.push(data);console.log(data);
}
if(digest()!==hash)throw Error('Original changed');fs.writeFileSync('docs/competition/model-optimization.json',JSON.stringify(report,null,2));
