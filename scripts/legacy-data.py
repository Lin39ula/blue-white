import json
from pathlib import Path
from PIL import Image,ImageDraw
raw=json.loads(Path('docs/LEGACY_INPUT.json').read_text('utf-8'));data=[]
for d in raw:
 t=d['text'];data.append({'name':t[1],'focus':t[2],'image':d['images'][0],'intro':t[t.index('人物定位')+1],'sources':t[t.index('资料来源')+1:]})
Path('public/legacy.json').write_text(json.dumps(data,ensure_ascii=False),'utf-8')
sheet=Image.new('RGB',(1000,300),'#0d1923')
for i,d in enumerate(data):
 im=Image.open('public'+d['image']).convert('RGB');im.thumbnail((240,280));sheet.paste(im,(i*250,0))
sheet.save('qa/legacy-input.png')
