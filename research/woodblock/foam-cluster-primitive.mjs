// P092 isolated generated primitive. Three observed boundary categories;
// no museum pixels, fixed finished outline or upstream implementation copied.
import {random,hash} from '../../src/random.mjs';
import {cubicBezier,pointInPolygon} from '../../src/procedural/geometry.mjs';
const pt=p=>p.map(v=>v.toFixed(3)).join(',');
const closed=p=>'M'+p.map(pt).join(' L')+' Z';
function inkShape(points,width){
 const left=[],right=[];
 for(let i=0;i<points.length;i++){
  const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy)||1,t=i/(points.length-1);
  const w=width*(.025+Math.sin(Math.PI*t)**.7)*(.78+.22*Math.cos(2*Math.PI*t+.6))/2;
  left.push([points[i][0]-dy/length*w,points[i][1]+dx/length*w]);right.push([points[i][0]+dy/length*w,points[i][1]-dx/length*w]);
 }
 return [...left,...right.reverse()];
}
export function generateCluster(seed=721){
 if(!Number.isInteger(seed)||seed<0||seed>4294967295)throw Error('uint32 seed required');
 const r=random(hash(seed,0x50303932)),count=3+Math.floor(r()*2),weights=Array.from({length:count},()=>.7+r()*.7),sum=weights.reduce((a,b)=>a+b,0);
 const outer=[[50,80]],lobes=[],curves=[];
 const edge=(b,c,e)=>{const a=outer.at(-1);for(let i=1;i<=24;i++)outer.push(cubicBezier(a,b,c,e,i/24));};
 let origin=[180,65];edge([90,50],[145,40],origin);
 for(let i=0;i<count;i++){
  const span=300*weights[i]/sum,reach=65+r()*35,t=[.15+(r()-.5)*.1,.988],n=[t[1],-t[0]],P=(s,v)=>origin.map((x,k)=>x+t[k]*s+n[k]*v);
  const lobe={origin:[...origin],span,reach,t,n};lobes.push(lobe);
  edge(P(-.12*span,.35*reach),P(-.08*span,.95*reach),P(.30*span,reach));
  edge(P(.67*span,1.15*reach),P(.88*span,.97*reach),P(.77*span,.72*reach));
  edge(P(.71*span,.55*reach),P(.63*span,.63*reach),P(.60*span,.70*reach));
  edge(P(.46*span,.39*reach),P(.78*span,.07*reach),P(span,0));
  origin=outer.at(-1);
 }
 const end=outer.at(-1),waterHeads=Array.from({length:3},(_,i)=>({y:110+i*92+(r()-.5)*18,reach:60+r()*35,width:22+r()*8}));
 const seam=Array.from({length:97},(_,i)=>{const y=end[1]-(end[1]-80)*i/96;return[80+waterHeads.reduce((a,h)=>a+h.reach*Math.exp(-(((y-h.y)/h.width)**2)),0),y];});
 const foam=[...outer,...seam],body=[...outer,[0,450],[0,0]],marks=[],accents=[];
 function mark(lobe,along,across,scale,angle){
  const {origin,span,reach,t,n}=lobe;
  const center=origin.map((v,k)=>v+t[k]*span*along+n[k]*reach*across),A=(s,v)=>{
   const x=s*Math.cos(angle)-v*Math.sin(angle),y=s*Math.sin(angle)+v*Math.cos(angle);
   return center.map((a,k)=>a+scale*(t[k]*span*x+n[k]*reach*y));
  };
  const c=[[A(.48,-.3),A(.2,-.48),A(-.3,-.3),A(-.27,.08)],
   [A(-.27,.08),A(-.3,.6),A(.38,.61),A(.37,.12)],
   [A(.37,.12),A(.37,-.12),A(.12,-.14),A(.10,.02)]];
  const points=c.flatMap((q,i)=>Array.from({length:25},(_,j)=>cubicBezier(...q,j/24)).slice(i?1:0));
  const shape=inkShape(points,3.3+scale*1.8);
  if(!shape.every(p=>pointInPolygon(p,foam)))return;
  const accent=inkShape(points.map(p=>[p[0]-3.3,p[1]+1.5]),9.5*scale+2);
  if(accent.every(p=>pointInPolygon(p,foam)))accents.push(accent);
  marks.push({points,shape,scale});
 }
 for(const lobe of lobes){
  mark(lobe,.34,.43,.57,(r()-.5)*.4);
  mark(lobe,.78,.30,.36,-.25+(r()-.5)*.5);
  mark(lobe,.12,.13,.30,.40+(r()-.5)*.4);
 }
 return{seed,count,lobes,body,foam,seam,waterHeads,marks,accents,diagnostics:{finite:[...body,...foam,...marks.flatMap(m=>m.shape),...accents.flat()].flat().every(Number.isFinite),lobeCount:count,markCount:marks.length,scope:'one isolated source-scaled cluster; geometry/topology not yet validated'}};
}
export function clusterSvg(p){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 460" role="img" aria-label="Generated foam cluster"><rect width="450" height="460" fill="#e6dcc1"/><path d="${closed(p.body)}" fill="#23485f"/><path d="${closed(p.foam)}" fill="#eeecd5" stroke="#23485f" stroke-width="2.2" stroke-linejoin="round"/>${p.accents.map(a=>`<path d="${closed(a)}" fill="#b5cfca"/>`).join('')}${p.marks.map(m=>`<path d="${closed(m.shape)}" fill="#23485f"/>`).join('')}</svg>`;}
