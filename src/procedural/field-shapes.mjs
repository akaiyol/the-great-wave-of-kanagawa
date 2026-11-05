import {cubicBezier} from './geometry.mjs';
const mix=(a,b,t)=>a+(b-a)*t;
const curve=(controls,n=24)=>Array.from({length:n+1},(_,i)=>cubicBezier(...controls,i/n));
export function polygonField(x,y,poly){
 let inside=false,min=Infinity;
 for(let i=0,j=poly.length-1;i<poly.length;j=i++){
  const a=poly[j],b=poly[i],dx=b[0]-a[0],dy=b[1]-a[1],l=dx*dx+dy*dy;
  const t=l?Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/l)):0;
  min=Math.min(min,Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy));
  if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;
 }
 return inside?min:-min;
}
export function ribbon(id,controls,width,endWidth){
 const points=curve(controls,20),segments=points.slice(1).map((b,i)=>{
  const a=points[i],dx=b[0]-a[0],dy=b[1]-a[1];
  return {a,b,dx,dy,l:dx*dx+dy*dy,r0:mix(width,endWidth,i/20)/2,r1:mix(width,endWidth,(i+1)/20)/2};
 });return{id,controls,width,endWidth,points,segments};
}
export function ribbonField(x,y,segments){
 let value=-1e5;
 for(const s of segments){const t=s.l?Math.max(0,Math.min(1,((x-s.a[0])*s.dx+(y-s.a[1])*s.dy)/s.l)):0;
  value=Math.max(value,mix(s.r0,s.r1,t)-Math.hypot(x-s.a[0]-t*s.dx,y-s.a[1]-t*s.dy));}
 return value;
}
