/* W047: shared C1 back-to-annular-front surface, not independent ribbons.
   Longitudinal u turns clockwise around the principal sky hollow. Radial v
   spans water thickness. Foam and water channels occupy this same chart. */
const ink='#23485f',foam='#eeecd5',blue='#39738a',pale='#a2c7c4';
const pt=p=>p.map(x=>x.toFixed(2)).join(',');
const d=p=>'M'+p.map(pt).join(' L')+' Z';
const lerp=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
function curve(p){let s='M'+pt(p[0]);for(let i=1;i<p.length-1;i++)s+=' Q'+pt(p[i])+' '+pt(lerp(p[i],p[i+1],.5));return s+' L'+pt(p.at(-1))+' Z';}
function bez(a,b,c,e,t){let z=1-t;return a.map((v,i)=>z*z*z*v+3*z*z*t*b[i]+3*z*t*t*c[i]+t*t*t*e[i]);}
// Independent geometry-profile stream; it does not consume topology RNG.
export function profileField(seed){
 let state=(seed^0x51f15e37)>>>0;
 const rng=()=>{state=(state+0x6d2b79f5)>>>0;let z=state;z=Math.imul(z^(z>>>15),z|1);z^=z+Math.imul(z^(z>>>7),z|61);return((z^(z>>>14))>>>0)/4294967296;};
 const parameters={height:.78+.34*rng(),slope:-.07+.14*rng(),lean:-105+210*rng(),hollowBulge:-160+320*rng()};
 const terms=([x,y])=>{const h=parameters.height*(1+parameters.slope*(x/600-1)),hx=parameters.height*parameters.slope/600,Y=760+(y-760)*h,z=(760-Y)/760,g=4*x/1200*(1-x/1200),gx=4/1200*(1-x/600),L=parameters.lean*z+parameters.hollowBulge*z*(1-z),LY=-(parameters.lean+parameters.hollowBulge*(1-2*z))/760;return{h,hx,Y,g,gx,L,LY};};
 const apply=p=>{const q=terms(p);return[p[0]+q.g*q.L,q.Y];};
 const push=(p,v)=>{const q=terms(p),Yx=(p[1]-760)*q.hx,Yy=q.h,dY=Yx*v[0]+Yy*v[1];return[(1+q.gx*q.L)*v[0]+q.g*q.LY*dY,dY];};
 const determinant=p=>{const q=terms(p);return q.h*(1+q.gx*q.L);};
 const jacobianLowerBound=parameters.height*(1-Math.abs(parameters.slope))*(1-4/1200*(Math.abs(parameters.lean)+Math.abs(parameters.hollowBulge)/4));
 return{parameters,apply,push,determinant,jacobianLowerBound};
}
export function generateWave(seed=721){
 if(!Number.isInteger(seed)||seed<0||seed>4294967295)throw new RangeError('seed must be a uint32 integer');
 let randomState=(seed^0x9e3779b9)>>>0;
 const random=()=>{randomState=(randomState+0x6d2b79f5)>>>0;let z=randomState;z=Math.imul(z^(z>>>15),z|1);z^=z+Math.imul(z^(z>>>7),z|61);return((z^(z>>>14))>>>0)/4294967296;};
 const profile=profileField(seed);
 const phase=random(),rootCount=2+Math.floor(random()*3);
 const roots=Array.from({length:rootCount},(_,i)=>({id:i,station:i/(rootCount-1),children:1+Math.floor(random()*3),reach:68+random()*22,headRadius:219+random()*12}));
 const cx=540+phase*12,cy=407,rx=1.04,ry=.95;
 const map=(degrees,radius)=>{const a=degrees*Math.PI/180;return[cx+Math.cos(a)*radius*rx,cy+Math.sin(a)*radius*ry];};
 const arc=(from,to,radius,step=2)=>{let a=[];const n=Math.ceil(Math.abs(to-from)/step);for(let i=0;i<=n;i++)a.push(map(from+(to-from)*i/n,radius));return a;};
 // W049: the exposed graph IS the body/sky edge and the foam/sky
 // edge. There is no independent water lip below these branch tips.
 const outer=arc(-125,-70,264);
 const back=[];for(let i=0;i<=40;i++)back.push(bez([25,535],[150,535],[240,140],outer[0],i/40));
 const frontGraph=[outer.at(-1)],graphTips=[],coveMouths=[];
 const xy=(x,y)=>[cx+x,y];
 const edge=(b,c,e)=>{const a=frontGraph.at(-1);for(let i=1;i<=24;i++)frontGraph.push(bez(a,b,c,e,i/24));};
 // W053: children use the parent's tangent/normal frame. Their entire
 // growth length and neck scale with the available fan divided by its
 // child count; dense topology therefore makes smaller descending hooks,
 // rather than preserving a long horizontal reach on a tiny vertical step.
 const childAnatomy=[],nativeFoamNodes=[],nativeFoamSpines=[];
 for(const root of roots){
  root.headAngle=-90+35*root.station;
  root.anchor=map(root.headAngle+20,250);root.anchor[0]+=65;
  const next=root.id+1<roots.length?map(-90+35*roots[root.id+1].station+20,250).map((v,k)=>v+(k===0?65:0)):[root.anchor[0]-68,root.anchor[1]+88];
  const delta=next.map((v,k)=>v-root.anchor[k]),available=Math.hypot(...delta),t=delta.map(v=>v/available),n=[-t[1],t[0]];
  // Reserve fan height for the inward curl. Otherwise a single long child
  // can extend below its next root and physically cross that root's hooks.
  const step=delta[1]/(root.children*t[1]+.45*Math.max(0,n[1]));
  nativeFoamNodes.push({id:`root-${root.id}`,parentId:'cap',kind:'root',center:root.anchor.map((v,k)=>v+t[k]*step*.2+n[k]*step*.2),width:step*.7,tangent:t,normal:n});
  if(root.id===0)edge([root.anchor[0]-18,frontGraph.at(-1)[1]+4],[root.anchor[0]-10,root.anchor[1]],root.anchor);else edge(lerp(frontGraph.at(-1),root.anchor,.33),lerp(frontGraph.at(-1),root.anchor,.66),root.anchor);
  for(let j=0;j<root.children;j++){
   const width=(.82+random()*.2)*(root.reach/80),origin=root.anchor.map((v,k)=>v+t[k]*j*step);
   const P=(a,b)=>origin.map((v,k)=>v+step*(t[k]*a+n[k]*b*width));
   const outlineStart=frontGraph.length-1;
   edge(P(.08,-.22),P(.38,-.65),P(.65,-.52));
   edge(P(.92,-.38),P(.96,.12),P(.69,.24));
   graphTips.push(frontGraph.at(-1));
   const turnIndex=frontGraph.length-1,outerSide=frontGraph.slice(outlineStart);
   edge(P(.8,.3),P(.94,.36),P(.99,.4));
   const returnSide=frontGraph.slice(turnIndex).reverse();
   const atArc=(points,f)=>{const lengths=points.slice(1).map((p,i)=>Math.hypot(...p.map((v,k)=>v-points[i][k]))),target=lengths.reduce((a,b)=>a+b,0)*f;let used=0;for(let i=0;i<lengths.length;i++){if(used+lengths[i]>=target)return lerp(points[i],points[i+1],(target-used)/lengths[i]);used+=lengths[i];}return points.at(-1);};
   const spine=Array.from({length:65},(_,i)=>lerp(atArc(outerSide,i/64),atArc(returnSide,i/64),.5));
   const bend=spine.reduce((a,b)=>b.reduce((v,x,k)=>v+(x-origin[k])*n[k],0)<a.reduce((v,x,k)=>v+(x-origin[k])*n[k],0)?b:a);
   nativeFoamSpines.push({ownerId:`root-${root.id}-child-${j}`,parentId:`root-${root.id}`,origin:outerSide[0],throat:spine[0],bend,turn:outerSide.at(-1),points:spine});
   coveMouths.push({boundaryIndex:frontGraph.length-1,root:root.id,child:j});
   nativeFoamNodes.push({id:`root-${root.id}-child-${j}`,parentId:`root-${root.id}`,kind:'child',center:P(.4,.02),width:step*.24*width,tangent:t,normal:n});
   childAnatomy.push({root:root.id,child:j,availableFan:available,length:step,neckWidth:step*.24*width,tangent:t,normal:n});
  }
 }
 edge(xy(120,372),xy(-23,310),xy(-68,325));
 const exposedEnd=frontGraph.at(-1),descent=[];
 for(let i=1;i<=40;i++)descent.push(bez(exposedEnd,[370,360],[360,680],[1135,727],i/40));
 const body=[...back,...outer.slice(1),...frontGraph.slice(1),...descent,[1140,760],[0,760]];
 const cap=[...back,...outer.slice(1),...frontGraph.slice(1)];
 const foamBranches=[];
 const inside=(p,poly)=>{let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;};
 // A generic outward ray can run into the next root despite an open
 // cove. Route along the actual exterior of the shared boundary instead:
 // a small parallel offset follows every intervening hook to the upper
 // crest, then enters unobstructed sky. No boundary vertex is relocated.
 const pointSegmentDistance=(p,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);};
 const gapOffset=.3;
 const routeOffsets=[];
 const outward=(a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);return[dy/length,-dx/length];};
 const exteriorFront=frontGraph.map((p,i)=>{
  const a=i===0?outer.at(-2):frontGraph[i-1],b=i===frontGraph.length-1?descent[0]:frontGraph[i+1];
  const bodyIndex=back.length+outer.length-2+i;
  let featureClearance=Infinity;for(let j=0;j<body.length;j++)if(Math.abs(j-bodyIndex)>3)featureClearance=Math.min(featureClearance,pointSegmentDistance(p,body[j],body[(j+1)%body.length]));
  const localOffset=Math.min(gapOffset,featureClearance*.15);routeOffsets.push(localOffset);
  const n1=outward(a,p),n2=outward(p,b),sum=n1.map((v,k)=>v+n2[k]),length=Math.hypot(...sum),unit=sum.map(v=>v/length),miter=localOffset/(unit[0]*n1[0]+unit[1]*n1[1]);
  return p.map((v,k)=>v+unit[k]*miter);
 });
 const covePaths=coveMouths.map(({boundaryIndex})=>[...exteriorFront.slice(0,boundaryIndex+1).reverse(),[exteriorFront[0][0],80],[1080,80]]);
 const bands=[];
 // One surface chart: r retains its transverse order from the lower back
 // through the join into the annulus. u is longitudinal: [-2,0] on the
 // back and radians after the join. Both sides have the same analytic du.
 const joinAngle=-125*Math.PI/180,backSpan=2;
 const tangent=r=>[-Math.sin(joinAngle)*r*rx,Math.cos(joinAngle)*r*ry];
 const backControls=r=>{
  const v=(r-102)/(264-102),j=map(-125,r),du=tangent(r);
  return [[1135-1110*v,727+10*v],[360-330*v,680-10*v],j.map((x,k)=>x-du[k]*backSpan/3),j];
 };
 let flow=(u,r)=>u>=0?map(-125+u*180/Math.PI,r):bez(...backControls(r),1+u/backSpan);
 const trajectory=(r,end)=>{
  const p=[];for(let i=0;i<=64;i++)p.push(flow(-backSpan+backSpan*i/64,r));
  const extent=(end+125)*Math.PI/180,n=Math.ceil(extent/.025);
  for(let i=1;i<=n;i++)p.push(flow(extent*i/n,r));return p;
 };
 // Every generated root owns one bay head in the same flow chart.
 // A single broad mouth branches into N unequal rounded lobes; ivory
 // tongues between them remain attached to the cap, never closed holes.
 const baySeam=[exposedEnd];
 const bayCartesian=(b,c,e)=>{const a=baySeam.at(-1);for(let i=1;i<=24;i++)baySeam.push(bez(a,b,c,e,i/24));};
 let bayChartPoint=[.2,135];
 bayCartesian(flow(-.1,120),flow(.05,130),flow(...bayChartPoint));
 const bayChartEdge=(b,c,e)=>{const a=bayChartPoint;for(let i=1;i<=32;i++)baySeam.push(flow(...bez(a,b,c,e,i/32)));bayChartPoint=e;};
 const headPlans=roots.map(r=>({root:r.id,u:(r.headAngle+125)*Math.PI/180,r:r.headRadius})).reverse();
 const spacing=(headPlans[0].u-headPlans.at(-1).u)/(roots.length-1),halfWidth=spacing*.31;
 const right=headPlans[0];
 bayChartEdge([.65,125],[right.u+.22,155],[right.u+halfWidth,right.r-15]);
 const bayHeadCharts=[],tongueCharts=[];
 for(let i=0;i<headPlans.length;i++){
  const h=headPlans[i];
  bayChartEdge([h.u+halfWidth,h.r+8],[h.u-halfWidth*.65,h.r+10],[h.u-halfWidth,h.r-12]);
  bayHeadCharts.push([h.u,h.r-2]);
  if(i+1<headPlans.length){
   const next=headPlans[i+1],mid=(h.u+next.u)/2,tongueR=185+random()*10;
   bayChartEdge([h.u-halfWidth*.9,h.r-32],[mid+.03,tongueR+3],[mid,tongueR]);
   tongueCharts.push([mid,tongueR+5]);
   bayChartEdge([mid-.03,tongueR+4],[next.u+halfWidth,next.r-28],[next.u+halfWidth,next.r-14]);
  }
 }
 const left=headPlans.at(-1);
 bayChartEdge([left.u-.25,left.r-12],[-.22,217],[-.6,210]);
 bayCartesian(flow(-.9,210),[160,610],[25,562]);
 cap.push(...baySeam.slice(1));
 // Compose the completed procedural construction, flow and all probes
 // with the SAME invertible profile chart before actual diagnostics/render.
 const nativeFlow=flow;
 const sampledFieldJacobianMin=Math.min(...body.map(profile.determinant),...cap.map(profile.determinant));
 const transformPolygon=p=>{for(let i=0;i<p.length;i++)p[i]=profile.apply(p[i]);};
 for(const polygon of [body,cap,frontGraph,outer,back,descent,graphTips,...covePaths])transformPolygon(polygon);
 flow=(u,r)=>profile.apply(nativeFlow(u,r));
 const openHollow=covePaths.map((path,j)=>{let waterHits=0,foamHits=0,samples=0,minBodyClearance=Infinity;for(let k=1;k<path.length;k++){const count=Math.max(2,Math.ceil(Math.hypot(...path[k].map((v,i)=>v-path[k-1][i]))/2));for(let i=0;i<=count;i++){const p=lerp(path[k-1],path[k],i/count);samples++;waterHits+=+inside(p,body);foamHits+=+inside(p,cap);minBodyClearance=Math.min(minBodyClearance,...body.map((a,index)=>pointSegmentDistance(p,a,body[(index+1)%body.length])));}}return{root:coveMouths[j].root,child:coveMouths[j].child,samples,waterHits,foamHits,minBodyClearance,route:'offset shared exterior to upper sky'};});
 // Diagnostic water paths follow the generated lobe centers and merge
 // below the tongue tips before traversing the common back-chart mouth.
 const bayRoutes=headPlans.map(h=>[[h.u,h.r-2],[h.u,200],[h.u-.05,175],[.3,165],[-.7,185],[-1.3,180]].map(p=>flow(...p)));
 const bayWaterContinuity=bayRoutes.map(path=>{let outsideBody=0,insideFoam=0,samples=0;for(let k=1;k<path.length;k++)for(let i=0;i<=64;i++){const p=lerp(path[k-1],path[k],i/64);samples++;outsideBody+=+!inside(p,body);insideFoam+=+inside(p,cap);}return{samples,outsideBody,insideFoam};});
 let tongueOutsideFoam=0;
 for(const [u,r]of tongueCharts)for(let i=0;i<=64;i++)tongueOutsideFoam+=+!inside(flow(u,r+(245-r)*i/64),cap);
 const union=[cap];
 const foamTopology={construction:'single shared exterior boundary graph',primaryRoots:roots.length,children:graphTips.length,finite:[...body,...cap].flat().every(Number.isFinite),openHollow,bodyFrontVertices:frontGraph.length,capFrontVertices:frontGraph.length,sharedFrontMaximumError:Math.max(...frontGraph.map((p,i)=>Math.hypot(...p.map((v,k)=>v-cap[back.length+outer.length-2+i][k])))),connectedByConstruction:true,nativeSkyRouteOffsetRange:[Math.min(...routeOffsets),Math.max(...routeOffsets)],bayWaterContinuity,tongueOutsideFoam,bayLobes:headPlans.length,bayHeadCharts,bayHeadPositions:bayHeadCharts.map(p=>flow(...p)),bayHeadInWater:bayHeadCharts.map(p=>inside(flow(...p),body)&&!inside(flow(...p),cap))};
 const specs=Array.from({length:8},(_,i)=>({radius:110+i*18.5,width:6+i%3*2,end:-20+i*1.8,color:i%3===0?pale:blue}));
 for(const {radius,width,end,color} of specs)bands.push({points:[...trajectory(radius,end),...trajectory(radius+width,end).reverse()],color});
 const strokes=Array.from({length:9},(_,i)=>trajectory(106+i*17,-18+i*.7));
 // Diagnostics use chart samples, not the rendered/clipped mask. Positive
 // determinant establishes local transverse order; pairwise segments test
 // global crossings separately. Join derivatives are measured analytically.
 let minJacobian=Infinity,maxJacobian=-Infinity,finite=true;
 const sampleRows=[];
 for(let i=0;i<=128;i++){
  const u=-2+i*4/128,row=[];
  for(let k=0;k<=64;k++){
   const r=102+k*162/64,p=flow(u,r);row.push(p);finite&&=p.every(Number.isFinite);
   if(i>0&&i<128&&k<64){const h=1e-5,a=flow(u-h,r),b=flow(u+h,r),c=flow(u,r+h);const du=b.map((v,j)=>(v-a[j])/(2*h)),dr=c.map((v,j)=>(v-p[j])/h);const det=du[0]*dr[1]-du[1]*dr[0];minJacobian=Math.min(minJacobian,det);maxJacobian=Math.max(maxJacobian,det);}
  }sampleRows.push(row);
 }
 let maxJoinPositionError=0,maxJoinDerivativeError=0;
 for(let r=102;r<=264;r+=2){const c=backControls(r),j=flow(0,r),du=profile.push(c[3],tangent(r)),leftDu=profile.push(c[3],c[3].map((v,k)=>3*(v-c[2][k])/backSpan));maxJoinPositionError=Math.max(maxJoinPositionError,Math.hypot(...profile.apply(c[3]).map((v,k)=>v-j[k])));maxJoinDerivativeError=Math.max(maxJoinDerivativeError,Math.hypot(...leftDu.map((v,k)=>v-du[k]))); }
 const orient=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 const intersects=(a,b,c,e)=>orient(a,b,c)*orient(a,b,e)<-1e-8&&orient(c,e,a)*orient(c,e,b)<-1e-8;
 for(let j=0;j<covePaths.length;j++){
  let boundaryCrossings=0,minSegmentClearance=foamTopology.openHollow[j].minBodyClearance;
  const path=covePaths[j];for(let k=1;k<path.length;k++)for(let i=0;i<body.length;i++){
   if(intersects(path[k-1],path[k],body[i],body[(i+1)%body.length]))boundaryCrossings++;
   minSegmentClearance=Math.min(minSegmentClearance,pointSegmentDistance(body[i],path[k-1],path[k]));
  }
  Object.assign(foamTopology.openHollow[j],{boundaryCrossings,minSegmentClearance});
 }
 let foamBoundaryCrossings=0;
 for(const p of [body,...union])for(let i=0;i<p.length;i++)for(let j=i+2;j<p.length;j++)if(!(i===0&&j===p.length-1)&&intersects(p[i],p[(i+1)%p.length],p[j],p[(j+1)%p.length]))foamBoundaryCrossings++;
 foamTopology.bodyAndCapBoundaryCrossings=foamBoundaryCrossings;
 const orderedTrajectories=specs.flatMap(({radius,width})=>[trajectory(radius,-3),trajectory(radius+width,-3)]);
 let transverseCrossings=0;
 for(let i=0;i<orderedTrajectories.length;i++)for(let j=i+1;j<orderedTrajectories.length;j++){
  const a=orderedTrajectories[i],b=orderedTrajectories[j];for(let k=1;k<a.length;k++)for(let m=1;m<b.length;m++)if(intersects(a[k-1],a[k],b[m-1],b[m]))transverseCrossings++;
 }
 const continuity={chart:'paired back/annular C1',joinAngle:-125,backSpan,bandCount:bands.length,finite,minJacobian,maxJacobian,maxJoinPositionError,maxJoinDerivativeError,transverseCrossings,orderSamples:129*65};
 const patch={center:profile.apply([cx,cy]),outer,inner:arc(-125,-16,102).map(profile.apply),longitudinalRange:[-125,-1],foamTips:graphTips};
 const topology={crests:1,roots:roots.length,children:roots.map(r=>r.children),tips:graphTips.length,bayLobes:headPlans.length,relationships:roots.flatMap(r=>Array.from({length:r.children},(_,j)=>[r.id,j]))};
 const allPoints=[...body,...cap,...bands.flatMap(b=>b.points),...strokes.flat()];
 const bounds={minX:Math.min(...allPoints.map(p=>p[0])),maxX:Math.max(...allPoints.map(p=>p[0])),minY:Math.min(...allPoints.map(p=>p[1])),maxY:Math.max(...allPoints.map(p=>p[1]))};
 const profileDiagnostics={parameters:profile.parameters,jacobianLowerBound:profile.jacobianLowerBound,sampledFieldJacobianMin,bounds,landmarks:{crown:body.reduce((a,b)=>a[1]<b[1]?a:b),backShoulder:back[20],hollowStart:frontGraph.at(-1),downflow:descent[20]}};
 const foamNodes=nativeFoamNodes.map(node=>{
  const center=profile.apply(node.center),t=profile.push(node.center,node.tangent),n=profile.push(node.center,node.normal),unit=v=>v.map(x=>x/Math.hypot(...v));
  const widthEnds=[-.5,.5].map(sign=>profile.apply(node.center.map((v,k)=>v+node.normal[k]*node.width*sign)));
  return{id:node.id,parentId:node.parentId,kind:node.kind,center,width:Math.hypot(...widthEnds[1].map((v,k)=>v-widthEnds[0][k])),frame:{tangent:unit(t),normal:unit(n)},insideFoam:inside(center,cap)};
 });
 // W056: the crease follows the medial path paired from the actual
 // outer and return sides of ONE generated child hook. Clearance only
 // trims its terminal contact and limits ink width; anatomy is not scaled.
 const foamSpines=nativeFoamSpines.map(spine=>({...spine,origin:profile.apply(spine.origin),throat:profile.apply(spine.throat),bend:profile.apply(spine.bend),turn:profile.apply(spine.turn),points:spine.points.map(profile.apply)}));
 const inkSeams=[],seamQualifications=[];
 const segmentGap=(a,b,c,e)=>intersects(a,b,c,e)?0:Math.min(pointSegmentDistance(a,c,e),pointSegmentDistance(b,c,e),pointSegmentDistance(c,a,b),pointSegmentDistance(e,a,b));
 const candidates=foamSpines.map(spine=>{
  const node=foamNodes.find(n=>n.id===spine.ownerId),strokeWidth=Math.min(1.5,node.width*.18),margin=strokeWidth*1.5;
  const points=[];
  for(const p of spine.points){const clearance=Math.min(...cap.map((a,i)=>pointSegmentDistance(p,a,cap[(i+1)%cap.length])));if(!inside(p,cap)||clearance<margin)break;points.push(p);}
  const length=points.slice(1).reduce((total,p,i)=>total+Math.hypot(...p.map((v,k)=>v-points[i][k])),0);
  return{spine,node,points,length,strokeWidth};
 }).sort((a,b)=>b.length-a.length||a.spine.ownerId.localeCompare(b.spine.ownerId));
 for(const {spine,node,points,length,strokeWidth}of candidates){
  const record={ownerId:spine.ownerId,parentId:spine.parentId,accepted:false,reasons:[],retainedStations:points.length,totalStations:spine.points.length,anatomicalLength:length,strokeWidth};seamQualifications.push(record);
  if(points.length<20)record.reasons.push('insufficient inset anatomical prefix');
  if(length<12)record.reasons.push('anatomical prefix shorter than readable length');
  if(strokeWidth<.8)record.reasons.push('local width cannot support readable ink');
  if(record.reasons.length)continue;
  let boundaryCrossings=0,minCenterlineClearance=Infinity;
  for(let k=1;k<points.length;k++)for(let i=0;i<cap.length;i++){
   if(intersects(points[k-1],points[k],cap[i],cap[(i+1)%cap.length]))boundaryCrossings++;
   minCenterlineClearance=Math.min(minCenterlineClearance,pointSegmentDistance(points[k],cap[i],cap[(i+1)%cap.length]),pointSegmentDistance(cap[i],points[k-1],points[k]));
  }
  const minInkEdgeClearance=minCenterlineClearance-strokeWidth/2;
  let selfCrossings=0;for(let i=1;i<points.length;i++)for(let j=i+2;j<points.length;j++)if(intersects(points[i-1],points[i],points[j-1],points[j]))selfCrossings++;
  const openEndpointDistance=Math.hypot(...points[0].map((v,k)=>v-points.at(-1)[k]));
  Object.assign(record,{boundaryCrossings,minInkEdgeClearance,selfCrossings,openEndpointDistance});
  if(boundaryCrossings)record.reasons.push('crosses cap boundary');
  if(minInkEdgeClearance<strokeWidth)record.reasons.push('ink edge lacks cap margin');
  if(selfCrossings)record.reasons.push('anatomical prefix crosses itself');
  if(openEndpointDistance<=strokeWidth*2)record.reasons.push('endpoints too close for open crease');
  const pairGaps=[];
  for(const accepted of inkSeams){let centerlineGap=Infinity;for(let i=1;i<points.length;i++)for(let j=1;j<accepted.points.length;j++)centerlineGap=Math.min(centerlineGap,segmentGap(points[i-1],points[i],accepted.points[j-1],accepted.points[j]));
   const inkEdgeGap=centerlineGap-(strokeWidth+accepted.strokeWidth)/2;pairGaps.push({accepted,inkEdgeGap});if(inkEdgeGap<Math.max(strokeWidth,accepted.strokeWidth)){record.reasons.push('conflicts with another anatomical crease');record.conflict={ownerId:accepted.ownerId,inkEdgeGap,requiredGap:Math.max(strokeWidth,accepted.strokeWidth)};}
  }
  if(record.reasons.length)continue;
  record.accepted=true;
  record.minOtherInkEdgeGap=pairGaps.length?Math.min(...pairGaps.map(p=>p.inkEdgeGap)):null;
  for(const {accepted,inkEdgeGap}of pairGaps)accepted.metrics.minOtherInkEdgeGap=accepted.metrics.minOtherInkEdgeGap===null?inkEdgeGap:Math.min(accepted.metrics.minOtherInkEdgeGap,inkEdgeGap);
  const minX=Math.min(...points.map(p=>p[0])),maxX=Math.max(...points.map(p=>p[0])),minY=Math.min(...points.map(p=>p[1])),maxY=Math.max(...points.map(p=>p[1]));
  inkSeams.push({ownerId:spine.ownerId,parentId:spine.parentId,points,strokeWidth,metrics:{anatomicalLength:length,retainedStations:points.length,totalStations:spine.points.length,localWidth:node.width,minCenterlineClearance,minInkEdgeClearance:minCenterlineClearance-strokeWidth/2,boundaryCrossings,selfCrossings,openEndpointDistance,minOtherInkEdgeGap:record.minOtherInkEdgeGap,insideFoam:true,construction:'paired actual child sides; no path scaling'},context:{origin:spine.origin,throat:spine.throat,bend:spine.bend,turn:spine.turn,frame:node.frame,viewBox:[minX-15,minY-15,maxX-minX+30,maxY-minY+30]}});
 }
 const wave={seed,profile:profileDiagnostics,foamNodes,foamSpines,inkSeams,seamQualifications,seamControl:{rule:'all readable actual child spines, conflict qualified',accepted:inkSeams.length,rejected:seamQualifications.filter(r=>!r.accepted).length},body,cap,frontGraph,foamBranches,foamTopology,bands,strokes,patch,continuity,topology,descriptor:{family:'rolled-front-grammar',...topology,principalHollow:profile.apply([cx,cy])}};
 wave.baseFingerprint=geometryFingerprint(wave,false);wave.fingerprint=geometryFingerprint(wave);wave.nativeChildAnatomy=childAnatomy;return wave;
}
export function waveSvg(w){return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="Rolled front wave study"><defs><clipPath id="water-${w.seed}"><path d="${d(w.body)}"/></clipPath></defs><rect width="1200" height="800" fill="#e6dcc1"/><path d="M780 125 Q800 100 825 120 Q842 80 870 115 Q925 95 955 132 Q1005 122 1020 145 L775 150Z" fill="#efead6"/><path d="${d(w.body)}" fill="${ink}" stroke="${ink}" stroke-width="2.5"/><g clip-path="url(#water-${w.seed})">${w.bands.map(b=>`<path d="${d(b.points)}" fill="${b.color}"/>`).join('')}${w.strokes.map(p=>`<path d="M${p.map(pt).join(' L')}" fill="none" stroke="#1c3c52" stroke-width="1.1"/>`).join('')}</g><g fill="none" stroke="${ink}" stroke-width="2.1" stroke-linejoin="round">${[w.cap,...w.foamBranches.map(b=>b.points)].map(p=>`<path d="${d(p)}"/>`).join('')}</g><g fill="${foam}">${[w.cap,...w.foamBranches.map(b=>b.points)].map(p=>`<path d="${d(p)}"/>`).join('')}</g>${(w.inkSeams||[]).map(s=>`<path d="M${s.points.map(pt).join(' L')}" fill="none" stroke="${ink}" stroke-width="${s.strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}</svg>`;}

// Fingerprints include only actual normalized geometry. IDs, seeds,
// descriptors, diagnostic probes and reference data cannot distinguish it.
// Structural ink contributes actual points/width, never owner IDs or metrics.
export function normalizedGeometry(w){
 const points=[...w.body,...w.cap,...w.bands.flatMap(b=>b.points),...w.strokes.flat()];
 const minX=Math.min(...points.map(p=>p[0])),minY=Math.min(...points.map(p=>p[1]));
 const span=Math.max(Math.max(...points.map(p=>p[0]))-minX,Math.max(...points.map(p=>p[1]))-minY);
 const normalize=p=>p.map(([x,y])=>[Number(((x-minX)/span).toFixed(7)),Number(((y-minY)/span).toFixed(7))]);
 return{body:normalize(w.body),cap:normalize(w.cap),bands:w.bands.map(b=>normalize(b.points)),strokes:w.strokes.map(normalize),inkSeams:(w.inkSeams||[]).map(s=>({points:normalize(s.points),strokeWidth:Number((s.strokeWidth/span).toFixed(7))}))};
}
export function geometryFingerprint(w,includeInk=true){
 const geometry=normalizedGeometry(w);if(!includeInk)delete geometry.inkSeams;
 let hash=14695981039346656037n;for(const char of JSON.stringify(geometry)){hash^=BigInt(char.charCodeAt(0));hash=BigInt.asUintN(64,hash*1099511628211n);}return hash.toString(16).padStart(16,'0');
}
