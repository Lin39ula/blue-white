from pathlib import Path
from PIL import Image,ImageDraw
import cv2,numpy as np,json
out=Path('public/images/cutouts');out.mkdir(exist_ok=True)
# Hand-guided silhouettes in normalized image coordinates. GrabCut refines only a narrow edge band.
polys={
0:[(.38,.08),(.46,.07),(.54,.07),(.61,.085),(.57,.12),(.545,.19),(.54,.28),(.56,.37),(.61,.44),(.66,.54),(.70,.65),(.70,.73),(.67,.80),(.61,.86),(.60,.91),(.43,.92),(.40,.88),(.38,.85),(.32,.80),(.29,.73),(.29,.65),(.32,.55),(.38,.44),(.43,.36),(.46,.28),(.46,.20),(.43,.13)],
1:[(.45,.045),(.56,.045),(.555,.10),(.64,.14),(.72,.23),(.75,.32),(.74,.42),(.70,.52),(.65,.66),(.63,.80),(.62,.91),(.58,.94),(.43,.94),(.38,.91),(.37,.80),(.35,.66),(.30,.52),(.26,.41),(.25,.30),(.29,.22),(.37,.14),(.45,.10)],
2:[(.46,.23),(.53,.23),(.55,.26),(.57,.29),(.60,.30),(.59,.32),(.65,.34),(.70,.37),(.70,.39),(.63,.40),(.72,.44),(.79,.51),(.82,.61),(.80,.70),(.75,.79),(.70,.85),(.67,.90),(.35,.90),(.32,.86),(.27,.79),(.22,.70),(.18,.60),(.21,.51),(.28,.44),(.38,.40),(.31,.39),(.31,.37),(.38,.34),(.41,.32),(.43,.29),(.46,.27)],
3:[(.12,.47),(.22,.45),(.41,.45),(.65,.45),(.86,.47),(.88,.50),(.84,.56),(.80,.67),(.75,.78),(.66,.85),(.35,.85),(.25,.79),(.20,.69),(.16,.58)],
4:[(.36,.085),(.64,.085),(.60,.12),(.57,.18),(.56,.25),(.56,.30),(.60,.36),(.67,.43),(.75,.51),(.81,.61),(.83,.69),(.80,.78),(.73,.85),(.67,.89),(.66,.94),(.34,.94),(.33,.89),(.27,.85),(.20,.78),(.17,.69),(.19,.61),(.25,.51),(.33,.43),(.40,.36),(.44,.30),(.44,.25),(.43,.18),(.40,.12)],
5:[(.44,.14),(.55,.14),(.56,.21),(.63,.22),(.67,.25),(.69,.31),(.67,.35),(.77,.40),(.85,.49),(.89,.61),(.89,.72),(.84,.82),(.75,.91),(.64,.96),(.36,.96),(.24,.91),(.15,.82),(.10,.72),(.10,.61),(.14,.49),(.23,.40),(.32,.35),(.30,.31),(.32,.25),(.38,.22),(.43,.22)],
6:[(.30,.18),(.70,.18),(.70,.22),(.65,.25),(.65,.29),(.70,.32),(.74,.38),(.75,.47),(.73,.58),(.69,.71),(.65,.86),(.62,.92),(.38,.92),(.35,.86),(.31,.71),(.27,.58),(.25,.47),(.26,.38),(.30,.32),(.35,.29),(.35,.25),(.30,.22)],
7:[(.410,.183),(.48,.177),(.56,.178),(.638,.186),(.624,.205),(.598,.232),(.581,.270),(.577,.310),(.585,.354),(.604,.392),(.630,.425),(.663,.465),(.698,.512),(.728,.563),(.741,.610),(.736,.654),(.720,.701),(.695,.748),(.667,.794),(.646,.842),(.643,.883),(.654,.907),(.665,.928),(.652,.942),(.603,.950),(.531,.955),(.459,.950),(.410,.940),(.384,.925),(.392,.907),(.404,.879),(.401,.842),(.386,.802),(.362,.752),(.337,.708),(.318,.660),(.307,.612),(.308,.565),(.322,.521),(.345,.478),(.377,.438),(.411,.395),(.438,.354),(.455,.312),(.465,.267),(.456,.229),(.434,.203)]}
report=[]
for p in Path('public/images/artifacts').iterdir():
 i=int(p.stem);im=Image.open(p).convert('RGB');im.thumbnail((1400,1400));rgb=np.array(im);h,w=rgb.shape[:2];poly=np.array([(round(x*w),round(y*h)) for x,y in polys[i]],np.int32)
 shape=np.zeros((h,w),np.uint8);cv2.fillPoly(shape,[poly],255)
 band=max(5,round(w*(.015 if i==7 else .03)));kernel=cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(band*2+1,band*2+1));inside=cv2.erode(shape,kernel);outside=cv2.dilate(shape,kernel)
 mask=np.where(outside==0,cv2.GC_BGD,np.where(inside>0,cv2.GC_FGD,np.where(shape>0,cv2.GC_PR_FGD,cv2.GC_PR_BGD))).astype('uint8')
 if i==5:
  # Independently label the two handle apertures. The broad body foreground seed must not fill them.
  holes=[[(.366,.303),(.375,.290),(.398,.279),(.430,.274),(.433,.287),(.428,.309),(.414,.329),(.393,.341),(.372,.346),(.365,.330)],[(.552,.276),(.576,.277),(.599,.285),(.617,.300),(.625,.316),(.622,.341),(.608,.344),(.585,.333),(.569,.316),(.559,.295)]]
  for hole in holes:
   aperture=np.zeros((h,w),np.uint8);cv2.fillPoly(aperture,[np.array([(round(x*w),round(y*h)) for x,y in hole],np.int32)],255)
   border=cv2.dilate(aperture,np.ones((7,7),np.uint8));mask[border>0]=cv2.GC_PR_BGD;mask[aperture>0]=cv2.GC_BGD
 cv2.grabCut(cv2.cvtColor(rgb,cv2.COLOR_RGB2BGR),mask,None,np.zeros((1,65)),np.zeros((1,65)),5,cv2.GC_INIT_WITH_MASK)
 alpha=np.where((mask==1)|(mask==3),255,0).astype('uint8')
 if i==1:
  # Uniform studio backdrop: color distance retains the dark cobalt edge that GrabCut removed.
  bg=rgb[5,5].astype(float);alpha=np.where(np.max(np.abs(rgb.astype(float)-bg),axis=2)>22,255,0).astype('uint8')
 # Retain largest object, suppress detached dust/text.
 count,labels,stats,_=cv2.connectedComponentsWithStats(alpha);label=1+np.argmax(stats[1:,cv2.CC_STAT_AREA]);alpha=np.where(labels==label,255,0).astype('uint8')
 alpha=cv2.GaussianBlur(alpha,(3,3),.55)
 rgba=np.dstack([rgb,alpha]);result=Image.fromarray(rgba);box=result.getbbox();result=result.crop(box);result.save(out/f'{i}.png')
 report.append({'id':i,'original':str(p),'output':str(out/f'{i}.png'),'crop':box,'method':'manual silhouette constraints + GrabCut, original RGB pixels, 0.55px alpha antialias'})
Path('qa/cutouts').mkdir(exist_ok=True);Path('qa/cutouts/masks.json').write_text(json.dumps(report,indent=2))
sheet=Image.new('RGB',(1200,640),'#0d1923');d=ImageDraw.Draw(sheet)
for i in range(8):
 im=Image.open(out/f'{i}.png');im.thumbnail((260,280));x=(i%4)*300+(300-im.width)//2;y=(i//4)*320+15;sheet.paste(im,(x,y),im);d.text(((i%4)*300+12,(i//4)*320+300),str(i),fill='white')
sheet.save('qa/cutouts/contact.png')
