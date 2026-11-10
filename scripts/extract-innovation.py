import zipfile,io,json,xml.etree.ElementTree as E
from pathlib import Path
from PIL import Image,ImageDraw
out=Path('public/images/innovation');out.mkdir(exist_ok=True);data=[]
with zipfile.ZipFile('D:/Document/Temp/素材.zip') as z:
 for i,n in enumerate(x for x in z.namelist() if x.endswith('.docx')):
  with zipfile.ZipFile(io.BytesIO(z.read(n))) as d:
   root=E.fromstring(d.read('word/document.xml'));ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'};texts=[''.join(p.itertext()) for p in root.findall('.//w:p',ns)]
  prefix=n.rsplit('/',1)[0];imgs=[]
  for f in z.namelist():
   if f.startswith(prefix+'/') and f.endswith('.jpg'):
    target=out/(str(i)+'-'+Path(f).name);im=Image.open(io.BytesIO(z.read(f))).convert('RGB');im.thumbnail((1400,1400));im.save(target,quality=92);imgs.append('/images/innovation/'+target.name)
  data.append({'name':prefix.split('/')[-1],'text':texts,'images':imgs})
Path('docs/INNOVATION_INPUT.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),'utf-8')
sheet=Image.new('RGB',(1000,650),'#0d1923');draw=ImageDraw.Draw(sheet)
for i,d in enumerate(data):
 for j,f in enumerate(d['images']):
  im=Image.open('public'+f);im.thumbnail((180,145));sheet.paste(im,(j*200,i*160));draw.text((j*200,i*160+145),str(i)+'-'+str(j),fill='white')
sheet.save('qa/innovation-contact.png')
print(json.dumps([{'name':d['name'],'text':d['text']} for d in data],ensure_ascii=False))
