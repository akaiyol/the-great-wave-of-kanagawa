import {random,hash} from '../../src/random.mjs';
import {cubicBezier,pointInPolygon} from '../../src/procedural/geometry.mjs';
const pt=p=>p.map(v=>v.toFixed(3)).join(',');
const polygon=p=>'M'+p.map(pt).join(' L')+' Z';
function inkShape(points,width){
 const sides=[[],[]];
 for(let i=0;i<points.length;i++){
  const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],v=[b[0]-a[0],b[1]-a[1]],n=Math.hypot(...v)||1,t=i/(points.length-1);
  const w=width*(.02+Math.sin(Math.PI*t)**.72)*(.78+.22*Math.cos(t*5+.4))/2;
  for(let s=0;s<2;s++)sides[s].push([points[i][0]+(s?1:-1)*v[1]/n*w,points[i][1]-(s?1:-1)*v[0]/n*w]);
 }
 return [...sides[0],...sides[1].reverse()];
}
export function generateParentFork(seed=721){
 if(!Number.isInteger(seed)||seed<0||seed>4294967295)throw new RangeError('uint32 seed required');
 const r=random(hash(seed,0x50303934)),vary=(a,w)=>a+(r()-.5)*w;
 const params={parentWidth:vary(112,9),upperReach:vary(147,10),upperDrop:vary(60,8),
  lowerDrop:vary(92,7),rightReach:vary(49,7),leftReach:vary(45,6),upperReturn:vary(14,4),
  rightReturn:vary(12,3),leftReturn:vary(10,3),upperCoveDepth:vary(49,5),lowerCoveDepth:vary(24,4)};
 const P=[60,60],J=[94,161],A=[P[0]+params.upperReach,P[1]+params.upperDrop],
  B=[J[0]+params.rightReach,J[1]+params.lowerDrop*.58],C=[J[0]-params.leftReach,J[1]+params.lowerDrop*.61];
 const outline=[[-12,-12]],curves=[];
 const edge=(feature,b,c,e)=>{const controls=[outline.at(-1),b,c,e];curves.push({feature,controls});for(let i=1;i<=32;i++)outline.push(cubicBezier(...controls,i/32));};
 edge('P-upper',[35,-9],[P[0]+params.parentWidth*.55,5],[140,37]);
 edge('A-outer',[A[0]-14,36],[A[0]+37,A[1]-29],A);
 edge('A-return',[A[0]-12,A[1]+9],[A[0]-params.upperReturn,A[1]-7],[A[0]-params.upperReturn,A[1]-15]);
 edge('A-inner',[A[0]-21,A[1]-50],[171,75],[146,90]);
 edge('A-J-cove',[123,98],[140-params.upperCoveDepth*.35,119],[125,139]);
 edge('J-right',[130,159],[116,158],[128,167]);
 edge('B-outer',[B[0]+19,B[1]-34],[B[0]+24,B[1]-8],B);
 edge('B-return',[B[0]-14,B[1]+9],[B[0]-params.rightReturn,B[1]-5],[B[0]-params.rightReturn,B[1]-13]);
 edge('B-inner',[128,179],[111,176],[104,191]);
 edge('B-C-notch',[100,199],[98, B[1]-params.lowerCoveDepth],[91,194]);
 edge('C-outer',[84,211],[C[0]+8,C[1]+9],C);
 edge('C-return',[C[0]-6,C[1]-3],[C[0]+params.leftReturn,C[1]-5],[C[0]+params.leftReturn,C[1]-14]);
 edge('C-inner',[80,190],[75,170],[53,174]);
 edge('J-left',[40,166],[57,157],[49,147]);
 edge('P-left',[25,133],[29,97],[11,77]);
 edge('P-close',[-10,65],[-8,16],outline[0]);
 const anchors={P,A,J,B,C,I:[104,74],upperCove:[133,112],lowerCove:[98,194]};
 const supports=[{from:'P',to:'A',points:[P,[113,53],[166,62],[188,78]]},
  {from:'P',to:'J',points:[P,[79,105],[92,141],J]},
  {from:'J',to:'B',points:[J,[110,165],[128,177],[139,190]]},
  {from:'J',to:'C',points:[J,[83,179],[80,188],[76,195]]}];
 // Check the rendered fill along each actual support, including a broad corridor.
 const coverage=supports.map(s=>{
  let inside=true;
  for(let k=1;k<s.points.length;k++)for(let i=0;i<=12;i++){
   const t=i/12,p=s.points[k-1].map((v,j)=>v+(s.points[k][j]-v)*t);
   for(const d of [[0,0],[3,0],[-3,0],[0,3],[0,-3]])inside&&=pointInPolygon(p.map((v,j)=>v+d[j]),outline);
  }
  return {from:s.from,to:s.to,inside};
 });
 if(!coverage.every(c=>c.inside))throw new Error('Actual nested fork fill support missing');
 const inkCurves=[[[77,83],[79,56],[111,43],[124,67]],[[124,67],[139,91],[110,104],[106,84]],[[106,84],[103,73],[92,75],[92,82]]];
 const inkPoints=inkCurves.flatMap((c,i)=>Array.from({length:33},(_,j)=>cubicBezier(...c,j/32)).slice(i?1:0));
 const ink=inkShape(inkPoints,vary(5,1)),accent=inkShape(inkPoints.map(([x,y])=>[x-3,y+3]),11);
 const finite=[...outline,...ink,...accent].flat().every(Number.isFinite);
 if(!finite)throw new Error('Nonfinite parent geometry');
 const d='M'+pt(curves[0].controls[0])+curves.map(c=>' C'+c.controls.slice(1).map(pt).join(' ')).join('')+' Z';
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 260"><rect width="250" height="260" fill="#e6dcc1"/><path d="${d}" fill="#eeecd5" stroke="#23485f" stroke-width="2.1" stroke-linejoin="round"/><path d="${polygon(accent)}" fill="#b3d2cc"/><path d="${polygon(ink)}" fill="#23485f"/></svg>`;
 return {seed,params,graph:{P:['A','J'],J:['B','C']},anchors,curves,outline,supports,coverage,inkCurves,ink,accent,svg,diagnostics:{finite,forkLevelsImplemented:coverage.every(c=>c.inside),scope:'nested sampled fill support; visual hierarchy unreviewed'}};
}
