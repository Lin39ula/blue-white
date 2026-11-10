from pathlib import Path
p=Path('src/Gallery.tsx');s=p.read_text('utf-8-sig');s=s.replace('useEffect(()=>{if(current.current===index)return;const id=++token.current;', 'useEffect(()=>{const id=++token.current;');s=s.replace('anims.current.forEach(a=>a.cancel());\n const run=', "anims.current.forEach(a=>a.cancel());if(current.current===index){anims.current=nodes.map((n,i)=>n.animate([starts[i],{opacity:1,transform:'translateX(0) scale(1)'}],{duration:220,fill:'both'}));return()=>{++token.current;};}\n const run=")
p.write_text(s,'utf-8')
p=Path('src/main.tsx');s=p.read_text('utf-8-sig');s=s.replace('useEffect(()=>{V(false);U(true)},[ch]);','useEffect(()=>{V(false);U(true);if(ch===3)X(0)},[ch]);');p.write_text(s,'utf-8')
