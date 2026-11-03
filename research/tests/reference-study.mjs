import {pack} from './core.mjs';
const $=id=>document.getElementById(id);
const make=(w,h)=>Object.assign(document.createElement('canvas'),{width:w,height:h});
const context=c=>c.getContext('2d',{willReadFrequently:true});
// Independently authored, simplified tracing fragments; not exact contours.
const studies=[
 {id:'roots',title:'Finger-root detail',crop:[270,90,90,70],description:'Calibration fragment inside the main cap: pale foam, dark roots, and branching channels. The crop stays within the crest; it does not include its outer edge.',assessment:'Reference-derived calibration fragment, pending visual acceptance. It retains the scan’s internal contours rather than simplifying them into generic fingers. This bounded crop does not solve the full foam/sky boundary or define a procedural wave.',paths:[]},
 {id:'crest',title:'Turning crest',crop:[200,50,405,265],description:'A connected cap and its rightmost turning branches. The draft deliberately omits many smaller fingers; compare that loss against the scan.',assessment:'Unresolved: the draft smooths too much of the cap and does not retain the full branching hierarchy. It is a starting contour for editing, not a faithful completed mask.',paths:[
 {op:'add',d:'M 200 99 C 246 73 287 63 337 60 C 379 52 402 60 424 78 C 449 91 471 117 486 145 C 474 133 456 129 447 123 C 427 108 411 100 396 100 C 374 97 350 104 333 116 C 319 126 305 140 292 149 L 281 145 C 294 126 303 113 319 103 C 289 111 269 126 259 145 L 248 157 L 235 154 C 249 131 260 116 280 104 C 251 112 232 129 220 150 L 211 143 C 221 126 233 111 246 102 L 200 119 Z'},
 {op:'add',d:'M 422 117 C 440 113 458 123 473 137 C 484 140 495 144 500 153 C 504 163 504 170 496 177 C 498 164 487 158 479 159 C 471 164 469 178 474 189 C 462 183 459 175 461 165 C 462 153 452 145 445 145 C 434 148 431 159 434 170 C 422 164 421 155 426 146 C 431 138 428 127 422 117 Z'},
 {op:'add',d:'M 480 154 C 501 151 521 157 531 174 C 537 181 552 178 559 191 C 566 204 557 211 553 220 C 555 205 546 198 537 200 C 529 202 531 214 536 221 C 522 216 520 207 524 196 C 525 188 516 180 509 182 C 500 184 499 194 505 203 C 490 198 487 190 493 181 C 499 172 490 160 480 154 Z'},
 {op:'add',d:'M 533 198 C 550 192 565 207 568 220 C 571 231 587 233 590 246 C 591 254 585 260 580 266 C 582 252 575 245 568 246 C 559 249 563 263 568 269 C 554 264 550 254 556 245 C 561 235 555 228 546 229 C 535 234 541 246 544 251 C 531 245 525 236 531 225 C 537 215 539 209 533 198 Z'}]},
 {id:'lower',title:'Lower breaking foam',crop:[65,260,265,225],description:'The lower crest uses a flatter, fragmented foam edge. This fragment tests irregular roots and black openings without reusing the large cap.',assessment:'Unresolved: this is a small simplified fragment, not the complete lower wave. Its open channels should remain visible at the lowest useful density.',paths:[
 {op:'add',d:'M 78 352 C 99 333 109 309 130 299 C 143 293 157 297 166 287 C 170 281 174 276 181 279 C 187 284 179 294 177 300 C 189 300 198 287 205 289 C 214 293 209 303 205 309 C 218 311 231 300 237 302 C 247 307 239 316 235 320 C 246 326 259 318 270 324 C 281 330 284 341 281 350 C 274 342 268 339 260 343 C 251 347 255 359 258 366 C 242 359 239 350 243 341 C 229 335 216 343 211 354 C 202 371 209 385 202 394 C 193 386 190 370 196 357 C 202 344 197 335 188 334 C 172 334 160 348 156 362 L 148 384 L 136 381 C 140 362 146 344 156 335 C 141 330 130 343 122 359 C 113 376 103 385 91 386 L 78 379 C 99 372 105 354 111 343 C 98 348 91 359 78 363 Z'},
 {op:'subtract',d:'M 211 326 C 219 323 227 325 229 331 C 224 330 218 332 215 339 C 211 335 210 330 211 326 Z'}]},
 {id:'band',title:'Surface foam band',crop:[655,475,335,120],description:'A narrow supporting foam band follows a water contour. It requires its own geometry and sampling limits rather than a scaled-down large crest.',assessment:'Unresolved: the band is interpreted broadly and omits many small scallops. At low density, thin connections may vanish; increase geometric width rather than scattering compensating noise.',paths:[
 {op:'add',d:'M 665 562 C 724 553 767 534 809 518 C 851 503 909 492 975 480 L 980 486 C 912 501 863 512 823 528 C 783 544 723 565 667 568 Z'},
 {op:'add',d:'M 733 547 C 735 538 739 532 745 533 C 750 537 745 543 744 547 Z M 772 535 C 773 525 780 519 786 521 C 791 526 784 530 783 535 Z M 813 520 C 816 511 823 507 829 510 C 831 515 825 518 824 522 Z M 866 503 C 871 493 878 491 882 495 C 885 500 878 502 876 506 Z M 919 491 C 920 482 928 479 933 482 C 936 487 929 491 927 494 Z'}]}
];
// Source-anchored exterior fringe remains an authored approximation. Its
// paths come from the reviewed asset format; no brightness selection is added.
const fringeResponse=await fetch('geometry/reference-fringe-v2.json',{cache:'no-store'});
if(!fringeResponse.ok)throw Error('Missing reference-fringe-v2.json');
const fringe=await fringeResponse.json();
if(JSON.stringify(fringe.frame)!=='[1000,672]'||!Array.isArray(fringe.crop)||fringe.crop.length!==4||!fringe.crop.every(Number.isFinite)||fringe.crop[2]<=0||fringe.crop[3]<=0||!Array.isArray(fringe.paths)||!fringe.paths.length)throw Error('Invalid fringe study frame, crop or paths');
for(const p of fringe.paths){if(!['add','subtract'].includes(p.op)||typeof p.d!=='string'||!p.d.trim())throw Error('Invalid fringe path');new Path2D(p.d);}
studies.push({id:'fringe-v2',title:'Right-hand fringe v2',crop:fringe.crop,description:'Source-anchored parent and three unequal subordinate fingers on the right-hand crest arm. Compare the existing blue source overlay against the raw contour and dots.',assessment:'Unaccepted authored approximation. Landmark and foam/sky boundary correspondence require source-overlay review. Interior ink contours are distinct from exterior water; neither contour fidelity nor sampled connectivity is accepted.',paths:fringe.paths,allowBrightness:false,provenance:fringe});
const storageKey='great-wave-reference-study-v1';
let saved={};try{saved=JSON.parse(localStorage.getItem(storageKey)||'{}');}catch{}
for(const s of studies){s.initial=structuredClone(s.paths);if(Array.isArray(saved[s.id]))s.paths=saved[s.id];}
let active=studies[0];
const source=new Image();source.src='../references/great-wave-off-kanagawa-met-DP130155.jpg';
await source.decode();
const normalized=make(1000,672),ng=context(normalized);ng.drawImage(source,0,0,1000,672);
const sourcePixels=ng.getImageData(0,0,1000,672).data;
const referenceSeeds={roots:[[300,100]],crest:[[330,80]],lower:[[139,311],[174,321],[220,325]],band:[[750,549],[800,531],[850,512],[900,499]]};
function selectedReference(s){
 const [ox,oy,w,h]=s.crop,c=make(w,h),g=context(c),image=g.createImageData(w,h),seen=new Uint8Array(w*h),queue=new Int32Array(w*h);
 let head=0,tail=0;
 const eligible=(x,y)=>{const i=((y+oy)*1000+x+ox)*4;return .2126*sourcePixels[i]+.7152*sourcePixels[i+1]+.0722*sourcePixels[i+2]>184;};
 const push=(x,y)=>{if(x<0||y<0||x>=w||y>=h)return;const n=y*w+x;if(!seen[n]&&eligible(x,y)){seen[n]=1;queue[tail++]=n;}};
 for(const [x,y]of referenceSeeds[s.id])push(x-ox,y-oy);
 while(head<tail){const n=queue[head++],x=n%w,y=Math.floor(n/w);push(x-1,y);push(x+1,y);push(x,y-1);push(x,y+1);}
 for(let i=0;i<seen.length;i++)if(seen[i]){image.data[i*4]=image.data[i*4+1]=image.data[i*4+2]=255;image.data[i*4+3]=255;}
 g.putImageData(image,0,0);return c;
}
const selections=Object.fromEntries(studies.filter(s=>s.allowBrightness!==false).map(s=>[s.id,selectedReference(s)]));
// A manually bounded interior foam fragment, vectorized at four samples per
// reference unit. This is a calibration asset, not global image segmentation.
function traceInterior(s){
 const [ox,oy,w,h]=s.crop,scale=4,c=make(w*scale,h*scale),g=context(c);
 g.drawImage(source,ox/1000*source.width,oy/672*source.height,w/1000*source.width,h/672*source.height,0,0,c.width,c.height);
 const pixels=g.getImageData(0,0,c.width,c.height).data,mask=new Uint8Array(c.width*c.height);
 for(let i=0;i<mask.length;i++)mask[i]=+(.2126*pixels[i*4]+.7152*pixels[i*4+1]+.0722*pixels[i*4+2]>184);
 const on=(x,y)=>x>=0&&y>=0&&x<c.width&&y<c.height&&mask[y*c.width+x];
 // Union of horizontal runs: compound rectangles preserve all dark openings.
 const parts=[];
 for(let y=0;y<c.height;y++){let x=0;while(x<c.width){if(!on(x,y)){x++;continue;}const start=x;while(on(x,y))x++;const a=ox+start/scale,b=oy+y/scale,len=(x-start)/scale;parts.push(`M ${a} ${b} h ${len} v ${1/scale} h ${-len} Z`);}}
 return [{op:'add',d:parts.join(' ')}];
}
const rootStudy=studies.find(s=>s.id==='roots');rootStudy.paths=traceInterior(rootStudy);rootStudy.initial=structuredClone(rootStudy.paths);
if(Array.isArray(saved.roots)&&saved.roots.length)rootStudy.paths=saved.roots;
const regions=$('regions');
for(const s of studies){const b=document.createElement('button');b.textContent=s.title;b.dataset.id=s.id;b.onclick=()=>{active=s;select();};regions.append(b);}
function drawMask(c,s){
 const g=context(c);g.clearRect(0,0,c.width,c.height);
 const [x,y,w,h]=s.crop;g.save();g.scale(c.width/w,c.height/h);g.translate(-x,-y);
 for(const p of s.paths){g.globalCompositeOperation=p.op==='subtract'?'destination-out':'source-over';g.fillStyle='#fff';g.fill(new Path2D(p.d));}g.restore();
}
function render(){
 const [x,y,w,h]=active.crop;
 if(active.allowBrightness===false)$('mask-mode').value='paths';
 $('mask-mode').querySelector('option[value=source]').disabled=active.allowBrightness===false;
 const width=810,height=Math.round(width*h/w);
 for(const id of ['source','mask']){$(id).width=width;$(id).height=height;$(id).style.aspectRatio=`${w}/${h}`;}
 const raw=make(width,height);if($('mask-mode').value==='source')context(raw).drawImage(selections[active.id],0,0,width,height);else drawMask(raw,active);
 const src=context($('source'));src.drawImage(source,x/1000*source.width,y/672*source.height,w/1000*source.width,h/672*source.height,0,0,width,height);
 if($('overlay').checked){const tint=make(width,height),t=context(tint);t.drawImage(raw,0,0);t.globalCompositeOperation='source-in';t.fillStyle='rgba(15,123,221,.55)';t.fillRect(0,0,width,height);src.drawImage(tint,0,0);}
 const mg=context($('mask'));mg.fillStyle='#000';mg.fillRect(0,0,width,height);mg.drawImage(raw,0,0);
 const cols=+$('columns').value,rows=Math.max(1,Math.round(cols*h/w/2));
 const small=make(cols*2,rows*4),sm=context(small);sm.drawImage(raw,0,0,small.width,small.height);
 const data=sm.getImageData(0,0,small.width,small.height).data;
 const dots=Uint8Array.from({length:small.width*small.height},(_,i)=>+(data[i*4+3]>=128));
 const p=pack(dots,small.width,small.height),b=$('braille');b.width=cols*10;b.height=rows*20;b.style.aspectRatio=`${cols*10}/${rows*20}`;
 const native=$('native-dots').checked&&$('rendering').value==='dots';b.style.width=native?`${b.width}px`:'100%';b.style.height=native?`${b.height}px`:'auto';$('native-dots').disabled=$('rendering').value!=='dots';
 const g=context(b);g.fillStyle='#000';g.fillRect(0,0,b.width,b.height);g.fillStyle='#fff';
 if($('rendering').value==='glyph'){g.font='14px Menlo, monospace';g.textBaseline='top';for(let cy=0;cy<rows;cy++)for(let cx=0;cx<cols;cx++){const bits=p.cells[cy*cols+cx];if(bits)g.fillText(String.fromCharCode(0x2800+bits),cx*10,cy*20);}}
 else{for(let dy=0;dy<small.height;dy++)for(let dx=0;dx<small.width;dx++)if(dots[dy*small.width+dx]){g.beginPath();g.arc(dx*5+2.5,dy*5+2.5,1.55,0,2*Math.PI);g.fill();}}
 const sourceDisplay=$('source').getBoundingClientRect(),dotDisplay=b.getBoundingClientRect();
 const sampling={region:active.id,rendering:$('rendering').value,pitchScope:$('rendering').value==='dots'?'Explicit-circle spacing':'Nominal glyph grid; font metrics are not measured',normalizedCrop:active.crop,sourceRaster:[width,height],sampleGrid:[small.width,small.height],referenceUnitsPerSample:[w/small.width,h/small.height],dotRaster:[b.width,b.height],dotRasterPitch:5,displayedDotPanel:[dotDisplay.width,dotDisplay.height],displayedDotPitchCSS:[dotDisplay.width/small.width,dotDisplay.height/small.height],displayedSourcePixelsPerReferenceUnit:[sourceDisplay.width/w,sourceDisplay.height/h],nativeExplicitDots:native,scaleScope:'Study renderer: five raster pixels per dot pitch; production uses four world units. No production-scale equivalence or form acceptance is asserted.'};
 $('sampling-info').textContent=JSON.stringify(sampling,null,2);
 $('metrics').textContent=`${cols} × ${rows} cells; ${dots.reduce((a,b)=>a+b,0)} occupied samples. Raster ${b.width} × ${b.height}; displayed dot pitch ${(dotDisplay.width/small.width).toFixed(2)} × ${(dotDisplay.height/small.height).toFixed(2)} CSS px. ${native?'Native study raster (5 CSS px/pitch).':'Panel fitted to available width.'}`;
 if($('mask-mode').value==='source')$('assessment').textContent='Rejected full-crest method: brightness-connected pixels can select pale paper. The turning-crest comparison visibly fills surrounding sky. The interior calibration crop has no outer sky boundary and cannot validate this method for the full image.';else $('assessment').textContent=active.assessment;
 window.referenceStudyReport={region:active.id,cols,rows,occupiedDots:dots.reduce((a,b)=>a+b,0),paths:active.paths.length,maskMode:$('mask-mode').value,rendering:$('rendering').value,viewport:[innerWidth,innerHeight],documentWidth:document.documentElement.scrollWidth};
}
function select(){for(const b of regions.children)b.setAttribute('aria-pressed',String(b.dataset.id===active.id));$('paths').value=JSON.stringify(active.paths,null,2);$('description').textContent=active.description;$('assessment').textContent=active.assessment;$('status').textContent='';render();}
function persist(){try{localStorage.setItem(storageKey,JSON.stringify(Object.fromEntries(studies.map(s=>[s.id,s.paths]))));return true;}catch{$('status').textContent='Preview updated. Browser storage is unavailable; export to preserve your edits.';return false;}}
function download(name,text,type){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('apply').onclick=()=>{try{const paths=JSON.parse($('paths').value);if(!Array.isArray(paths)||!paths.length)throw Error('Provide at least one path.');for(const p of paths){if(!['add','subtract'].includes(p.op)||typeof p.d!=='string'||!p.d.trim())throw Error('Each path needs add/subtract and nonempty SVG path data.');new Path2D(p.d);}active.paths=paths;render();if(persist())$('status').textContent='Draft updated and saved in this browser.';}catch(e){$('status').textContent=`Draft unchanged: ${e.message}`;}};
$('reset').onclick=()=>{active.paths=structuredClone(active.initial);persist();select();};
$('export-json').onclick=()=>download(`reference-${active.id}-draft.json`,JSON.stringify({...active.provenance,status:'unapproved editable study draft',reference:'Met DP130155',frame:[1000,672],crop:active.crop,paths:active.paths},null,2),'application/json');
$('export').onclick=()=>{const [x,y,w,h]=active.crop;const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');let body='';for(const [i,p]of active.paths.entries()){const path=`<path d="${escape(p.d)}" fill="white"/>`;if(p.op==='add')body+=path;else body=`<defs><mask id="cut${i}" maskUnits="userSpaceOnUse" x="${x}" y="${y}" width="${w}" height="${h}"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="white"/><path d="${escape(p.d)}" fill="black"/></mask></defs><g mask="url(#cut${i})">${body}</g>`;}download(`reference-${active.id}-draft.svg`,`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}"><title>Unapproved simplified foam tracing draft</title>${body}</svg>`,'image/svg+xml');};
for(const id of ['columns','rendering','overlay','mask-mode','native-dots'])$(id).onchange=render;
select();

window.addEventListener('resize',render);
