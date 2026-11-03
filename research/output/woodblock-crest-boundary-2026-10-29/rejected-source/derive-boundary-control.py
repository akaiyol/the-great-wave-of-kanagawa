"""One provisional source-boundary experiment; not an accepted semantic trace."""
from pathlib import Path
from PIL import Image,ImageFilter
from collections import deque
import json,hashlib
b=Path(__file__).resolve().parent;meta=json.loads((b/'crest-contours.json').read_text());source=b.parents[1]/'references/great-wave-off-kanagawa-met-DP130155.jpg';assert hashlib.sha256(source.read_bytes()).hexdigest()==meta['sourceSHA256']
im=Image.open(source).convert('RGB').resize((2000,1344),Image.Resampling.LANCZOS).crop((370,100,1220,620)).filter(ImageFilter.MedianFilter(3));q=im.quantize(colors=12,method=Image.Quantize.MEDIANCUT);w,h=q.size;labels=q.tobytes();p=q.getpalette();colors=['#'+''.join(f'{x:02x}'for x in p[c*3:c*3+3])for c in range(12)]
assert colors==[v['color']for v in meta['layers']]
barrier=Image.frombytes('L',(w,h),bytes(255 if v in (9,10,11)else 0 for v in labels)).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3)).tobytes()
seen=bytearray(w*h);queue=deque()
def seed(x,y):
 i=y*w+x
 if not barrier[i] and not seen[i]:seen[i]=1;queue.append(i)
# Deliberate exterior seed segments in reference coordinates. Left/bottom remaining
# segments close cut roots, not printed boundaries. No loose filled envelope.
for x in range(w):seed(x,0)
for y in range(h):seed(w-1,y)
for y in range(0,int((108-50)*2)):seed(0,y)
for x in range(int((455-185)*2),w):seed(x,h-1)
while queue:
 i=queue.popleft();x=i%w
 for j in (i-w if i>=w else -1,i+w if i+w<w*h else -1,i-1 if x else -1,i+1 if x+1<w else -1):
  if j>=0 and not seen[j] and not barrier[j]:seen[j]=1;queue.append(j)
# Source-colored contours retained inside provisional boundary, foam wash flattened.
colorFor={9:'#31566a',10:'#286384',11:'#193e58',8:'#94bebc'}
outLabels=bytes(255 if seen[i] and not barrier[i] else v if v in colorFor else 0 for i,v in enumerate(labels));layers=[];runs=0
for cls,color in [(0,'#f3eed9'),*colorFor.items()]:
 commands=[]
 for y in range(h):
  x=0
  while x<w:
   if outLabels[y*w+x]!=cls:x+=1;continue
   end=x+1
   while end<w and outLabels[y*w+end]==cls:end+=1
   commands.append(f'M{x/2:g} {y/2:g}h{(end-x)/2:g}v.5h{-(end-x)/2:g}Z');runs+=1;x=end
 layers.append({'color':color,'path':' '.join(commands)})
data={**{k:v for k,v in meta.items()if k!='layers'},'kind':'provisional_ink_barrier_boundary','layers':layers,'runs':runs,'method':'One fixed 3px ink-barrier closure plus flood from manually chosen exterior seed segments; explicit artificial left/bottom root closures. Color is not semantic authority.','limits':['Boundary candidate unreviewed; ink gaps may cause foam loss or exterior retention.','Dark water and internal ink are still color regions, not separate semantic objects.','Fixed group with artificial left/bottom root cuts; not procedural geometry.'],'exteriorFraction':sum(seen)/(w*h)}
(b/'crest-boundary.json').write_text(json.dumps(data,separators=(',',':'))+'\n');print(json.dumps({k:v for k,v in data.items()if k!='layers'}))
