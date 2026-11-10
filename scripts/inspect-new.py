import zipfile
from pathlib import Path
for name in ['传承人','瓷器素材']:
 p=Path('D:/Document/Temp')/(name+'.zip')
 with zipfile.ZipFile(p) as z:
  print(name,[(i.filename,i.file_size) for i in z.infolist()][:60])
