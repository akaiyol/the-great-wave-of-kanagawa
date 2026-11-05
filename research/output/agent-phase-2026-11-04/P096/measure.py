# Read-only source analysis. Masks are temporary measurements, never artwork.
from PIL import Image
import numpy as np,json,pathlib
im=np.asarray(Image.open('references/great-wave-off-kanagawa-met-DP130155.jpg').convert('RGB'),dtype=float)[950:1210,2020:2270]
results=[]
for size in [3,5]:
 pad=size//2;a=np.pad(im,((pad,pad),(pad,pad),(0,0)),mode='edge');blur=sum(a[j:j+260,i:i+250]for j in range(size)for i in range(size))/(size*size)
 for rg,rb in [(4,18),(6,22),(8,26)]:
  sky=(blur[:,:,0]-blur[:,:,1]>rg)&(blur[:,:,0]-blur[:,:,2]>rb)&(blur[:,:,0]>140)
  # Close 3px grain holes, leaving large foam and contour boundaries separate.
  a=np.pad(sky,1);d=np.logical_or.reduce([a[j:j+260,i:i+250]for j in range(3)for i in range(3)])
  a=np.pad(d,1,constant_values=True);sky=np.logical_and.reduce([a[j:j+260,i:i+250]for j in range(3)for i in range(3)])
  # Upper A/J cove opens right; scan its last contiguous sky interval.
  upper=[]
  for y in range(1040-950,1098-950):
   if not sky[y,-1]:continue
   x=249
   while x>0 and sky[y,x-1]:x-=1
   upper.append((x+2020,y+950))
  # Lower B/C notch opens downward, between observed source tips.
  lower=[]
  for x in range(2090-2020,2155-2020):
   if not sky[-1,x]:continue
   y=259
   while y>0 and sky[y-1,x]:y-=1
   lower.append((x+2020,y+950))
  up=min(upper,key=lambda p:p[0])if upper else None;lo=min(lower,key=lambda p:p[1])if lower else None
  results.append({'blur':size,'rg':rg,'rb':rb,'upperRightOpenExtremum':up,'lowerBottomOpenExtremum':lo,'witnessSky':bool(sky[1077-950,2199-2020]),'foamPClassifiedSky':bool(sky[981-950,2086-2020]),'foamJClassifiedSky':bool(sky[1082-950,2120-2020])})
print(json.dumps(results,indent=2))
pathlib.Path('research/woodblock/cove-measurements.json').write_text(json.dumps({'phase':'P096','status':'unverified source-chroma estimates','crop':[2020,950,250,260],'landmarkPointScope':'representative, not segmented pixel truth','method':'blur3/5; RGB warm-sky thresholds; 3px grain closing; right-open upper ray and bottom-open lower ray extrema','results':results,'limitation':'Directional connected intervals, not global floodfill. Extrema do not establish a curvature law; inspect overlay for misidentified regions.'},indent=2)+'\n')
