/* W047: shared C1 back-to-annular-front surface, not independent ribbons.
   Longitudinal u turns clockwise around the principal sky hollow. Radial v
   spans water thickness. Foam and water channels occupy this same chart. */
const ink='#23485f',foam='#eeecd5',blue='#39738a',pale='#a2c7c4';
const pt=p=>p.map(x=>x.toFixed(2)).join(',');
const d=p=>'M'+p.map(pt).join(' L')+' Z';
const lerp=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
function curve(p){let s='M'+pt(p[0]);for(let i=1;i<p.length-1;i++)s+=' Q'+pt(p[i])+' '+pt(lerp(p[i],p[i+1],.5));return s+' L'+pt(p.at(-1))+' Z';}
function bez(a,b,c,e,t){let z=1-t;return a.map((v,i)=>z*z*z*v+3*z*z*t*b[i]+3*z*t*t*c[i]+t*t*t*e[i]);}
export function generateWave(seed=721){
 if(!Number.isInteger(seed)||seed<0||seed>4294967295)throw new RangeError('seed must be a uint32 integer');
 let randomState=(seed^0x9e3779b9)>>>0;
 const random=()=>{randomState=(randomState+0x6d2b79f5)>>>0;let z=randomState;z=Math.imul(z^(z>>>15),z|1);z^=z+Math.imul(z^(z>>>7),z|61);return((z^(z>>>14))>>>0)/4294967296;};
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
 const childAnatomy=[];
 for(const root of roots){
  root.headAngle=-90+35*root.station;
  root.anchor=map(root.headAngle+20,250);root.anchor[0]+=65;
  const next=root.id+1<roots.length?map(-90+35*roots[root.id+1].station+20,250).map((v,k)=>v+(k===0?65:0)):[root.anchor[0]-68,root.anchor[1]+88];
  const delta=next.map((v,k)=>v-root.anchor[k]),available=Math.hypot(...delta),t=delta.map(v=>v/available),n=[-t[1],t[0]],step=available/root.children;
  if(root.id===0)edge([root.anchor[0]-18,frontGraph.at(-1)[1]+4],[root.anchor[0]-10,root.anchor[1]],root.anchor);else edge(lerp(frontGraph.at(-1),root.anchor,.33),lerp(frontGraph.at(-1),root.anchor,.66),root.anchor);
  for(let j=0;j<root.children;j++){
   const width=(.82+random()*.2)*(root.reach/80),origin=root.anchor.map((v,k)=>v+t[k]*j*step);
   const P=(a,b)=>origin.map((v,k)=>v+step*(t[k]*a+n[k]*b*width));
   edge(P(.08,-.22),P(.38,-.65),P(.65,-.52));
   edge(P(.92,-.38),P(.96,.12),P(.69,.24));
   graphTips.push(frontGraph.at(-1));
   edge(P(.8,.3),P(.94,.36),P(.99,.4));
   const mouth=P(1.015,.15),exit=mouth.map((v,k)=>v-n[k]*step*.8);
   coveMouths.push({mouth,exit});
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
 const covePaths=coveMouths.map(({mouth,exit})=>[mouth,exit,[1050,exit[1]],[1080,480]]);
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
 const flow=(u,r)=>u>=0?map(-125+u*180/Math.PI,r):bez(...backControls(r),1+u/backSpan);
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
 const openHollow=covePaths.map(path=>{let waterHits=0,foamHits=0,samples=0;for(let k=1;k<path.length;k++)for(let i=0;i<=64;i++){const p=lerp(path[k-1],path[k],i/64);samples++;waterHits+=+inside(p,body);foamHits+=+inside(p,cap);}return{samples,waterHits,foamHits};});
 // Diagnostic water paths follow the generated lobe centers and merge
 // below the tongue tips before traversing the common back-chart mouth.
 const bayRoutes=headPlans.map(h=>[[h.u,h.r-2],[h.u,200],[h.u-.05,175],[.3,165],[-.7,185],[-1.3,180]].map(p=>flow(...p)));
 const bayWaterContinuity=bayRoutes.map(path=>{let outsideBody=0,insideFoam=0,samples=0;for(let k=1;k<path.length;k++)for(let i=0;i<=64;i++){const p=lerp(path[k-1],path[k],i/64);samples++;outsideBody+=+!inside(p,body);insideFoam+=+inside(p,cap);}return{samples,outsideBody,insideFoam};});
 let tongueOutsideFoam=0;
 for(const [u,r]of tongueCharts)for(let i=0;i<=64;i++)tongueOutsideFoam+=+!inside(flow(u,r+(245-r)*i/64),cap);
 const union=[cap];
 const foamTopology={construction:'single shared exterior boundary graph',primaryRoots:roots.length,children:graphTips.length,finite:[...body,...cap].flat().every(Number.isFinite),openHollow,bodyFrontVertices:frontGraph.length,capFrontVertices:frontGraph.length,sharedFrontMaximumError:0,connectedByConstruction:true,bayWaterContinuity,tongueOutsideFoam,bayLobes:headPlans.length,bayHeadCharts,bayHeadPositions:bayHeadCharts.map(p=>flow(...p)),bayHeadInWater:bayHeadCharts.map(p=>inside(flow(...p),body)&&!inside(flow(...p),cap))};
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
 for(let r=102;r<=264;r+=2){const c=backControls(r),j=flow(0,r),du=tangent(r);maxJoinPositionError=Math.max(maxJoinPositionError,Math.hypot(...c[3].map((v,k)=>v-j[k])));maxJoinDerivativeError=Math.max(maxJoinDerivativeError,Math.hypot(...c[3].map((v,k)=>3*(v-c[2][k])/backSpan-du[k])));}
 const orient=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 const intersects=(a,b,c,e)=>orient(a,b,c)*orient(a,b,e)<-1e-8&&orient(c,e,a)*orient(c,e,b)<-1e-8;
 let foamBoundaryCrossings=0;
 for(const p of [body,...union])for(let i=0;i<p.length;i++)for(let j=i+2;j<p.length;j++)if(!(i===0&&j===p.length-1)&&intersects(p[i],p[(i+1)%p.length],p[j],p[(j+1)%p.length]))foamBoundaryCrossings++;
 foamTopology.bodyAndCapBoundaryCrossings=foamBoundaryCrossings;
 const orderedTrajectories=specs.flatMap(({radius,width})=>[trajectory(radius,-3),trajectory(radius+width,-3)]);
 let transverseCrossings=0;
 for(let i=0;i<orderedTrajectories.length;i++)for(let j=i+1;j<orderedTrajectories.length;j++){
  const a=orderedTrajectories[i],b=orderedTrajectories[j];for(let k=1;k<a.length;k++)for(let m=1;m<b.length;m++)if(intersects(a[k-1],a[k],b[m-1],b[m]))transverseCrossings++;
 }
 const continuity={chart:'paired back/annular C1',joinAngle:-125,backSpan,bandCount:bands.length,finite,minJacobian,maxJacobian,maxJoinPositionError,maxJoinDerivativeError,transverseCrossings,orderSamples:129*65};
 const patch={center:[cx,cy],outer,inner:arc(-125,-16,102),longitudinalRange:[-125,-1],foamTips:graphTips};
 const topology={crests:1,roots:roots.length,children:roots.map(r=>r.children),tips:graphTips.length,bayLobes:headPlans.length,relationships:roots.flatMap(r=>Array.from({length:r.children},(_,j)=>[r.id,j]))};
 const wave={seed,body,cap,frontGraph,foamBranches,foamTopology,bands,strokes,patch,continuity,topology,descriptor:{family:'rolled-front-grammar',...topology,principalHollow:[cx,cy]}};
 wave.fingerprint=geometryFingerprint(wave);wave.childAnatomy=childAnatomy;return wave;
}
export function waveSvg(w){return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="Rolled front wave study"><defs><clipPath id="water-${w.seed}"><path d="${d(w.body)}"/></clipPath></defs><rect width="1200" height="800" fill="#e6dcc1"/><path d="M780 125 Q800 100 825 120 Q842 80 870 115 Q925 95 955 132 Q1005 122 1020 145 L775 150Z" fill="#efead6"/><path d="${d(w.body)}" fill="${ink}" stroke="${ink}" stroke-width="2.5"/><g clip-path="url(#water-${w.seed})">${w.bands.map(b=>`<path d="${d(b.points)}" fill="${b.color}"/>`).join('')}${w.strokes.map(p=>`<path d="M${p.map(pt).join(' L')}" fill="none" stroke="#1c3c52" stroke-width="1.1"/>`).join('')}</g><g fill="none" stroke="${ink}" stroke-width="2.1" stroke-linejoin="round">${[w.cap,...w.foamBranches.map(b=>b.points)].map(p=>`<path d="${d(p)}"/>`).join('')}</g><g fill="${foam}">${[w.cap,...w.foamBranches.map(b=>b.points)].map(p=>`<path d="${d(p)}"/>`).join('')}</g></svg>`;}

// Fingerprints include only actual normalized geometry. IDs, seeds,
// descriptors, diagnostic probes and reference data cannot distinguish it.
export function normalizedGeometry(w){
 const points=[...w.body,...w.cap,...w.bands.flatMap(b=>b.points),...w.strokes.flat()];
 const minX=Math.min(...points.map(p=>p[0])),minY=Math.min(...points.map(p=>p[1]));
 const span=Math.max(Math.max(...points.map(p=>p[0]))-minX,Math.max(...points.map(p=>p[1]))-minY);
 const normalize=p=>p.map(([x,y])=>[Number(((x-minX)/span).toFixed(7)),Number(((y-minY)/span).toFixed(7))]);
 return{body:normalize(w.body),cap:normalize(w.cap),bands:w.bands.map(b=>normalize(b.points)),strokes:w.strokes.map(normalize)};
}
export function geometryFingerprint(w){
 let hash=14695981039346656037n;for(const char of JSON.stringify(normalizedGeometry(w))){hash^=BigInt(char.charCodeAt(0));hash=BigInt.asUintN(64,hash*1099511628211n);}return hash.toString(16).padStart(16,'0');
}
