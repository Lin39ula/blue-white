from pathlib import Path
p=Path('scripts/cutouts.py');s=p.read_text('utf-8-sig').replace('band=max(3,round(w*.015))','band=max(5,round(w*(.015 if i==7 else .03)))');p.write_text(s,'utf-8')
