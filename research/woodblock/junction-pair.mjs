import {generateInkParent} from './ink-parent.mjs';
import {hash} from '../../src/random.mjs';
import {cubicBezier} from '../../src/procedural/geometry.mjs';
const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]);
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1],unit=a=>a.map(v=>v/Math.hypot(...a)),perp=a=>[-a[1],a[0]],angle=a=>Math.atan2(a[1],a[0]);
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
export function generateJunctionPair(){
 const base=generateInkParent(hash(721,106)),P=base.anchors.P,I0=base.anchors.I,J0=base.anchors.J;
 const midpoint=m=>m[0].map((v,i)=>(v+m.at(-1)[i])/2);
 const E0=unit(sub(midpoint(base.marks[0].points),I0)),N0=perp(E0),delta=wrap(angle(E0)-angle(sub(J0,I0)));
 return [{name:'reference',sx:1,sy:1,dJ:[0,0]},{name:'A',sx:.85,sy:1.1,dJ:[0,18]},{name:'B',sx:1.15,sy:.9,dJ:[26,-14]}].map(spec=>{
  const {sx,sy,dJ}=spec,shoulder=p=>p.map((v,i)=>P[i]+(v-P[i])*[sx,sy][i]);
  const I=shoulder(I0),J=add(J0,dJ),v=unit(sub(J,I)),c=Math.cos(delta),s=Math.sin(delta),E=[v[0]*c-v[1]*s,v[0]*s+v[1]*c],N=perp(E);
  const map=p=>{const q=sub(p,I0);return I.map((v,i)=>v+sx*N[i]*dot(q,N0)+sy*E[i]*dot(q,E0));};
  const endDelta=base.curves.map((curve,i)=>{
   if(['P-upper','A-inner'].includes(curve.feature))return sub(shoulder(curve.controls[3]),curve.controls[3]);
   if(curve.feature==='J-left')return add(sub(shoulder(curve.controls[3]),curve.controls[3]),dJ);
   return i>=4&&i<=12?dJ:[0,0];
  });
  const curves=base.curves.map((curve,i)=>({...curve,controls:curve.controls.map((p,k)=>add(p,k<2?endDelta[(i+endDelta.length-1)%endDelta.length]:endDelta[i]))}));
  const outline=[curves[0].controls[0],...curves.flatMap(c=>Array.from({length:32},(_,i)=>cubicBezier(...c.controls,(i+1)/32)))];
  const child=[];for(let i=0;i<outline.length-1;i++){const a=outline[i],b=outline[i+1],ai=a[0]>=40,bi=b[0]>=40;if(ai!==bi){const t=(40-a[0])/(b[0]-a[0]);child.push([40,a[1]+(b[1]-a[1])*t]);}if(bi)child.push(b);}
  const supports=base.supports.map(path=>({...path,points:path.points.map((p,k)=>path.from==='J'?add(p,dJ):path.to==='J'?add(p,dJ.map(v=>v*k/(path.points.length-1))):[...p])}));
  const marks=base.marks.map(m=>({name:m.name,points:m.points.map(map),polygon:m.polygon.map(map),curves:m.curves.map(c=>c.map(map)),closed:false}));
  const accent=base.accent.map(map),anchors={...base.anchors,I,J,B:add(base.anchors.B,dJ),C:add(base.anchors.C,dJ)};
  const mouth=sub(midpoint(marks[0].points),I),invariant=wrap(angle(mouth)-angle(sub(J,I))-delta);
  const oldInvariant=wrap(angle(E0)-angle(sub(J,I0))-delta);
  return {...spec,curves,outline,child,supports,anchors,marks,accent,det:sx*sy,invariant,frameOnly:{angularResidual:oldInvariant,rmsDisplacement:Math.sqrt(marks.flatMap((m,i)=>m.points.map((p,k)=>dot(sub(p,base.marks[i].points[k]),sub(p,base.marks[i].points[k])))).reduce((a,b)=>a+b,0)/marks.reduce((n,m)=>n+m.points.length,0))},reference:{ink:base.ink,accent:base.accent,outline:base.outline}};
 });
}
