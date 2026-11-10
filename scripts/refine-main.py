from pathlib import Path
p=Path('src/main.tsx');s=p.read_text('utf-8-sig');s="import {Gallery} from './Gallery';\nimport {MaterialPanel} from './MaterialPanel';\n"+s
s=s.replace("useEffect(()=>{V(false);U(true);let t=setTimeout(()=>U(false),2800);return()=>clearTimeout(t)},[ch]);","useEffect(()=>{V(false);U(true)},[ch]);")
s=s.replace("+' '+((ch===3&&!transition)||ch===4?'hidden':'')","")
s=s.replace('camera={{position:[0,2,8],fov:38}}','camera={{position:[0,0,8],fov:38}}')
s=s.replace('<NarrativeScene chapter={ch} selected={mat} onSelect={M}/>','<NarrativeScene chapter={ch} selected={mat} onSelect={M} onSettled={()=>U(false)}/>')
s=s.replace('{ch===3&&transition&&<img className="match-photo" src="/images/artifacts/4.png" alt="莲纹玉壶春瓶照片匹配转场"/>}','')
s=s.replace("className={ch===i&&transition?'chapter-entering':''}","className={ch===i?'chapter-active':''}")
start=s.index('{i===1&&<div className="material">');end=s.index('{i===5&&',start);s=s[:start]+'{i===1&&<MaterialPanel selected={mat} onSelect={M}/>}'+s[end:]
start=s.index('{i===3&&art.length>0&&');end=s.index('{i===4&&',start);s=s[:start]+'{i===3&&art.length>0&&<Gallery art={art} index={idx} onChange={X}/>}'+s[end:]
s=s.replace('原始模型 · 自由观察','凝望青花 · 转动器物').replace('<p>独立程序化练习模型 · 不修改原始文物</p>','<p>循着手的节奏，让泥土成为器物。</p>')
s=s.replace('onSettled={()=>U(false)}','onSettled={()=>U(false)}')
s=s.replace('function enter(){','function enter(){V(false);')
p.write_text(s,'utf-8')
p=Path('src/Legacy.tsx');s=p.read_text('utf-8-sig');s=s.replace('<p>核验：2026-11-10。人物照片与影像授权未明确，本站提供官方出处，不擅自转载。</p>','');p.write_text(s,'utf-8')
