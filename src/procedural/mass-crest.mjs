import {polygonField,ribbon,ribbonField} from './field-shapes.mjs';
// P088 disposable 2D mass study. Seeded branches are implicit solids, then
// vector contours; no raster artwork or traced finished wave is reused.
import {generateWave} from './rolled-front.mjs';
import {generateComposition,compositionSvg} from './composition.mjs';
import {fieldContours} from './field-contours.mjs';
import {cubicBezier,pointInPolygon} from './geometry.mjs';
import {random,hash} from '../random.mjs';
const same=(a,b)=>a.every((v,k)=>v===b[k]);
const mix=(a,b,t)=>a+(b-a)*t;
const pt=p=>p.map(n=>n.toFixed(3)).join(',');
const path=ps=>'M'+ps.map(pt).join(' L')+' Z';
const allPaths=loops=>loops.map(path).join(' ');
const curve=(controls,n=24)=>Array.from({length:n+1},(_,i)=>cubicBezier(...controls,i/n));
const norm=v=>{const d=Math.hypot(...v);return v.map(x=>x/d);};
export function generateMassCrest(seed=721,{step=2.5}={}){
 const wave=generateWave(seed),r=random(hash(seed,0x4d303838));
 const first=wave.frontGraph[0],last=wave.frontGraph.at(-1),offset=wave.body.findIndex(p=>same(p,first));
 const baselineFront=[...curve([first,[640,260],[676,280],[673,308]]),...curve([[673,308],[670,340],[560,363],last]).slice(1)];
 const baseBody=[...wave.body.slice(0,offset),...baselineFront,...wave.body.slice(offset+wave.frontGraph.length)];
 const rear=wave.body.slice(0,offset+1),inner=Array.from({length:97},(_,i)=>wave.surfaceChart.map(mix(.9599310886,-2,i/96),244));
 const rearFoam=[...rear,...inner];
 const axes=[[[585,282],[625,242],[702,245],[720,287]],[[623,316],[685,280],[748,306],[758,354]],[[609,357],[665,331],[727,381],[729,418]]];
 const parents=[],branches=[],water=[];
 axes.forEach((controls,i)=>{
  const varied=controls.map((p,k)=>k===0?p:p.map(v=>v+(r()-.5)*12));
  const width=70+r()*12,parent=ribbon(`parent-${i}`,varied,width,25+r()*8);parents.push(parent);branches.push(parent);
  const children=2+Math.floor(r()*2);
  for(let j=0;j<children;j++){
   const station=.24+(j+.3*r())*.58/children,root=cubicBezier(...varied,station),ahead=cubicBezier(...varied,Math.min(1,station+.03));
   const t=norm(ahead.map((v,k)=>v-root[k])),n=[t[1],-t[0]],reach=36+r()*25,along=18+r()*18;
   const P=(a,b)=>root.map((v,k)=>v+t[k]*a+n[k]*b);
   const child=ribbon(`parent-${i}-child-${j}`,[root,P(along*.4,reach*.75),P(along*1.4,reach*1.15),P(along*1.2,reach*.65)],28+r()*8,7+r()*4);branches.push(child);
   if(j===children-1){
    const origin=cubicBezier(...child.controls,.58),tip=child.controls[3];
    const direction=norm(tip.map((v,k)=>v-origin[k])),out=[direction[1],-direction[0]],length=18+r()*9;
    branches.push(ribbon(`parent-${i}-leaf`,[origin,origin.map((v,k)=>v+out[k]*length*.7),tip.map((v,k)=>v+out[k]*length),tip.map((v,k)=>v+out[k]*length*.8+direction[k]*8)],17,5));
   }
  }
  // Trunk begins in exposed lower water and terminates inside the mass.
  // Its subtraction, rather than an overpaint, opens the foam to water.
  const root=varied[0],start=[root[0]-45,root[1]+32],end=cubicBezier(...varied,.78);
  water.push(ribbon(`water-${i}`,[start,root,cubicBezier(...varied,.4),end],30,12));
 });
 const segments=branches.flatMap(b=>b.segments),waterSegments=water.flatMap(b=>b.segments);
 const originX=-5.37,originY=100.23,width=Math.ceil(1210/step)+1,height=Math.ceil(710/step)+1;
 const bodyValues=new Float64Array(width*height),foamValues=new Float64Array(width*height);
 for(let j=0;j<height;j++)for(let i=0;i<width;i++){
  const x=originX+i*step,y=originY+j*step,index=j*width+i,base=polygonField(x,y,baseBody),rear=polygonField(x,y,rearFoam);
  const near=x>480&&x<880&&y>150&&y<510;
  const mass=near?ribbonField(x,y,segments):-1e5,channels=near?ribbonField(x,y,waterSegments):-1e5;
  bodyValues[index]=Math.max(base,mass);foamValues[index]=Math.min(Math.max(rear,mass),-channels,bodyValues[index]);
 }
 const grid={originX,originY,step},body=fieldContours(bodyValues,width,height,grid),foam=fieldContours(foamValues,width,height,grid);
 const finite=[...body.loops,...foam.loops].flat(2).every(Number.isFinite);
 return{seed,wave,parents,branches,water,baseBody,rearFoam,bodyPolygons:body.loops,foamPolygons:foam.loops,grid:{...grid,width,height},diagnostics:{finite,bodyLoops:body.loops.length,foamLoops:foam.loops.length,openChains:body.openChains.length+foam.openChains.length,ambiguousCells:body.ambiguousCells+foam.ambiguousCells,branchCount:branches.length,scope:'seed721 area-field construction; attachments and water connection not verified'}};
}
export function massCrestSvg(p){const body=allPaths(p.bodyPolygons),foam=allPaths(p.foamPolygons);return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><clipPath id="mass-water-${p.seed}"><path d="${body}" fill-rule="evenodd" clip-rule="evenodd"/></clipPath></defs><path d="${body}" fill-rule="evenodd" fill="#23485f" stroke="#23485f" stroke-width="2.5"/><g clip-path="url(#mass-water-${p.seed})">${p.wave.bands.map(b=>`<path d="${path(b.points)}" fill="${b.color}"/>`).join('')}${p.wave.strokes.map(s=>`<path d="M${s.map(pt).join(' L')}" fill="none" stroke="#1c3c52" stroke-width="1.1"/>`).join('')}</g><path d="${foam}" fill-rule="evenodd" fill="#eeecd5" stroke="#23485f" stroke-width="2.1" stroke-linejoin="round"/></svg>`;}
export function massComposition(seed=721){
 const composition=generateComposition(seed),crest=generateMassCrest(seed),original=compositionSvg(composition);
 const start=original.indexOf('<g transform="matrix('),end=original.indexOf('</g><g><defs><clipPath id="front-',start);
 if(start<0||end<0)throw Error('P084 composition layer contract changed');
 const p=composition.pose,layer=massCrestSvg(crest).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'');
 return{crest,composition,svg:original.slice(0,start)+`<g transform="matrix(${p.scaleX} 0 0 ${p.scaleY} ${p.offsetX} ${p.offsetY})">`+layer+original.slice(end)};
}
