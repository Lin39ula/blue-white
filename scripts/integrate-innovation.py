from pathlib import Path
import json
raw=json.loads(Path('docs/INNOVATION_INPUT.json').read_text('utf-8'))
titles=['将器形，穿在身上','让瓷纹，随衣而动','青白之间，走入数字世界','一抹青花，回到日常']
keys=['舞台造型','时装设计','数字服饰','日常器用']
texts=['以瓷器轮廓重构服装的体积，将蓝白花纹、器口与曲线组合为鲜明的舞台形象。器物的形与人的姿态，在这里产生新的关系。','蓝白纹样从瓷面延伸到衣料。重复的花纹、裙装的剪裁与行走时的节奏，让青花的装饰语言获得另一种表达。','青白配色、花卉纹样与瓷瓶意象进入数字服饰。裙装、配饰和场景共同构成可被观看与体验的青花世界。','蓝白纹饰落在杯、壶与随行器具上。青花不只供人凝望，也通过日常使用的尺度与触感，重新进入生活。']
data=[dict(name=d['name'],title=titles[i],key=keys[i],text=texts[i],images=d['images']) for i,d in enumerate(raw)]
Path('public/innovation.json').write_text(json.dumps(data,ensure_ascii=False),'utf-8')
p=Path('src/Legacy.tsx');s=p.read_text('utf-8-sig');start=s.index('const innovations=');end=s.index('export function',start);s=s[:start]+s[end:];s=s.replace('const [data,D]=useState<any[]>([])','const [innovations,J]=useState<any[]>([]),[photo,V]=useState(0),[data,D]=useState<any[]>([])');s=s.replace("useEffect(()=>{fetch('/legacy.json')", "useEffect(()=>{fetch('/innovation.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(J).catch(()=>F(true));fetch('/legacy.json')");s=s.replace('who=data[part?item!.person:person]','who=part?item:data[person]');s=s.replace("src={who.image} alt={who.name+'的青花实践'}", "key={part+'-'+innovation+'-'+photo} src={part?who.images[photo]:who.image} alt={who.name+(part?' · 图 '+(photo+1):'的青花实践')}");s=s.replace('<figcaption>{who.name}</figcaption>','<figcaption>{who.name}</figcaption>{part&&<div className="innovation-photos" aria-label="作品图片">{who.images.map((src:string,j:number)=><button key={src} aria-label={"查看图片 "+(j+1)} aria-pressed={photo===j} onClick={()=>V(j)}>{String(j+1).padStart(2,"0")}</button>)}</div>}');s=s.replace('onClick={()=>part?I(j):S(j)}>{part?v.key:v.name}', 'onClick={()=>{if(part){I(j);V(0)}else S(j)}}>{v.name}');s=s.replace('人物资料暂时无法加载','展览资料暂时无法加载').replace('正在载入人物故事','正在载入展览内容');p.write_text(s,'utf-8')
Path('docs/INNOVATION_CREDITS.md').write_text('''# 创新素材记录

来源：D:/Document/Temp/素材.zip，2026-11-10 接入。四组共 14 张图片；原压缩包未修改。展示副本缩小至最长边 1400px，JPEG 质量 92，保留画面与原有标记。

原始文案全文存于 INNOVATION_INPUT.json。页面采用基于画面可见特征的简短设计解读，不采用尚未验证的年份、品牌合作、材质断言或活动规则。图片未附完整版权授权信息；提供素材不等于公开再发布许可。原有署名与水印未移除。

分类：Lady Gaga／舞台造型；华伦天奴／时装设计；奇迹暖暖／数字服饰；霸王茶姬／日常器用。
''','utf-8')
