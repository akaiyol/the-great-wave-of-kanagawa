import {generateComponentField} from './component-field.mjs';
import {hash,random} from '../../src/random.mjs';
import {pointInPolygon} from '../../src/procedural/geometry.mjs';
const pt=p=>p.map(v=>Number(v.toFixed(3))).join(',');
const path=ps=>'M'+ps.map(pt).join(' L')+' Z';
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
function cubic(c,t){const s=1-t;return c[0].map((v,i)=>s**3*v+3*s*s*t*c[1][i]+3*s*t*t*c[2][i]+t**3*c[3][i]);}
const sample=(c,n=64)=>Array.from({length:n+1},(_,i)=>cubic(c,i/n));
function ribbon(centerline,widthAt,cap=true){
 const sides=[[],[]];
 const frames=centerline.map((p,i)=>{
  const a=centerline[Math.max(0,i-1)],b=centerline[Math.min(centerline.length-1,i+1)],angle=Math.atan2(b[1]-a[1],b[0]-a[0]),w=widthAt(i/(centerline.length-1));
  const normal=[Math.sin(angle),-Math.cos(angle)];
  sides[0].push(p.map((v,j)=>v+normal[j]*w/2));sides[1].push(p.map((v,j)=>v-normal[j]*w/2));return {angle,w};
 });
 const end=centerline.at(-1),frame=frames.at(-1),round=cap?Array.from({length:17},(_,i)=>{const a=frame.angle-Math.PI/2+i*Math.PI/16;return[end[0]+Math.cos(a)*frame.w/2,end[1]+Math.sin(a)*frame.w/2];}):[];
 return [...sides[0],...round.slice(1),...sides[1].toReversed()];
}
export function generateDualRegion(seed=721){
 const baseline=generateComponentField(seed),g=baseline.geometry,r=random(hash(seed,0x50313039));
 const exterior=g.watercomponents;
 const inExterior=p=>exterior.some(poly=>pointInPolygon(p,poly));
 const H=g.hollow[0];
 const top=[...sample([[0,330],[100,328],[180,280],[270,280]]),...sample([[270,280],[355,277],[415,307],H]).slice(1)];
 const base=[...top,...g.hollow.slice(1),[730,830],[0,830]];
 const count=seed===721?6:5+Math.floor(r()*3);
 const stations=[[275,215],[315,185],[360,205],[405,170],[450,215],[490,255]];
 // A seventh head, when selected, is a newly constructed station; no stamp.
 if(count===7)stations.splice(3,0,[383,185]);
 if(count===5)stations.splice(2,1);
 const lanes=stations.map((station,i)=>{
  const head=station.map(v=>v+(r()-.5)*10),root=[head[0]-65,head[1]+160],rootWidth=45+r()*20,headWidth=18+r()*12;
  const controls=[root,[root[0],root[1]-65],[head[0]-35,head[1]+55],head],centerline=sample(controls);
  return {index:i,head,root,rootWidth,headWidth,controls,centerline,polygon:ribbon(centerline,t=>rootWidth+(headWidth-rootWidth)*t)};
 });
 const water=[base,...lanes.map(l=>l.polygon)];
 const inWater=p=>inExterior(p)&&water.some(poly=>pointInPolygon(p,poly));
 const inPaleBeforeVeins=p=>inExterior(p)&&!inWater(p);
 const bands=[0,Math.floor((lanes.length-1)/3),Math.floor((lanes.length-1)*2/3),lanes.length-1].map((index,i)=>{
  const lane=lanes[index],root=lane.root,start=[root[0]+14,root[1]+85];
  const continuation=sample([start,[start[0]-7,start[1]-28],[root[0],root[1]+20],root],32);
  const centerline=[...continuation,...lane.centerline.slice(1)],width=[7,4,10,3][i];
  return {lane:index,centerline,width,color:i%2?'#346e8b':'#2b607f',polygon:ribbon(centerline,t=>width*(.25+.75*Math.sin(Math.PI*t)**.65))};
 });
 const veins=[[345,185],[430,195]].map((root,index)=>{
  const depth=30+r()*25,back=8+r()*6,trough=[root[0]+18,root[1]+depth],tip=[trough[0]-back,trough[1]-10];
  const controls=[
   [root,[root[0]+3,root[1]+12],[trough[0]+3,trough[1]-10],trough],
   [trough,[trough[0],trough[1]+5],[tip[0]-3,tip[1]+4],tip],
  ];
  const centerline=controls.flatMap((c,i)=>sample(c,40).slice(i?1:0)),rootWidth=10+r()*6,tipWidth=3+r()*3;
  return {index,root,tip,depth,back,controls,centerline,rootWidth,tipWidth,polygon:ribbon(centerline,t=>rootWidth+(tipWidth-rootWidth)*t)};
 });
 // Actual region predicates are evaluated before veins are painted. A disk
 // witness establishes sampled local overlap only, not global topology.
 function witness(center,regions){
  const probes=[center,...Array.from({length:16},(_,i)=>[center[0]+2*Math.cos(i*Math.PI/8),center[1]+2*Math.sin(i*Math.PI/8)])];
  const coverage=Object.fromEntries(Object.entries(regions).map(([name,test])=>[name,probes.map(p=>test(p))]));
  return {center,radius:2,probes,coverage,pass:Object.values(coverage).every(a=>a.every(Boolean))};
 }
 const witnesses={
  laneRoots:lanes.map(l=>witness(l.root,{lane:p=>pointInPolygon(p,l.polygon),base:p=>pointInPolygon(p,base),exterior:inExterior})),
  veinRoots:veins.map(v=>witness(v.root,{paleBeforeVein:inPaleBeforeVeins,vein:p=>pointInPolygon(p,v.polygon)})),
  veinTips:veins.map(v=>witness(v.tip,{waterBeforeVein:inWater,vein:p=>pointInPolygon(p,v.polygon)})),
  scope:'Center plus 16 radial probes at radius2; sampled local coverage, not global topology.',
 };
 const geometry={base,lanes,bands,veins,exterior,water,witnesses};
 const finite=[base,...lanes.map(l=>l.polygon),...bands.map(b=>b.polygon),...veins.map(v=>v.polygon)].every(poly=>poly.every(p=>p.every(Number.isFinite)));
 if(!finite)throw new Error('P109 nonfinite regional geometry');
 const paths=polys=>polys.map(p=>`<path d="${path(p)}"/>`).join('');
 const layer=`<g data-study="P109"><defs><clipPath id="dual-exterior-${seed}">${paths(exterior)}</clipPath><clipPath id="dual-water-${seed}">${paths(water)}</clipPath></defs><g fill="none" stroke="#23485f" stroke-width="3" stroke-linejoin="round">${paths(exterior)}</g><g fill="#eeecd5">${paths(exterior)}</g><g clip-path="url(#dual-exterior-${seed})"><g fill="#23485f">${paths(water)}</g><g clip-path="url(#dual-water-${seed})">${bands.map(b=>`<path d="${path(b.polygon)}" fill="${b.color}"/>`).join('')}</g><g fill="#eeecd5">${paths(veins.map(v=>v.polygon))}</g></g></g>`;
 const p=baseline.baseline.pose,marker=`<g transform="matrix(${p.scaleX} 0 0 ${p.scaleY} ${p.offsetX} ${p.offsetY})">`;
 // P106 exposes a stable research layer wrapper in the composition frame.
 const start=baseline.svg.indexOf('<g data-study="P106">'),end=baseline.svg.indexOf('</g><g><defs><clipPath id="front-',start);
 if(start<0||end<0)throw new Error('P109 primary SVG replacement interface unavailable');
 const svg=baseline.svg.slice(0,start)+layer+baseline.svg.slice(end+4);
 const diagnostics={finite,laneCount:lanes.length,laneRoots:witnesses.laneRoots.map(w=>w.pass),veinRoots:witnesses.veinRoots.map(w=>w.pass),veinTips:witnesses.veinTips.map(w=>w.pass),scope:'Frozen exterior; local sampled witnesses only. Failed roots retained without rescue; native review and topology checks pending.'};
 return {seed,baseline,svg,geometry,diagnostics};
}
