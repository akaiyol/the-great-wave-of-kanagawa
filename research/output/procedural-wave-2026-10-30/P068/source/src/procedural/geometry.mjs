// Shared planar geometry. Callers retain their sampling and tolerance choices.
export const lerp=(a,b,t)=>a.map((v,k)=>v+(b[k]-v)*t);
export function cubicBezier(a,b,c,d,t){const z=1-t;return a.map((v,k)=>z*z*z*v+3*z*z*t*b[k]+3*z*t*t*c[k]+t*t*t*d[k]);}
export function cubicTangent(controls,t){const z=1-t;return controls[0].map((v,k)=>3*z*z*(controls[1][k]-v)+6*z*t*(controls[2][k]-controls[1][k])+3*t*t*(controls[3][k]-controls[2][k]));}
export function pointInPolygon(p,poly){let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;}
export function pointSegmentDistance(p,a,b){
 const dx=b[0]-a[0],dy=b[1]-a[1],lengthSquared=dx*dx+dy*dy;
 if(lengthSquared===0)return Math.hypot(p[0]-a[0],p[1]-a[1]);
 const t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/lengthSquared));
 return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);
}
export const polygonClearance=(p,poly)=>Math.min(...poly.map((a,i)=>pointSegmentDistance(p,a,poly[(i+1)%poly.length])));
export const orient=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
// Strict crossings exclude endpoint touches and collinear overlap.
export const segmentsCross=(a,b,c,d,tolerance=1e-9)=>orient(a,b,c)*orient(a,b,d)<-tolerance&&orient(c,d,a)*orient(c,d,b)<-tolerance;
export function polygonSelfCrossings(poly,tolerance=1e-9){let count=0;for(let i=0;i<poly.length;i++)for(let j=i+2;j<poly.length;j++)if(!(i===0&&j===poly.length-1)&&segmentsCross(poly[i],poly[(i+1)%poly.length],poly[j],poly[(j+1)%poly.length],tolerance))count++;return count;}

// W060 primitive: grow actual paired boundaries along a cubic centerline.
// Sampling, linear taper and point order intentionally match the retained control.
export function taperedRibbon(id,parentId,controls,rootWidth,tipWidth){
 const centerline=[],left=[],right=[];
 for(let i=0;i<=96;i++){const t=i/96,p=cubicBezier(...controls,t),v=cubicTangent(controls,t),length=Math.hypot(...v),n=[-v[1]/length,v[0]/length],width=rootWidth+(tipWidth-rootWidth)*t;
  centerline.push(p);left.push(p.map((x,k)=>x+n[k]*width/2));right.push(p.map((x,k)=>x-n[k]*width/2));}
 const points=[...left,...right.reverse()];
 return{id,parentId,controls,rootWidth,tipWidth,centerline,points};
}
