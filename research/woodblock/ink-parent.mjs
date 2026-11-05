import {generateMeasuredFork} from './measured-fork.mjs';
import {cubicBezier} from '../../src/procedural/geometry.mjs';
const pt=p=>p.map(v=>v.toFixed(3)).join(',');
const polygon=p=>'M'+p.map(pt).join(' L')+' Z';
const sample=curves=>curves.flatMap((c,i)=>Array.from({length:33},(_,j)=>cubicBezier(...c,j/32)).slice(i?1:0));
function ribbon(points,widths,closed=false){
 const n=points.length,sides=[[],[]];
 for(let i=0;i<n;i++){
  const a=points[closed?(i+n-1)%n:Math.max(0,i-1)],b=points[closed?(i+1)%n:Math.min(n-1,i+1)];
  const dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy)||1;
  for(let s=0;s<2;s++){const sign=s?1:-1;sides[s].push([points[i][0]+sign*dy/length*widths[i]/2,points[i][1]-sign*dx/length*widths[i]/2]);}
 }
 return {sides,polygon:[...sides[0],...sides[1].toReversed()],path:closed?polygon(sides[0])+' '+polygon(sides[1].toReversed()):polygon([...sides[0],...sides[1].toReversed()])};
}
const taper=(points,maxWidth)=>points.map((_,i)=>maxWidth*Math.sin(Math.PI*i/(points.length-1))**.65);

export function generateInkParent(seed=721){
 const baseline=generateMeasuredFork(seed),I=baseline.anchors.I;
 const absolute=c=>c.map(p=>p.map((v,i)=>v+I[i]));
 const hood=[[[ -27,9],[-30,-13],[-18,-27],[-1,-26]],[[-1,-26],[17,-25],[26,-1],[21,14]],[[21,14],[18,27],[4,32],[-8,30]]].map(absolute);
 const counter=[[[-13,25],[-19,18],[-10,4],[4,4]],[[4,4],[11,3],[17,5],[21,8]]].map(absolute);
 const marks=[{name:'hood',curves:hood,maxWidth:6},{name:'counter',curves:counter,maxWidth:4}].map(m=>{
  const points=sample(m.curves),widths=taper(points,m.maxWidth);
  return {...m,points,widths,closed:false,...ribbon(points,widths)};
 });
 const accentPoints=marks[0].points.map(([x,y])=>[x-3,y+3]);
 const accent={points:accentPoints,...ribbon(accentPoints,taper(accentPoints,11))};
 // Retained centerline sampled more finely for a smoothly weighted closed ribbon.
 const contourPoints=baseline.curves.flatMap(c=>Array.from({length:64},(_,i)=>cubicBezier(...c.controls,i/64)));
 const n=contourPoints.length;
 const rawWidths=contourPoints.map((p,i)=>{
  const a=contourPoints[(i+n-1)%n],b=contourPoints[(i+1)%n],u=[p[0]-a[0],p[1]-a[1]],v=[b[0]-p[0],b[1]-p[1]];
  const angle=Math.abs(Math.atan2(u[0]*v[1]-u[1]*v[0],u[0]*v[0]+u[1]*v[1]));
  const curvature=angle/Math.max(.01,(Math.hypot(...u)+Math.hypot(...v))/2);
  return 1.4+3.4/(1+50*curvature);
 });
 const widths=rawWidths.map((_,i)=>{let sum=0;for(let k=-4;k<=4;k++)sum+=rawWidths[(i+k+n)%n]*(5-Math.abs(k));return sum/25;});
 // Offset radius must fit the local turn after smoothing, including tangent jumps.
 const smoothedWidths=[...widths];
 const edgeLengths=contourPoints.map((p,i)=>Math.hypot(...p.map((v,j)=>v-contourPoints[(i+n-1)%n][j])));
 for(let i=0;i<n;i++){
  const p=contourPoints[i],a=contourPoints[(i+n-1)%n],b=contourPoints[(i+1)%n];
  const u=p.map((v,j)=>v-a[j]),v=b.map((x,j)=>x-p[j]);
  const turn=Math.abs(Math.atan2(u[0]*v[1]-u[1]*v[0],u[0]*v[0]+u[1]*v[1]));
  const radius=Math.min(edgeLengths[i],edgeLengths[(i+1)%n])/(2*Math.max(1e-9,Math.tan(turn/2)));
  widths[i]=Math.min(widths[i],radius*.8);
 }
 // Limit growth away from a capped turn without moving its centerline.
 for(let pass=0;pass<2;pass++){
  for(let i=0;i<n;i++)widths[i]=Math.min(widths[i],widths[(i+n-1)%n]+edgeLengths[i]*.4);
  for(let i=n-1;i>=0;i--)widths[i]=Math.min(widths[i],widths[(i+1)%n]+edgeLengths[(i+1)%n]*.4);
 }
 const contour={centerline:baseline.curves,points:contourPoints,widths,widthCaps:widths.flatMap((w,i)=>w<smoothedWidths[i]?[{index:i,before:smoothedWidths[i],after:w}]:[]),...ribbon(contourPoints,widths,true)};
 const finite=[...marks.flatMap(m=>m.polygon),...accent.polygon,...contour.sides.flat()].flat().every(Number.isFinite);
 const twoOpenPaths=marks.length===2&&marks.every(m=>!m.closed&&Math.hypot(...m.points[0].map((v,i)=>v-m.points.at(-1)[i]))>0);
 if(!finite||!twoOpenPaths)throw new Error('P098 finite/open-path preflight failed');
 const foamPath='M'+pt(baseline.curves[0].controls[0])+baseline.curves.map(c=>' C'+c.controls.slice(1).map(pt).join(' ')).join('')+' Z';
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 260"><rect width="250" height="260" fill="#e6dcc1"/><path d="${foamPath}" fill="#eeecd5"/><path d="${accent.path}" fill="#b3d2cc"/>${marks.map(m=>`<path d="${m.path}" fill="#23485f"/>`).join('')}<path d="${contour.path}" fill="#23485f" fill-rule="evenodd"/></svg>`;
 return {...baseline,svg,foamPath,ink:marks.map(m=>m.polygon),inkCurves:marks.map(m=>m.curves),accent:accent.polygon,marks,accentGeometry:accent,contour,diagnostics:{finite,twoOpenPaths,scope:'P098 initial finite and required open paths only; visual and contour integrity pending'}};
}
