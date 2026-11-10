from pathlib import Path
p=Path('src/main.tsx');s=p.read_text('utf-8-sig').replace("const titles=['器物初见'","const titles=['一瓷，万象'").replace('key={t}><div className="count">','key={i}><div className="count">');p.write_text(s,'utf-8')
