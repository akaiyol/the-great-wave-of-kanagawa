"""Fixed source-color vector control. No semantic foam/water segmentation claim."""
from pathlib import Path
from PIL import Image, ImageFilter
import hashlib,json
base=Path(__file__).resolve().parent; source=base.parents[1]/'references/great-wave-off-kanagawa-met-DP130155.jpg'
pin=json.loads((source.parent/'manifest.json').read_text());digest=hashlib.sha256(source.read_bytes()).hexdigest();assert digest==pin['sha256']
frame=(1000,672);roi=(185,50,610,310);density=2
im=Image.open(source).convert('RGB').resize((frame[0]*density,frame[1]*density),Image.Resampling.LANCZOS)
im=im.crop(tuple(v*density for v in roi)).filter(ImageFilter.MedianFilter(3))
q=im.quantize(colors=12,method=Image.Quantize.MEDIANCUT);pal=q.getpalette();w,h=q.size;pixels=q.tobytes();layers=[];runs=0
for c in range(12):
 commands=[]
 for y in range(h):
  x=0
  while x<w:
   if pixels[y*w+x]!=c:x+=1;continue
   end=x+1
   while end<w and pixels[y*w+end]==c:end+=1
   a=x/density;b=y/density;rw=(end-x)/density
   commands.append(f'M{a:g} {b:g}h{rw:g}v.5h{-rw:g}Z');runs+=1;x=end
 layers.append({'color':'#'+''.join(f'{v:02x}' for v in pal[c*3:c*3+3]),'path':' '.join(commands)})
data={'kind':'fixed_source_color_vector_control','sourceSHA256':digest,'frame':frame,'roi':roi,'width':w/density,'height':h/density,'samplingPerReferenceUnit':density,'paletteSize':12,'runs':runs,'method':'Canonical RGB resampling, one 3px median filter, 12-color median-cut quantization, per-color horizontal-run vector paths. No brightness floodfill or semantic mask.','limits':['Artificial root cuts at left/bottom ROI boundaries; not a whole-wave silhouette.','Color classes preserve appearance but do not establish foam/paper or water/ink semantics.','Fixed reference-derived reconstruction; no procedural variation or production claim.'],'layers':layers}
(base/'crest-contours.json').write_text(json.dumps(data,separators=(',',':'))+'\n')
print(json.dumps({k:v for k,v in data.items() if k!='layers'}))
