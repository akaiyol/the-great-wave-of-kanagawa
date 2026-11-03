/* ADR-002 first slice. Geometry is generated before SVG output; no DOM or assets.
   Source relationship: back rises left of the crown; crown overhangs hollow;
   ivory branches share the exterior boundary, indigo channels open into water.
   This is a partial construction family, not a source reconstruction. */
const ink = '#23485f', blue = '#39738a', pale = '#a2c7c4', foam = '#eeecd5';
const lerp = (a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
const add=(a,b)=>[a[0]+b[0],a[1]+b[1]];
const mul=(a,k)=>[a[0]*k,a[1]*k];
const pt=p=>p.map(v=>v.toFixed(2)).join(',');
function rng(seed){let n=seed>>>0;return()=>{n+=0x6D2B79F5;let t=Math.imul(n^n>>>15,1|n);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296;};}
function bez(a,b,c,d,t){let z=1-t;return [0,1].map(i=>z*z*z*a[i]+3*z*z*t*b[i]+3*z*t*t*c[i]+t*t*t*d[i]);}
function path(points,close=true){return `M${points.map(pt).join(' L')}${close?' Z':''}`;}
function smooth(points,close=true){if(points.length<3)return path(points,close);let out=`M${pt(points[0])}`;for(let i=1;i<points.length-1;i++)out+=` Q${pt(points[i])} ${pt(lerp(points[i],points[i+1],.5))}`;out+=` L${pt(points.at(-1))}`;return out+(close?' Z':'');}
// A monotone boundary walk in each root's tangent frame prevents child-order
// crossings. Fork lobes are inserted into this same contour, with thick bases.
function finger(origin,tangent,length,width,depth,r,counts){
 const normal=[tangent[1],-tangent[0]];
 const local=(x,y)=>add(origin,add(mul(tangent,x),mul(normal,y)));
 const points=[[-width,0],[-width*.95,length*.31],[-width*.80,length*.72]];
 if(depth){
  counts.forks++;counts.tips+=2;
  points.push([-width*.58,length],[-width*.23,length*.97],[-width*.09,length*.76],[width*.02,length*.54],[width*.18,length*.77],[width*.49,length*.85],[width*.77,length*.68],[width*.88,length*.42]);
 }else{
  counts.tips++;
  points.push([-width*.48,length],[width*.08,length*1.02],[width*.57,length*.81],[width*.83,length*.49]);
 }
 points.push([width*.56,length*.59],[width*.30,length*.65],[width*.15,length*.45],[width*.55,length*.21],[width,0]);
 return points.map(([x,y])=>local(x,y));
}
export function generateWave(seed=721){
 const r=rng(seed), crownX=430+r()*70,crownY=135+r()*28,lipX=680+r()*55,lipY=280+r()*35;
 const a=[25,535],b=[200,520],c=[240,110],d=[crownX,crownY];
 const e=[crownX+120,crownY-12],f=[lipX-35,lipY-70],g=[lipX,lipY];
 const crest=s=>s<.57?bez(a,b,c,d,s/.57):bez(d,e,f,g,(s-.57)/.43);
 // Every surface trajectory terminates at its own crest coordinate. The hollow
 // is formed by the rightmost trajectory's strong leftward intermediate bend.
 const surface=(s,t)=>{const top=crest(s),base=[35+s*1100,725+16*Math.sin(s*5)];return bez(base,[base[0]-150-230*s,680],[top[0]-115*s,top[1]+190+140*s],top,t);};
 const roots=5+Math.floor(r()*3), counts={tips:0,forks:0}, outer=[],rootGroups=[];
 // Smooth broad back. Branch growth begins only on the crown/front arc.
 let next=0;
 for(let j=0;j<roots;j++){
  const s=.60+j*(.38/roots)+(r()-.5)*.012, half=.016+r()*.007;
  for(let u=next;u<s-half;u+=.006)outer.push(crest(u));
  const root=crest(s), before=crest(s-.005),after=crest(s+.005),dx=after[0]-before[0],dy=after[1]-before[1],len=Math.hypot(dx,dy);
  const tangent=[dx/len,dy/len], width=len*half/.01;
  const fork=r()<.65?1:0,length=22+r()*35;
  const branch=finger(root,tangent,length,width,fork,r,counts);
  rootGroups.push({s,half,length,width,fork,points:branch});outer.push(...branch);next=s+half;
 }
 for(let u=next;u<=1;u+=.006)outer.push(crest(Math.min(1,u)));outer.push(g);
 const hollow=[];for(let t=.98;t>=0;t-=.018)hollow.push(surface(1,t));
 const body=[...outer,...hollow,[1135,760],[0,760],a];
 const seam=[];
 // Open water intrusions correspond to actual unequal crown root groups.
 // The back stays broadly ivory; short grouped channels replace a regular comb.
 const channels=rootGroups.map((root,i)=>({s:root.s-.035-r()*.025,half:.019+r()*.014,top:.88+r()*.06,base:.74+r()*.075,split:root.fork&&i%2===0})).sort((a,b)=>b.s-a.s);
 channels.forEach((channel,i)=>{const prev=i?channels[i-1].s:1.03,next=i+1<channels.length?channels[i+1].s:.50;channel.half=Math.min(channel.half,(prev-channel.s)*.40,(channel.s-next)*.40);});
 let cursor=1;
 for(const channel of channels){
  const {s,half,top,base,split}=channel;
  for(let u=cursor;u>s+half;u-=.012)seam.push(surface(u,.76+.025*Math.sin(u*8)));
  seam.push(surface(s+half,base),surface(s+half*.68,top-.015));
  if(split)seam.push(surface(s+half*.21,top),surface(s,top-.045),surface(s-half*.38,top+.008));
  else seam.push(surface(s,top));
  seam.push(surface(s-half*.7,top-.025),surface(s-half,base));cursor=s-half;
 }
 for(let u=cursor;u>=0;u-=.012)seam.push(surface(u,.76+.025*Math.sin(u*8)));
 seam.push(surface(0,.76));
 const cap=[...outer,...seam,a];
 const bands=[];
 for(let i=0;i<11;i++){
  let s=.055+i*.078+(r()-.5)*.025, width=.009+r()*.016;
  const edge=[];for(let t=0;t<=.84;t+=.025)edge.push(surface(s+width*Math.sin(t*2.6),t));
  for(let t=.84;t>=0;t-=.025)edge.push(surface(s+width*2.4+width*Math.sin(t*2.6),t));
  bands.push({points:edge,color:i%3===0?pale:blue});
 }
 const strokes=[];
 for(let i=0;i<18;i++){const s=.03+i*.052;let line=[];for(let t=.02;t<.72;t+=.025)line.push(surface(s,t));strokes.push(line);}
 const geometry={seed,body,cap,bands,strokes,rootGroups,descriptor:{family:'curl-surface',crests:1,roots,forks:counts.forks,tips:counts.tips,crown:[crownX,crownY],lip:[lipX,lipY]}};
 const values=JSON.stringify(geometry);let hash=2166136261;for(const ch of values)hash=Math.imul(hash^ch.charCodeAt(0),16777619);geometry.fingerprint=(hash>>>0).toString(16);return geometry;
}
export function waveSvg(w){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="Generated curling woodblock wave"><defs><clipPath id="water-${w.seed}"><path d="${smooth(w.body)}"/></clipPath></defs><rect width="1200" height="800" fill="#e6dcc1"/><path d="M780 125 Q800 100 825 120 Q842 80 870 115 Q925 95 955 132 Q1005 122 1020 145 L775 150Z M130 215 Q155 195 185 214 Q200 183 230 210 Q260 195 285 223Z" fill="#efead6"/><path d="${smooth(w.body)}" fill="${ink}" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/><g clip-path="url(#water-${w.seed})">${w.bands.map(b=>`<path d="${smooth(b.points)}" fill="${b.color}"/>`).join('')}${w.strokes.map(p=>`<path d="${smooth(p,false)}" fill="none" stroke="#1c3c52" stroke-width="1.2"/>`).join('')}</g><path d="${smooth(w.cap)}" fill="${foam}" stroke="${ink}" stroke-width="2.1" stroke-linejoin="round"/></svg>`;}
