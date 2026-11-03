// Shared curve/ribbon kernels, moved unchanged from geometry.mjs.
const M=(x,y)=>['M',x,y],L=(x,y)=>['L',x,y],Z=()=>['Z'];
export function curve(points, steps = 100) {
  const out = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0,i-1)], p1=points[i], p2=points[i+1], p3=points[Math.min(points.length-1,i+2)];
    for (let j=0;j<steps/(points.length-1);j++) {
      const t=j/(steps/(points.length-1)), t2=t*t,t3=t2*t;
      out.push([.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),.5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)]);
    }
  }
  out.push(points.at(-1));return out;
}
export function ribbon(points, width) {
  const sides=[[],[]];
  for(let i=0;i<points.length;i++){
    const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)];
    const dx=b[0]-a[0],dy=b[1]-a[1],n=Math.hypot(dx,dy)||1;
    const w=typeof width==='function'?width(i/(points.length-1)):width;
    for(let s=0;s<2;s++){const sign=s?1:-1;sides[s].push([points[i][0]+sign*(-dy/n)*w/2,points[i][1]+sign*(dx/n)*w/2]);}
  }
  return [M(...sides[0][0]),...sides[0].slice(1).map(p=>L(...p)),...sides[1].reverse().map(p=>L(...p)),Z()];
}
