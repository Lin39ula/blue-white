from urllib.request import Request,urlopen
from pathlib import Path
from PIL import Image
import json
out=Path('public/images/materials');out.mkdir(exist_ok=True)
assets=[('kaolin','https://upload.wikimedia.org/wikipedia/commons/6/61/Kaolin.jpg','https://commons.wikimedia.org/wiki/File:Kaolin.jpg','USGS / Mineral Information Institute','US federal public domain'),('cobalt','https://digital.sciencehistory.org/downloads/deriv/p6ric6n/download_medium','https://digital.sciencehistory.org/works/soynuj6','Courtesy of Science History Institute','CC BY 4.0'),('glazing','https://upload.wikimedia.org/wikipedia/commons/a/ac/Glazing_with_mineral-based%2C_hand-mixed_glazes_Taiz%C3%A9_pottery_workshop.jpg','https://commons.wikimedia.org/wiki/File:Glazing_with_mineral-based,_hand-mixed_glazes_Taiz%C3%A9_pottery_workshop.jpg','Chriewue / Charlotte Riedl-Wuerfel, tzepottery.com','CC BY 4.0')]
for name,url,source,author,license in assets:
 f=out/(name+'.jpg');f.write_bytes(urlopen(Request(url,headers={'User-Agent':'BlueWhiteExhibition/1.0 (educational local project)'}),timeout=90).read());im=Image.open(f).convert('RGB');im.thumbnail((1200,900));im.save(f,quality=90);print(name,im.size)
Path('docs/MATERIAL_CREDITS.json').write_text(json.dumps([dict(file=f'/images/materials/{n}.jpg',source=s,download=u,author=a,license=l,changes='Resized/recompressed; CSS contain; no recoloring',verified='2026-11-10') for n,u,s,a,l in assets],ensure_ascii=False,indent=2),'utf-8')
html='<html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>图像出处 · BLUE & WHITE</title><style>body{max-width:760px;margin:70px auto;padding:25px;background:#0d1923;color:#e7e3d8;font:16px/2 system-ui}a{color:#a8c7df}article{margin:35px 0;border-top:1px solid #ffffff30;padding-top:20px}</style><h1>图像出处</h1>'
for n,u,s,a,l in assets:html+=f'<article><h2>{n}</h2><p>{a}</p><a href="{s}">原始图像与说明</a> · '+(f'<a href="https://creativecommons.org/licenses/by/4.0/">{l}</a>' if 'CC' in l else l)+'<p>已缩小尺寸并压缩；未重绘。施釉照片展示法国 Taizé 工坊的一般施釉工序，并非景德镇现场或特定透明釉配方。</p></article>'
html+='<a href="/">返回展览</a></html>';Path('public/credits.html').write_text(html,'utf-8')
