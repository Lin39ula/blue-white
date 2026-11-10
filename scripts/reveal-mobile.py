from pathlib import Path
p=Path('src/NarrativeScene.tsx');s=p.read_text('utf-8-sig').replace('ch===3?.57:.64','ch===3?.57:[0,5].includes(ch)?.75:.64').replace('(mobile?.38:.64)','(mobile?([0,5].includes(ch)?.26:.38):.64)');p.write_text(s,'utf-8')
