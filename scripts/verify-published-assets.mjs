import fs from 'node:fs';
import path from 'node:path';
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const media=walk('dist').filter(f=>/\.(glb|mp4)$/i.test(f));
for(const file of ['dist/模型.glb','dist/models/vase-lite.glb','dist/models/vase-standard.glb']){
 if(!fs.existsSync(file)||fs.statSync(file).size<1024)throw Error('Missing model data: '+file);
}
if(media.filter(f=>f.endsWith('.mp4')).length!==6)throw Error('Expected six web videos');
for(const file of media){
 if(fs.statSync(file).size<1024&&fs.readFileSync(file,'utf8').startsWith('version https://git-lfs.github.com/spec/v1'))throw Error('Unresolved LFS pointer: '+file);
}
console.log('Published models and six videos contain real media data.');
