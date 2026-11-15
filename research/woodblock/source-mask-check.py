#!/usr/bin/env python3
"""P137 fixed source-only mask measurement; no production geometry or approval."""
import hashlib, json
from collections import deque
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'research/output/agent-phase-2026-11-15/P137'
REF = ROOT / 'references/great-wave-off-kanagawa-met-DP130155.jpg'
PIN = 'cbb9988f2f18b9180a1cc0cf5dbb0e3bbf8f2e85d17930cf6ca9ab36fac36303'
CROP = (1000, 460, 1700, 920)
PROBES = [('W',1250,700,True), ('F',1280,570,False), ('I',1280,490,False)]

def bottom_component(mask):
    h,w = mask.shape
    seen = np.zeros_like(mask)
    best = []
    counts = []
    for x in range(w):
        if not mask[h-1,x] or seen[h-1,x]:
            continue
        q = deque([(h-1,x)])
        seen[h-1,x] = True
        points = []
        while q:
            y,x = q.popleft()
            points.append((y,x))
            for ny in range(max(0,y-1), min(h,y+2)):
                for nx in range(max(0,x-1), min(w,x+2)):
                    if mask[ny,nx] and not seen[ny,nx]:
                        seen[ny,nx] = True
                        q.append((ny,nx))
        counts.append(len(points))
        if len(points)>len(best):
            best = points
    selected = np.zeros_like(mask)
    for y,x in best:
        selected[y,x] = True
    return selected,counts

def main():
    digest = hashlib.sha256(REF.read_bytes()).hexdigest()
    assert digest == PIN, 'Canonical reference hash mismatch'
    OUT.mkdir(parents=True,exist_ok=True)
    crop = Image.open(REF).convert('RGB').crop(CROP)
    crop.save(OUT/'source-crop.png')
    rgb = np.asarray(crop)
    raw = (rgb[:,:,0]<125)&(rgb[:,:,1]<145)&(rgb[:,:,2]>rgb[:,:,0])
    summary = {'phase':'P137','policy':'v2','scope':'source analysis only; not production assets or geometry approval', 'referenceSha256':digest,'crop':list(CROP),'fixedMask':'R<125 and G<145 and B>R','opening':'PIL MinFilter(k) then MaxFilter(k); PIL native edge handling','selection':'largest 8-connected component touching crop bottom; ties retain first bottom seed left-to-right','conditions':{},'artAssessed':False,'status':'unresolved','missingEvidence':['Independent source/overlay review of anatomy, W/F attachment and boundary order','Ordered material interface and production construction remain unapproved']}
    selections = {}
    for k in (3,5):
        opened = np.asarray(Image.fromarray(raw.astype('uint8')*255).filter(ImageFilter.MinFilter(k)).filter(ImageFilter.MaxFilter(k)))>0
        selected,counts = bottom_component(opened)
        selections[k] = selected
        Image.fromarray(selected.astype('uint8')*255).save(OUT/f'k{k}-mask.png')
        padded = np.pad(selected,1)
        interior = selected & padded[:-2,1:-1] & padded[2:,1:-1] & padded[1:-1,:-2] & padded[1:-1,2:]
        boundary = selected & ~interior
        yy,xx = np.nonzero(boundary)
        coordinates = {'meaning':'NOT ordered trace; row-sorted selected pixels with at least one nonselected 4-neighbor; outside crop treated nonselected','sourceXY':np.column_stack((xx+CROP[0],yy+CROP[1])).tolist()}
        (OUT/f'k{k}-boundary-pixels.json').write_text(json.dumps(coordinates,separators=(',',':'))+'\n')
        # Preserve every oriented unit pixel edge, including crop-cut edges. No loop ordering claimed.
        edges = []
        for y,x in zip(*np.nonzero(selected)):
            x,y = int(x)+CROP[0],int(y)+CROP[1]
            for dx,dy,a,b in [(0,-1,(x,y),(x+1,y)),(1,0,(x+1,y),(x+1,y+1)),(0,1,(x+1,y+1),(x,y+1)),(-1,0,(x,y+1),(x,y))]:
                nx,ny=x-CROP[0]+dx,y-CROP[1]+dy
                if not (0<=ny<selected.shape[0] and 0<=nx<selected.shape[1] and selected[ny,nx]):
                    edges.append([a,b])
        degrees = {}
        for a,b in edges:
            degrees.setdefault(a,[0,0])[1]+=1
            degrees.setdefault(b,[0,0])[0]+=1
        ambiguous = [{'sourceXY':v,'inDegree':d[0],'outDegree':d[1]} for v,d in sorted(degrees.items()) if d!=[1,1]]
        (OUT/f'k{k}-edges.json').write_text(json.dumps({'meaning':'Unordered oriented unit pixel edges; selected cell on right in image coordinates; NOT ordered interface or loops','edges':edges,'nonuniqueVertices':ambiguous},separators=(',',':'))+'\n')
        overlay = np.array(crop)
        overlay[boundary] = (255,0,180)
        overlay = Image.fromarray(overlay)
        draw = ImageDraw.Draw(overlay)
        for x in range(1000,1700,100):
            draw.line((x-1000,0,x-1000,459),fill=(150,150,150),width=1)
            draw.text((x-1000+2,2),str(x),fill=(0,0,0))
        for y in range(500,920,100):
            draw.line((0,y-460,699,y-460),fill=(150,150,150),width=1)
            draw.text((2,y-460+2),str(y),fill=(0,0,0))
        probes=[]
        for role,x,y,expected in PROBES:
            value=bool(selected[y-460,x-1000])
            probes.append({'role':role,'sourceXY':[x,y],'expectedIncluded':expected,'included':value,'pass':value==expected})
            draw.ellipse((x-1003,y-463,x-997,y-457),outline=(220,0,0))
            draw.text((x-995,y-460),role,fill=(220,0,0))
        overlay.save(OUT/f'k{k}-boundary-overlay.png')
        summary['conditions'][str(k)]={'openedPixels':int(opened.sum()),'selectedPixels':int(selected.sum()),'bottomComponentSizes':counts,'boundaryPixels':len(xx),'unitEdges':len(edges),'nonuniqueVertexCount':len(ambiguous),'orderedLoopsDerived':False,'probes':probes,'allProbesPass':all(p['pass'] for p in probes),'rawSymmetricDifference':int((raw^selected).sum()),'openedSymmetricDifference':int((opened^selected).sum())}
    summary['betweenConditionsSymmetricDifference']=int((selections[3]^selections[5]).sum())
    (OUT/'summary.json').write_text(json.dumps(summary,indent=2)+'\n')
    print(json.dumps(summary))

if __name__=='__main__':
    main()
