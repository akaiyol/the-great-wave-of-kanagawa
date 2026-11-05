// P089: water topology is primary; foam is its shared outer shell.
import {generateWave} from './rolled-front.mjs';
import {generateComposition,compositionSvg} from './composition.mjs';
import {massCrestSvg} from './mass-crest.mjs';
import {fieldContours} from './field-contours.mjs';
import {polygonField,ribbon,ribbonField} from './field-shapes.mjs';
import {cubicBezier} from './geometry.mjs';
import {random,hash} from '../random.mjs';
const same=(a,b)=>a.every((v,k)=>v===b[k]);
const mix=(a,b,t)=>a+(b-a)*t;
const norm=v=>{const d=Math.hypot(...v);return v.map(x=>x/d);};
const curve=(controls,n=24)=>Array.from({length:n+1},(_,i)=>cubicBezier(...controls,i/n));
export function generateWaterTree(seed=721,{step=2.5}={}){
 const wave=generateWave(seed),r=random(hash(seed,0x57303839)),baseline=generateComposition(seed),floorY=baseline.primary.bounds.minY;
 const first=wave.frontGraph[0],last=wave.frontGraph.at(-1),offset=wave.body.findIndex(p=>same(p,first));
 const baseFront=[...curve([first,[640,260],[676,280],[673,308]]),...curve([[673,308],[670,340],[560,363],last]).slice(1)];
 const baseBody=[...wave.body.slice(0,offset),...baseFront,...wave.body.slice(offset+wave.frontGraph.length)];
 const rearFoam=[...wave.body.slice(0,offset+1),...Array.from({length:97},(_,i)=>wave.surfaceChart.map(mix(.9599310886,-2,i/96),244))];
 const axes=[[[560,310],[615,278],[674,290],[686,326]],[[580,350],[650,309],[737,337],[744,375]],[[563,387],[650,352],[709,403],[697,444]]];
 const inner=[],outer=[],tree=[];
 function branch(id,parentId,controls,width,tip,shell){
  const dark=ribbon(id,controls,width,tip),light=ribbon(id,controls,width+shell*2,tip+shell*2);
  inner.push(dark);outer.push(light);tree.push({id,parentId,controls,width,tip,shell});return dark;
 }
 axes.forEach((controls,i)=>{
  const varied=controls.map((p,k)=>k===0?p:p.map(v=>v+(r()-.5)*8));
  const parent=branch(`water-${i}`,null,varied,48+r()*8,22+r()*6,7+r()*2),count=2+Math.floor(r()*2);
  for(let j=0;j<count;j++){
   const t=.40+j*.43/count,root=cubicBezier(...varied,t),ahead=cubicBezier(...varied,t+.02),direction=norm(ahead.map((v,k)=>v-root[k]));
   const n=[direction[1],-direction[0]],width=20+r()*7,shell=5+r()*2;
   const reach=Math.min(30+r()*16,Math.max(9,(root[1]-floorY-width/2-shell-4)/Math.max(.2,-n[1]))*.78),along=24+r()*19;
   const P=(a,b)=>root.map((v,k)=>v+direction[k]*a+n[k]*b);
   const child=branch(`water-${i}-${j}`,parent.id,[root,P(along*.3,reach*.8),P(along*1.3,reach*1.1),P(along*1.25,reach*.65)],width,9+r()*5,shell);
   // Real water children divide; grandchildren inherit their curved frame.
   if(j===0||j===count-1){
    const station=.52,origin=cubicBezier(...child.controls,station),next=cubicBezier(...child.controls,station+.03),v=norm(next.map((x,k)=>x-origin[k])),out=[v[1],-v[0]];
    const length=Math.min(18+r()*7,Math.max(5,(origin[1]-floorY-12)/Math.max(.2,-out[1]))*.7),P2=(a,b)=>origin.map((x,k)=>x+v[k]*a+out[k]*b);
    branch(`water-${i}-${j}-leaf`,child.id,[origin,P2(5,length*.8),P2(19,length),P2(20,length*.65)],11,4,4.5);
   }
  }
 });
 const outerSegments=outer.flatMap(b=>b.segments),innerSegments=inner.flatMap(b=>b.segments);
 const originX=-5.37,originY=100.23,width=Math.ceil(1210/step)+1,height=Math.ceil(710/step)+1;
 const bodyValues=new Float64Array(width*height),foamValues=new Float64Array(width*height);
 for(let j=0;j<height;j++)for(let i=0;i<width;i++){
  const x=originX+i*step,y=originY+j*step,index=j*width+i,base=polygonField(x,y,baseBody),rear=polygonField(x,y,rearFoam),near=x>460&&x<870&&y>floorY-2&&y<510;
  const mass=near?ribbonField(x,y,outerSegments):-1e5,water=near?ribbonField(x,y,innerSegments):-1e5;
  const body=Math.max(base,mass),dark=Math.max(Math.min(base,-rear),water);
  bodyValues[index]=body;foamValues[index]=Math.min(body,-dark);
 }
 const grid={originX,originY,step},body=fieldContours(bodyValues,width,height,grid),foam=fieldContours(foamValues,width,height,grid);
 const points=[...body.loops,...foam.loops].flat(),bounds={minY:Math.min(...points.map(p=>p[1])),maxY:Math.max(...points.map(p=>p[1]))};
 return{seed,wave,tree,outer,inner,baseBody,rearFoam,bodyPolygons:body.loops,foamPolygons:foam.loops,grid:{...grid,width,height},diagnostics:{finite:points.flat().every(Number.isFinite),bodyLoops:body.loops.length,foamLoops:foam.loops.length,openChains:body.openChains.length+foam.openChains.length,branchCount:tree.length,bounds,baselineMinY:floorY,scope:'one generated water tree; actual attachment/hole topology unverified'}};
}
export function waterTreeComposition(seed=721){
 const composition=generateComposition(seed),crest=generateWaterTree(seed),original=compositionSvg(composition),start=original.indexOf('<g transform="matrix('),end=original.indexOf('</g><g><defs><clipPath id="front-',start);
 if(start<0||end<0)throw Error('P084 composition layer contract changed');
 const p=composition.pose,layer=massCrestSvg(crest).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'');
 return{crest,composition,svg:original.slice(0,start)+`<g transform="matrix(${p.scaleX} 0 0 ${p.scaleY} ${p.offsetX} ${p.offsetY})">`+layer+original.slice(end)};
}
