import zipfile,io,json,xml.etree.ElementTree as E
from pathlib import Path
out=Path('public/images/legacy');out.mkdir(exist_ok=True);docs=[]
with zipfile.ZipFile('D:/Document/Temp/传承人.zip') as z:
 for n in z.namelist():
  if not n.endswith('.docx'):continue
  with zipfile.ZipFile(io.BytesIO(z.read(n))) as d:
   root=E.fromstring(d.read('word/document.xml'));texts=[''.join(p.itertext()) for p in []];ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'};texts=[''.join(p.itertext()) for p in root.findall('.//w:p',ns)]
   imgs=[]
   for f in d.namelist():
    if f.startswith('word/media/'):
     target=out/(str(len(docs))+'-'+Path(f).name);target.write_bytes(d.read(f));imgs.append('/images/legacy/'+target.name)
   docs.append({'text':texts,'images':imgs})
Path('docs/LEGACY_INPUT.json').write_text(json.dumps(docs,ensure_ascii=False,indent=2),'utf-8')
for i,d in enumerate(docs):print(i,json.dumps(d,ensure_ascii=True)[:14000])
