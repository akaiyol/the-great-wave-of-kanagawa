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
 // ONE cap boundary walks three unequal attached prongs. The blue gaps are
 // open to the hollow/front, never enclosed slots or separately pasted marks.
 const cap=[...back,...outer,map(-2,252),map(-1,241),map(-5,232),map(-12,224),...arc(-15,-94,224),map(-100,213),
 ...arc(-96,-35,204),map(-27,200),map(-24,188),map(-30,181),map(-40,174),...arc(-40,-107,174),map(-113,164),
 ...arc(-108,-66,151),map(-57,146),map(-53,135),map(-60,126),map(-73,119),...arc(-73,-125,119)];
 const seamStart=map(-125,119);for(let t=0;t<=1;t+=.025)cap.push(bez(seamStart,[315,360],[160,610],[25,562],t));
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
 const orderedTrajectories=specs.flatMap(({radius,width})=>[trajectory(radius,-3),trajectory(radius+width,-3)]);
 let transverseCrossings=0;
 for(let i=0;i<orderedTrajectories.length;i++)for(let j=i+1;j<orderedTrajectories.length;j++){
  const a=orderedTrajectories[i],b=orderedTrajectories[j];for(let k=1;k<a.length;k++)for(let m=1;m<b.length;m++)if(intersects(a[k-1],a[k],b[m-1],b[m]))transverseCrossings++;
 }
 const continuity={chart:'paired back/annular C1',joinAngle:-125,backSpan,bandCount:bands.length,finite,minJacobian,maxJacobian,maxJoinPositionError,maxJoinDerivativeError,transverseCrossings,orderSamples:129*65};
 const patch={center:[cx,cy],outer,inner:arc(-125,-16,102),longitudinalRange:[-125,-1],foamTips:[map(-2,252),map(-27,200),map(-57,146)]};
 return{seed,body,cap,bands,strokes,patch,continuity,descriptor:{family:'rolled-front-patch',crests:1,roots:3,tips:3,principalHollow:[cx,cy]}};
}
export function waveSvg(w){return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="Rolled front wave study"><defs><clipPath id="water-${w.seed}"><path d="${curve(w.body)}"/></clipPath></defs><rect width="1200" height="800" fill="#e6dcc1"/><path d="M780 125 Q800 100 825 120 Q842 80 870 115 Q925 95 955 132 Q1005 122 1020 145 L775 150Z" fill="#efead6"/><path d="${curve(w.body)}" fill="${ink}" stroke="${ink}" stroke-width="2.5"/><g clip-path="url(#water-${w.seed})">${w.bands.map(b=>`<path d="${d(b.points)}" fill="${b.color}"/>`).join('')}${w.strokes.map(p=>`<path d="M${p.map(pt).join(' L')}" fill="none" stroke="#1c3c52" stroke-width="1.1"/>`).join('')}</g><path d="${curve(w.cap)}" fill="${foam}" stroke="${ink}" stroke-width="2.1" stroke-linejoin="round"/></svg>`;}
