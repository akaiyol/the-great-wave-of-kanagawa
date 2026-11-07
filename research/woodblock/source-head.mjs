import {generateComponentField} from './component-field.mjs';
import {sourceHeadCurves} from './source-head-profile.mjs';
import {pointInPolygon} from '../../src/procedural/geometry.mjs';
const map=p=>[p[0]*1200/3859,p[1]*800/2594];
const pt=p=>p.map(v=>Number(v.toFixed(3))).join(',');
const path=ps=>'M'+ps.map(pt).join(' L')+' Z';
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
function cubic(c,t){const s=1-t;return c[0].map((v,i)=>s**3*v+3*s*s*t*c[1][i]+3*s*t*t*c[2][i]+t**3*c[3][i]);}
const sample=(c,n=32)=>Array.from({length:n+1},(_,i)=>cubic(c,i/n));
function join(stations){
 return stations.slice(0,-1).flatMap((a,i)=>{
  const b=stations[i+1],previous=stations[Math.max(0,i-1)],next=stations[Math.min(stations.length-1,i+2)];
  const c1=a.map((v,j)=>v+(b[j]-previous[j])/6),c2=b.map((v,j)=>v-(next[j]-a[j])/6);
  const points=sample([a,c1,c2,b]);points[0]=a;points[points.length-1]=b;return points.slice(i?1:0);
 });
}
export function generateSourceHead(seed=721){
 const baseline=generateComponentField(seed),g=baseline.geometry,H=g.hollow[0];
 const lastCut=g.supportEdge.at(-1),cutIndex=g.supportsheet.findIndex(p=>p[0]===lastCut[0]&&p[1]===lastCut[1]);
 if(cutIndex<0)throw new Error('P110 exact outer-prefix interface unavailable');
 const outerPrefix=g.supportsheet.slice(0,cutIndex+1);
 const outerReturn=join([lastCut,[618,306],[595,295],[555,300],[525,300],H]);
 const outer=[...outerPrefix,...outerReturn.slice(1)];
 const curves=sourceHeadCurves.map(c=>c.map(map));
 const endpoint=curves.at(-1).at(-1),correction=H.map((v,i)=>v-endpoint[i]);
 const upperToLower=curves.flatMap((c,index)=>{
  const points=sample(c,48).map((p,i)=>index===curves.length-1?p.map((v,j)=>v+correction[j]*(i/48)**3):p);
  return points.slice(index?1:0);
 });
 upperToLower[upperToLower.length-1]=H;
 const profile=upperToLower.toReversed(),upper=profile.at(-1),station=[440,205];
 const seamIndex=g.seam.findIndex(p=>p[0]===station[0]&&p[1]===station[1]);
 if(seamIndex<0)throw new Error('P110 original seam-remainder interface unavailable');
 const bridge=sample([upper,[470,212],[452,205],g.seam[seamIndex]]);
 const seam=[...profile,...bridge.slice(1),...g.seam.slice(seamIndex+1)];
 const supportsheet=[...outer,...seam.slice(1)];
 const waterbase=[...outer,...g.hollow.slice(1),[730,830],[0,830]];
 const foamcomponents=[supportsheet,...g.children],watercomponents=[waterbase,...g.children];
 const sourceBandControls=[[[1430,1090],[1460,950],[1565,870],[1640,835]],[[1640,835],[1660,825],[1665,800],[1650,795]]];
 const bandCenterline=sourceBandControls.flatMap((c,i)=>sample(c.map(map),64).slice(i?1:0));
 const bandSides=[[],[]];
 bandCenterline.forEach((p,i)=>{
  const a=bandCenterline[Math.max(0,i-1)],b=bandCenterline[Math.min(bandCenterline.length-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy)||1;
  const width=(20-12*i/(bandCenterline.length-1))*1200/3859;
  bandSides[0].push([p[0]+dy/d*width/2,p[1]-dx/d*width/2]);bandSides[1].push([p[0]-dy/d*width/2,p[1]+dx/d*width/2]);
 });
 const band={centerline:bandCenterline,polygon:[...bandSides[0],...bandSides[1].toReversed()],sourceControls:sourceBandControls};
 const inBody=p=>watercomponents.some(poly=>pointInPolygon(p,poly)),inFoam=p=>foamcomponents.some(poly=>pointInPolygon(p,poly));
 const W=map([1599.3,802.6]),F=map([1942.9,903.4]),S=map([1919.2,1057.4]);
 const P=[g.roots.at(-1)[0]+20*g.scales.at(-1),g.roots.at(-1)[1]-7*g.scales.at(-1)];
 function route(points,test,radius=0){
  const probes=[];
  points.slice(0,-1).forEach((a,i)=>{
   const b=points[i+1],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1]));
   for(let j=0;j<=n;j++){
    const p=mix(a,b,j/n);probes.push({point:p,inside:test(p)});
    if(radius)for(let k=0;k<16;k++){const q=[p[0]+radius*Math.cos(k*Math.PI/8),p[1]+radius*Math.sin(k*Math.PI/8)];probes.push({point:q,inside:test(q)});}
   }
  });
  return {points,radius,probes,pass:probes.every(p=>p.inside),failed:probes.filter(p=>!p.inside).length};
 }
 const routes={
  W:route([W,map([1557.8,820.4]),map([1522.2,861.9])],p=>inBody(p)&&!inFoam(p)),
  Wextended:route([W,[484,255],[470,270],[460,300],[460,360]],p=>inBody(p)&&!inFoam(p)),
  F:route([F,P],inFoam,3),
  S:route([S,map([1931.1,1128.5]),map([2025.9,1175.9])],p=>!inBody(p)&&!inFoam(p)),
  WextendedRequired:false,
  scope:'Sampled route centers and radius3 foam corridor (full width6); provisional geometry, not source width or global topology.',
 };
 const geometry={profile,sourceCurves:curves,correction,outerPrefix,outerReturn,outer,seam,supportsheet,waterbase,foamcomponents,watercomponents,children:g.children,band,routes,W,F,P,S};
 const finite=[...watercomponents,...foamcomponents,band.polygon].every(poly=>poly.every(p=>p.every(Number.isFinite)));
 if(!finite)throw new Error('P110 nonfinite geometry');
 const paths=polys=>polys.map(p=>`<path d="${path(p)}"/>`).join('');
 const layer=`<g data-study="P110"><defs><clipPath id="head-body-${seed}">${paths(watercomponents)}</clipPath></defs><g fill="#23485f">${paths(watercomponents)}</g><g clip-path="url(#head-body-${seed})">${g.bands.map(b=>`<path d="${path(b.points)}" fill="${b.color}"/>`).join('')}<path d="${path(band.polygon)}" fill="#346e8b"/></g><g fill="none" stroke="#23485f" stroke-width="3" stroke-linejoin="round">${paths(foamcomponents)}</g><g fill="#eeecd5">${paths(foamcomponents)}</g></g>`;
 const start=baseline.svg.indexOf('<g data-study="P106">'),end=baseline.svg.indexOf('</g><g><defs><clipPath id="front-',start);
 if(start<0||end<0)throw new Error('P110 primary SVG replacement interface unavailable');
 const svg=baseline.svg.slice(0,start)+layer+baseline.svg.slice(end+4);
 return {seed,baseline,svg,geometry,diagnostics:{finite,Wwater:routes.W.pass,Wextended:routes.Wextended.pass,WextendedRequired:false,FfoamCorridor:routes.F.pass,Ssky:routes.S.pass,failedProbes:{W:routes.W.failed,F:routes.F.failed,S:routes.S.failed},scope:'Source-frame registration approximate; local sampled coverage only. Failures retained without rescue; native and polygon review pending.'}};
}
