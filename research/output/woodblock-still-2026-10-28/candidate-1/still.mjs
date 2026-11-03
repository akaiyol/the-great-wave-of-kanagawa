import {palette as p,skyClouds,horizon,distantWater,mainBody,mainFoam,coves,flowBands,foamGroups,frontBody,frontFoam,frontBands,sideFoam,sideFoamMarks} from './geometry.mjs';
const canvas=document.querySelector('canvas'),g=canvas.getContext('2d');
const allPaths=[...skyClouds,horizon,distantWater,mainBody,mainFoam,...coves,...flowBands,...foamGroups,frontBody,frontFoam,...frontBands,sideFoam,...sideFoamMarks];
const paths=new Map(allPaths.map(d=>[d,new Path2D(d)]));
function draw(d,fill,stroke=p.indigo,width=1.15){const a=paths.get(d)||new Path2D(d);if(fill){g.fillStyle=fill;g.fill(a);}if(stroke){g.strokeStyle=stroke;g.lineWidth=width;g.stroke(a);}}
function line(d,color=p.blue,w=1.0){draw(d,null,color,w);}
function random(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const r=random(1847);
// Sparse, irregular source-inspired spray. These are droplets, not a dot rendering grid.
const spray=Array.from({length:220},()=>{const t=r(),x=470+Math.pow(t,.72)*282,y=239+r()*240;return{x,y,rx:.45+r()*1.2,ry:.6+r()*1.9,a:.35+r()*.5};});
const bodySpecks=Array.from({length:130},()=>({x:240+r()*225,y:190+r()*274,rx:.4+r()*1.2,ry:.6+r()*1.3}));
function render(){
const w=innerWidth,h=innerHeight,dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);g.setTransform(dpr,0,0,dpr,0,0);g.fillStyle=p.paper;g.fillRect(0,0,w,h);
const scale=Math.min(w/1200,h/675),offsetX=(w-1200*scale)/2,offsetY=(h-675*scale)/2;g.translate(offsetX,offsetY);g.scale(scale,scale);g.lineJoin='round';g.lineCap='round';
// Restrained warm sky and low horizon wash; no paper noise is added in this geometry study.
const sky=g.createLinearGradient(0,0,0,675);sky.addColorStop(0,p.paper);sky.addColorStop(.5,'#eee3c5');sky.addColorStop(.75,'#d5ceb5');sky.addColorStop(1,p.horizon);g.fillStyle=sky;g.fillRect(0,0,1200,675);
for(const d of skyClouds)draw(d,'#f3ecd2',null);
draw(horizon,'#92998b',null);draw(distantWater,p.cyan,null);
for(let i=0;i<8;i++){const y=488+i*7;line(`M620 ${y} C804 ${y+14} 1053 ${y-22} 1200 ${y-36}`,i%2?p.blue:'#cbcfb6',i%2?.8:1.4);}
draw(sideFoam,p.foam,p.indigo,1.2);for(const d of sideFoamMarks)line(d,p.blue,1.3);
draw(mainBody,p.indigo,p.indigo,1.5);g.save();g.clip(paths.get(mainBody));for(const d of flowBands)draw(d,p.blue,null);
for(let i=0;i<12;i++){const dx=i*4.3;line(`M${11+dx} 468 C${158+dx} 405 ${142+dx} 298 ${244+dx} 194`,i%3?p.cyan:'#143750',.65);}
for(let i=0;i<6;i++){line(`M${302+i*3} 484 C${344+i*4} 432 ${297+i*3} 319 ${351+i*3} 197`,p.cyan,.6);}
g.fillStyle=p.foam;for(const a of bodySpecks){if(g.isPointInPath(paths.get(mainBody),a.x,a.y)){g.beginPath();g.ellipse(a.x,a.y,a.rx,a.ry,-.25,0,Math.PI*2);g.fill();}}g.restore();
draw(mainFoam,p.foam,p.indigo,1.25);
for(const d of coves)draw(d,p.indigo,null);
// Blue ribbons within the unequal coves describe the printed water's direction.
line('M236 209 C233 222 242 239 257 242 M285 184 C288 208 290 235 305 246 M333 164 C338 181 334 216 347 234 M378 151 C381 176 363 191 365 213 M420 169 C415 190 397 217 399 230 M455 190 C452 212 434 230 437 239',p.blue,3.1);
for(const d of foamGroups)draw(d,p.foam,p.indigo,1.1);
// Smaller irregular foam interiors, each aligned to its adjacent cove direction.
for(const d of [
'M305 141 C308 136 316 136 318 141 C318 145 314 146 311 144 C313 140 309 139 307 143 C304 148 309 151 307 155 C303 160 299 158 297 155',
'M331 120 C336 115 343 116 344 121 C346 125 341 129 338 126 C340 121 335 120 332 123 C328 126 332 132 328 134 C324 135 320 133 319 129',
'M354 109 C359 103 367 105 368 110 C370 115 363 118 361 114 C363 111 360 108 356 111 C353 115 357 121 353 123',
'M392 125 C398 120 405 125 404 131 C403 135 399 134 397 132 C400 128 396 126 393 129 C390 133 395 139 390 142 C386 144 382 139 381 136',
'M463 160 C461 153 466 149 471 152 C475 156 475 162 471 164 C471 159 468 156 465 160 C462 166 468 169 464 174',
'M513 188 C511 181 517 177 522 180 C527 183 528 190 524 192 C525 186 520 184 517 188 C513 193 519 198 515 203',
'M550 220 C548 214 553 210 558 213 C563 216 562 223 558 225 C559 220 555 217 552 221 C549 225 554 231 550 235',
'M580 235 C579 229 585 225 589 229 C595 233 592 239 588 240 C590 235 586 233 583 237 C581 242 587 247 583 251'
])line(d,p.indigo,1.0);
g.fillStyle=p.foam;for(const a of spray){g.globalAlpha=a.a;g.beginPath();g.ellipse(a.x,a.y,a.rx,a.ry,-.25,0,Math.PI*2);g.fill();}g.globalAlpha=1;
draw(frontBody,p.indigo,p.indigo,1.4);for(const d of frontBands)draw(d,p.blue,null);draw(frontFoam,p.foam,p.indigo,1.15);
// Pale contour ribbons retain the long flowing curves of the front water.
for(const d of [
'M-20 635 C149 616 245 568 318 507 C304 538 277 567 233 590 C156 631 69 649 -20 660 Z',
'M429 513 C500 573 612 607 737 608 C898 610 1061 561 1200 527 L1200 534 C1057 577 895 626 740 621 C599 619 502 585 447 545 Z',
'M528 588 C637 645 745 670 867 657 C1003 646 1092 601 1200 581 L1200 591 C1091 618 1003 663 872 672 C728 686 624 653 544 613 Z',
'M897 675 C1033 655 1102 626 1200 616 L1200 629 C1096 647 1036 670 1007 675 Z'
])draw(d,p.foam,null);
for(let i=0;i<7;i++)line(`M${445+i*5} ${524+i*2} C${583+i*3} ${612+i*3} ${787+i*3} ${643+i*2} 1200 ${540+i*4}`,i%2?p.cyan:p.indigo,.65);
// Foreground breaking group, directly connected to the ridge rather than floating.
g.save();g.translate(65,442);g.scale(.78,.72);for(const [i,d]of foamGroups.slice(2,9).entries()){g.save();g.translate(-435+i*12,-116+i*7);g.rotate(-.15);draw(d,p.foam,p.indigo,1.35);g.restore();}g.restore();
window.woodblockStudy={ready:true,revision:'W003-first',geometryStats:{authoredPaths:allPaths.length,principalCoves:coves.length,foamGroups:foamGroups.length,clouds:skyClouds.length,spray:spray.length},viewport:{width:w,height:h,dpr,scale,offsetX,offsetY},render};
}
addEventListener('resize',render);render();
