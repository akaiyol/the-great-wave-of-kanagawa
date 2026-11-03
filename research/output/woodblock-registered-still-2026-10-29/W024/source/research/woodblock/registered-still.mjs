import atlas from './water-surface-atlas.mjs';
// W020: fixed registered crest integrated into an authored complete still.
// This is source-derived appearance plus interpreted body continuation, not procedural geometry.
const canvas=document.querySelector('canvas'),g=canvas.getContext('2d');
window.registeredStill={ready:false,iteration:'W024'};
const [domain,colors]=await Promise.all([
 fetch('./annotation/crest/annotation.json').then(r=>{if(!r.ok)throw Error('Missing crest domain');return r.json()}),
 fetch('./crest-contours.json').then(r=>{if(!r.ok)throw Error('Missing registered crest colors');return r.json()})
]);
if(domain.iteration!=='W017'||domain.reference.sha256!==colors.sourceSHA256)throw Error('Registered crest provenance mismatch');
const p={paper:'#f1dfbf',foam:'#f6eed8',ink:'#213e5f',blue:'#295e86',wash:'#bec9c3',light:'#e9eddd'};
const cache=document.createElement('canvas');cache.width=colors.width*colors.samplingPerReferenceUnit;cache.height=colors.height*colors.samplingPerReferenceUnit;
const cg=cache.getContext('2d');cg.scale(colors.samplingPerReferenceUnit,colors.samplingPerReferenceUnit);
for(const layer of colors.layers){cg.fillStyle=layer.color;cg.fill(new Path2D(layer.path))}
function polygon(points){const q=new Path2D();points.forEach(([x,y],i)=>i?q.lineTo(x,y):q.moveTo(x,y));q.closePath();return q}
// Remove explicit sky bays on the cache itself, preserving the actual sky beneath.
const crestSurface=document.createElement('canvas');crestSurface.width=850;crestSurface.height=620;
const sg=crestSurface.getContext('2d');sg.scale(2,2);sg.translate(-185,0);sg.clip(polygon(domain.foam.vertices));sg.drawImage(cache,185,50,colors.width,colors.height);
sg.globalCompositeOperation='destination-out';for(const cut of domain.skyExclusions||[])sg.fill(polygon(cut.vertices));
const paths=new Map();function path(d){if(!paths.has(d))paths.set(d,new Path2D(d));return paths.get(d)}
function shape(d,fill,stroke=null,width=1){const q=path(d);if(fill){g.fillStyle=fill;g.fill(q)}if(stroke){g.strokeStyle=stroke;g.lineWidth=width;g.stroke(q)}}
function line(d,color=p.ink,width=1){shape(d,null,color,width)}

if(atlas.sourceSHA256!==colors.sourceSHA256)throw Error('Water atlas reference mismatch');
const fieldCaches=new Map();for(const field of atlas.fields){const c=document.createElement('canvas');c.width=field.width*2;c.height=field.height*2;const v=c.getContext('2d');v.scale(2,2);for(const layer of field.layers){v.fillStyle=layer.color;v.fill(new Path2D(layer.path))}fieldCaches.set(field.id,c)}
// Field coordinates bend along anatomical flow, rather than lying on rectangular
// source patches. Every field uses the same fixed source palette as the crest.
// Adjacent mesh triangles share vertices; an opaque overlapping bank owns each join.
function triangle(img,src,dst){
 const [a,b,c]=src,[u,v,w]=dst,den=(b[0]-a[0])*(c[1]-a[1])-(c[0]-a[0])*(b[1]-a[1]);
 const m0=((v[0]-u[0])*(c[1]-a[1])-(w[0]-u[0])*(b[1]-a[1]))/den;
 const m2=((w[0]-u[0])*(b[0]-a[0])-(v[0]-u[0])*(c[0]-a[0]))/den;
 const m1=((v[1]-u[1])*(c[1]-a[1])-(w[1]-u[1])*(b[1]-a[1]))/den;
 const m3=((w[1]-u[1])*(b[0]-a[0])-(v[1]-u[1])*(c[0]-a[0]))/den;
 g.save();g.beginPath();g.moveTo(...u);g.lineTo(...v);g.lineTo(...w);g.closePath();g.clip();g.transform(m0,m1,m2,m3,u[0]-m0*a[0]-m2*a[1],u[1]-m1*a[0]-m3*a[1]);g.drawImage(img,0,0);g.restore();
}
function field(id,rows,clip){
 const img=fieldCaches.get(id);g.save();g.clip(path(clip));
 // 12 columns retain curved transverse flow; rows follow the changing shoulder.
 for(let j=0;j<rows.length-1;j++){const r=rows[j],n=rows[j+1];for(let i=0;i<12;i++){
  const at=(row,t)=>[row[1]+(row[3]-row[1])*t,row[2]+(row[4]-row[2])*t];
  const t=i/12,q=(i+1)/12,a=[img.width*t,img.height*r[0]],b=[img.width*q,img.height*r[0]],c=[img.width*q,img.height*n[0]],d=[img.width*t,img.height*n[0]];
  const A=at(r,t),B=at(r,q),C=at(n,q),D=at(n,t);triangle(img,[a,b,c],[A,B,C]);triangle(img,[a,c,d],[A,C,D]);
 }}g.restore();
}
const body='M-40 255 C55 268 156 247 225 203 L250 205 L275 210 L300 220 L325 230 L350 250 L375 275 L399 291 C387 329 387 370 407 404 C423 431 450 451 482 467 C581 519 742 531 848 482 C915 451 951 345 1040 253 L1040 800 L-40 800 Z';
const upstream='M-40 228 C28 251 69 247 111 208 C143 176 163 151 185 136 L185 200 L225 203 C222 216 219 229 212 241 C194 268 164 284 132 292 C75 308 20 312 -40 324 Z';
// Each overlap is a complete backing surface; only the exterior silhouette is
// authored. Color regions and internal ink are fixed source-derived appearance.
const leftBank='M-40 336 C0 325 12 301 38 300 C69 302 84 280 110 278 C136 276 144 298 166 295 C190 289 201 309 215 326 C240 355 267 358 292 388 C316 418 340 429 374 439 C318 473 252 504 183 516 C95 531 16 535 -40 541 Z';
const rightBank='M609 514 C725 506 807 481 855 444 C897 414 924 373 955 337 C980 307 1008 284 1040 262 L1040 800 L609 800 Z';
const forwardBank='M-40 506 C73 502 135 488 196 456 C245 431 281 392 312 379 C334 368 344 386 356 404 C391 450 438 477 496 494 C669 543 861 498 1040 404 L1040 800 L-40 800 Z';
function render(){
 const w=innerWidth,h=innerHeight,dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
 const scale=Math.max(w/1000,h/672),offsetX=(w-1000*scale)/2;g.setTransform(dpr*scale,0,0,dpr*scale,dpr*offsetX,0);g.lineCap='round';g.lineJoin='round';
 const sky=g.createLinearGradient(0,0,0,672);sky.addColorStop(0,'#eed9ad');sky.addColorStop(.35,'#f6eed8');sky.addColorStop(.70,'#f6eed8');sky.addColorStop(.90,'#d9d7c5');sky.addColorStop(1,'#b3b5a4');g.fillStyle=sky;g.fillRect(-100,0,1200,800);
 shape('M555 101 C570 77 588 88 605 85 C624 84 629 66 644 65 C663 61 672 77 690 75 C709 69 724 45 742 54 C754 59 754 76 772 82 C791 88 806 91 807 105 C807 118 783 120 769 122 C740 127 723 142 694 142 C667 141 651 128 629 131 C598 136 581 127 564 127 C549 125 546 113 555 101 Z','#f9f0db');
 shape('M65 126 C82 116 96 121 110 115 C125 108 131 98 147 100 C165 103 172 116 189 117 C204 119 216 123 216 131 C213 142 191 143 177 142 C152 141 143 150 126 149 C107 149 97 141 80 144 C64 146 56 136 65 126 Z',p.foam);
 shape('M-40 514 C190 499 371 507 542 501 C728 495 849 461 938 389 C975 359 1003 330 1040 302 L1040 800 L-40 800 Z','#8d9994');
 shape(body,p.ink);
 field('mainWall',[[0,170,200,412,245],[.22,146,268,401,305],[.5,90,347,410,385],[.75,-40,425,496,474],[1,-70,530,768,580]],body);
 // Right flank is a broad folded surface, curved upwards instead of an inserted
 // vertical crop. Its joins disappear behind the foreground water backing.
 field('rightFlank',[[0,676,515,1045,252],[.2,673,535,1045,341],[.5,650,579,1045,453],[.8,607,654,1045,591],[1,570,763,1045,795]],rightBank);
 // One continuous lower-left source field follows the smaller backing breaker.
 field('lowerLeftBreaker',[[0,-45,330,378,403],[.2,-45,366,381,437],[.5,-45,426,388,482],[.8,-45,491,396,535],[1,-45,548,405,589]],leftBank);
 shape(upstream,p.foam);line('M-40 228 C28 251 69 247 111 208 C143 176 163 151 185 136',p.ink,1.1);
 // The central foreground uses one source-foam field at a different anatomical
 // scale. A bend at the peak compresses depth without copying a uniform row.
 field('lowerLeftBreaker',[[0,-50,501,1040,391],[.17,-50,525,1040,442],[.4,-50,563,1040,521],[.68,-50,620,1040,625],[1,-50,727,1040,792]],forwardBank);
 // The long surface passes across the bottom, masking lower artificial atlas cuts.
 const lower='M350 541 C495 601 667 631 813 571 C886 544 969 504 1040 466 L1040 800 L350 800 Z';
 field('longForeground',[[0,348,539,1045,465],[.25,350,574,1045,517],[.6,350,643,1045,620],[1,350,795,1045,800]],lower);
 // Crest cache is still the unchanged source-derived vector control. Its root
 // overlap hides the artificial top row of the main-wall appearance field.
 g.drawImage(crestSurface,185,0,425,310);
 window.registeredStill={ready:true,iteration:'W024',scope:'Complete fixed-source vector appearance still with four water atlas fields mapped across overlapping curved water surfaces and pale clouds. No boats/Fuji, procedural geometry or production claim.',provenance:{reference:domain.reference,crestColors:'research/woodblock/crest-contours.json',crestDomain:'research/woodblock/annotation/crest/annotation.json',domainIteration:domain.iteration,colorKind:colors.kind,waterAtlas:'research/woodblock/water-surface-atlas.mjs',waterAtlasSHA256:atlas.sourceSHA256,waterAtlasKind:atlas.kind,originalScanDrawn:false,sourceImagesDrawn:false,mapping:'Piecewise-affine curved surface meshes, clipped to overlapping authored water silhouettes; vector-path caches only.'},uncertainty:[...domain.uncertainty,...atlas.limits,'Principal-water mask remains unused and unverified.','Lower-left field reused at two anatomical scales; source-feature duplication, stretching and joins require visual review.','Authored outer water boundaries are not semantic source masks.'],viewport:{width:w,height:h,dpr,scale,offsetX,offsetY:0,visibleSource:[-offsetX/scale,0,w/scale,h/scale],fit:'uniform cover, top aligned'},stats:{registeredLayers:colors.layers.length,registeredDomainVertices:domain.foam.vertices.length,explicitSkyCuts:domain.skyExclusions.length,clouds:2,atlasFields:atlas.fields.length,atlasRuns:atlas.fields.reduce((n,f)=>n+f.runs,0),mappedWaterSurfaces:5,sourcePaletteSize:atlas.palette.length},render};
}
addEventListener('resize',render);render();
