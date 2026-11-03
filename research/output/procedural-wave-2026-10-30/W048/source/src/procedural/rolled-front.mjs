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
 const phase=((seed*2654435761)>>>0)/4294967296;
 const cx=540+phase*12,cy=407,rx=1.04,ry=.95;
 const map=(degrees,radius)=>{const a=degrees*Math.PI/180;return[cx+Math.cos(a)*radius*rx,cy+Math.sin(a)*radius*ry];};
 const arc=(from,to,radius,step=2)=>{let a=[];const n=Math.ceil(Math.abs(to-from)/step);for(let i=0;i<=n;i++)a.push(map(from+(to-from)*i/n,radius));return a;};
 const outer=arc(-125,-9,264),innerLip=map(-16,102);
 const back=[];for(let t=0;t<=1;t+=.025)back.push(bez([25,535],[150,535],[240,140],outer[0],t));
 const descent=[];for(let t=0;t<=1;t+=.025)descent.push(bez(innerLip,[370,310],[360,680],[1135,727],t));
 const body=[...back,...outer,map(-2,249),map(-1,231),map(-12,223),...arc(-12,-24,190),innerLip,...descent,[1140,760],[0,760]];
 // W048: a connected cap/root/child union. Two unequal primary groups
 // overlap the cap positively; every hooked child overlaps its own parent.
 // The two deep coves belong to the outside boundary, open to the hollow.
 const cap=[...back,...outer];
 const append=(a,b,c,e)=>{for(let i=1;i<=24;i++)cap.push(bez(a,b,c,e,i/24));};
 append(outer.at(-1),map(1,270),map(3,238),map(-14,225));
 cap.push(...arc(-14,-42,225));
 append(map(-42,225),map(-47,227),map(-47,249),map(-54,249));
 append(map(-54,249),map(-61,249),map(-61,226),map(-68,225));
 cap.push(...arc(-68,-98,225));
 append(map(-98,225),map(-103,226),map(-103,248),map(-110,248));
 append(map(-110,248),map(-116,248),map(-117,187),map(-125,160));
 const seamStart=map(-125,160);for(let i=1;i<=40;i++)cap.push(bez(seamStart,[315,360],[160,610],[25,562],i/40));
 const tube=(id,parent,polar,widths)=>{
  const controls=polar.map(p=>map(...p)),left=[],right=[],center=[];
  for(let i=0;i<=48;i++){
   const t=i/48,p=bez(...controls,t),a=bez(...controls,Math.max(0,t-1e-4)),b=bez(...controls,Math.min(1,t+1e-4)),len=Math.hypot(b[0]-a[0],b[1]-a[1]),w=widths[0]+(widths[1]-widths[0])*t,n=[-(b[1]-a[1])/len,(b[0]-a[0])/len];
   center.push(p);left.push(p.map((v,k)=>v+n[k]*w));right.push(p.map((v,k)=>v-n[k]*w));
  }
  return{id,parent,points:[...left,...right.reverse()],root:center[0],tip:center.at(-1),width:widths[0]*2};
 };
 const foamBranches=[
  tube('primary-a','cap',[[-30,247],[-28,226],[-30,205],[-32,180]],[25,18]),
  tube('primary-b','cap',[[-86,246],[-89,224],[-86,201],[-86,179]],[21,15]),
  tube('a-long','primary-a',[[-26,198],[-8,185],[-4,150],[-16,127]],[15,1.6]),
  tube('a-short','primary-a',[[-34,195],[-45,169],[-48,150],[-39,137]],[12,1.4]),
  tube('b-long','primary-b',[[-84,195],[-66,181],[-64,145],[-77,131]],[12,1.5]),
  tube('b-short','primary-b',[[-90,195],[-104,184],[-113,164],[-104,153]],[10,1.2])
 ];
 const inside=(p,poly)=>{let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;};
 const distance=(p,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],v=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p[0]-a[0]-v*dx,p[1]-a[1]-v*dy);};
 const connections=foamBranches.map(branch=>{const parent=branch.parent==='cap'?{points:cap,width:Infinity}:foamBranches.find(x=>x.id===branch.parent);return{id:branch.id,parent:branch.parent,rootInsideParent:inside(branch.root,parent.points),rootClearance:Math.min(...parent.points.map((p,i)=>distance(branch.root,p,parent.points[(i+1)%parent.points.length]))),childWidthRatio:branch.width/parent.width};});
 const union=[cap,...foamBranches.map(b=>b.points)];
 const coveRays=[-54,-110].map(angle=>{let blocked=0;for(let r=104;r<=244;r+=2)if(union.some(p=>inside(map(angle,r),p)))blocked++;return{angle,radialSamples:71,blocked};});
 const foamTopology={construction:'one positively connected polygon union',primaryRoots:2,children:4,connections,coves:coveRays,finite:union.flat(2).every(Number.isFinite)};
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
 for(const p of union)for(let i=0;i<p.length;i++)for(let j=i+2;j<p.length;j++)if(!(i===0&&j===p.length-1)&&intersects(p[i],p[(i+1)%p.length],p[j],p[(j+1)%p.length]))foamBoundaryCrossings++;
 foamTopology.individualBoundaryCrossings=foamBoundaryCrossings;
 const orderedTrajectories=specs.flatMap(({radius,width})=>[trajectory(radius,-3),trajectory(radius+width,-3)]);
 let transverseCrossings=0;
 for(let i=0;i<orderedTrajectories.length;i++)for(let j=i+1;j<orderedTrajectories.length;j++){
  const a=orderedTrajectories[i],b=orderedTrajectories[j];for(let k=1;k<a.length;k++)for(let m=1;m<b.length;m++)if(intersects(a[k-1],a[k],b[m-1],b[m]))transverseCrossings++;
 }
 const continuity={chart:'paired back/annular C1',joinAngle:-125,backSpan,bandCount:bands.length,finite,minJacobian,maxJacobian,maxJoinPositionError,maxJoinDerivativeError,transverseCrossings,orderSamples:129*65};
 const patch={center:[cx,cy],outer,inner:arc(-125,-16,102),longitudinalRange:[-125,-1],foamTips:foamBranches.filter(b=>b.parent!=='cap').map(b=>b.tip)};
 return{seed,body,cap,foamBranches,foamTopology,bands,strokes,patch,continuity,descriptor:{family:'rolled-front-patch',crests:1,roots:2,tips:4,principalHollow:[cx,cy]}};
}
export function waveSvg(w){return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="Rolled front wave study"><defs><clipPath id="water-${w.seed}"><path d="${curve(w.body)}"/></clipPath></defs><rect width="1200" height="800" fill="#e6dcc1"/><path d="M780 125 Q800 100 825 120 Q842 80 870 115 Q925 95 955 132 Q1005 122 1020 145 L775 150Z" fill="#efead6"/><path d="${curve(w.body)}" fill="${ink}" stroke="${ink}" stroke-width="2.5"/><g clip-path="url(#water-${w.seed})">${w.bands.map(b=>`<path d="${d(b.points)}" fill="${b.color}"/>`).join('')}${w.strokes.map(p=>`<path d="M${p.map(pt).join(' L')}" fill="none" stroke="#1c3c52" stroke-width="1.1"/>`).join('')}</g><g fill="none" stroke="${ink}" stroke-width="2.1" stroke-linejoin="round">${[w.cap,...w.foamBranches.map(b=>b.points)].map(p=>`<path d="${d(p)}"/>`).join('')}</g><g fill="${foam}">${[w.cap,...w.foamBranches.map(b=>b.points)].map(p=>`<path d="${d(p)}"/>`).join('')}</g></svg>`;}
