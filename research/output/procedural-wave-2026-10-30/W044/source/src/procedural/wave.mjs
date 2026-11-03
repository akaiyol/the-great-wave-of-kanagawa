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
// A continuous boundary walk through both children, not independent applied strokes.
function finger(origin,dir,length,width,depth,r,counts){
 const normal=[-dir[1],dir[0]], local=(x,y)=>add(origin,add(mul(normal,x),mul(dir,y)));
 const bend=(r()-.3)*length*.35, tip=local(bend,length);
 if(!depth){counts.tips++;return [local(-width,0),local(-width*.85,length*.38),local(bend-width*.7,length*.83),add(tip,mul(normal,width*.4)),local(bend+width*.9,length*.76),local(width,length*.31),local(width,0)];}
 counts.forks++;
 const joint=local(bend*.4,length*.54), angle=.44+r()*.28;
 const turn=a=>[dir[0]*Math.cos(a)-dir[1]*Math.sin(a),dir[0]*Math.sin(a)+dir[1]*Math.cos(a)];
 const left=finger(add(joint,mul(normal,-width*.4)),turn(angle),length*.51,width*.5,depth-1,r,counts);
 const right=finger(add(joint,mul(normal,width*.45)),turn(-angle*.8),length*(.37+r()*.18),width*.44,0,r,counts);
 return [local(-width,0),local(-width*1.05,length*.28),...left,local(0,length*.49),...right,local(width,length*.24),local(width,0)];
}
export function generateWave(seed=721){
 const r=rng(seed), crownX=430+r()*70,crownY=135+r()*28,lipX=680+r()*55,lipY=280+r()*35;
 const a=[25,535],b=[200,520],c=[240,110],d=[crownX,crownY];
 const e=[crownX+120,crownY-12],f=[lipX-35,lipY-70],g=[lipX,lipY];
 const crest=s=>s<.57?bez(a,b,c,d,s/.57):bez(d,e,f,g,(s-.57)/.43);
 // Every surface trajectory terminates at its own crest coordinate. The hollow
 // is formed by the rightmost trajectory's strong leftward intermediate bend.
 const surface=(s,t)=>{const top=crest(s),base=[35+s*1100,725+16*Math.sin(s*5)];return bez(base,[base[0]-150-230*s,680],[top[0]-115*s,top[1]+190+140*s],top,t);};
 const roots=7+Math.floor(r()*4), counts={tips:0,forks:0}, outer=[];
 let next=.31;
 for(let j=0;j<roots;j++){
  const s=.31+j*(.68/roots), half=.010+r()*.007;
  for(let u=next;u<s-half;u+=.008)outer.push(crest(u));
  const root=crest(s), before=crest(s-.005),after=crest(s+.005),dx=after[0]-before[0],dy=after[1]-before[1],len=Math.hypot(dx,dy);
  const dir=[dy/len,-dx/len];
  const branch=finger(root,dir,32+r()*52,(6+r()*4),r()<.75?1:0,r,counts);
  // Match boundary traversal orientation to the left-to-right crest walk.
  outer.push(...branch);next=s+half;
 }
 for(let u=next;u<=1;u+=.008)outer.push(crest(Math.min(1,u)));outer.push(g);
 const back=[];for(let s=0;s<.31;s+=.008)back.push(crest(s));outer.unshift(...back);
 const hollow=[];for(let t=.98;t>=0;t-=.018)hollow.push(surface(1,t));
 const body=[...outer,...hollow,[1135,760],[0,760],a];
 const seam=[];
 // Unequal upward indigo intrusions make open channels through the foam seam.
 const channelCount=roots+3;
 for(let i=0;i<=channelCount;i++){
  const s=1-i/channelCount, low=.66+r()*.1, high=.88+r()*.065;
  seam.push(surface(s,low));
  if(i<channelCount){seam.push(surface(Math.max(0,s-.018),low+.01),surface(Math.max(0,s-.035),high),surface(Math.max(0,s-.065),high-.01));}
 }
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
 const geometry={seed,body,cap,bands,strokes,descriptor:{family:'curl-surface',crests:1,roots,forks:counts.forks,tips:counts.tips,crown:[crownX,crownY],lip:[lipX,lipY]}};
 const values=JSON.stringify(geometry);let hash=2166136261;for(const ch of values)hash=Math.imul(hash^ch.charCodeAt(0),16777619);geometry.fingerprint=(hash>>>0).toString(16);return geometry;
}
export function waveSvg(w){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="Generated curling woodblock wave"><defs><clipPath id="water-${w.seed}"><path d="${smooth(w.body)}"/></clipPath></defs><rect width="1200" height="800" fill="#e6dcc1"/><path d="M780 125 Q800 100 825 120 Q842 80 870 115 Q925 95 955 132 Q1005 122 1020 145 L775 150Z M130 215 Q155 195 185 214 Q200 183 230 210 Q260 195 285 223Z" fill="#efead6"/><path d="${smooth(w.body)}" fill="${ink}" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/><g clip-path="url(#water-${w.seed})">${w.bands.map(b=>`<path d="${smooth(b.points)}" fill="${b.color}"/>`).join('')}${w.strokes.map(p=>`<path d="${smooth(p,false)}" fill="none" stroke="#1c3c52" stroke-width="1.2"/>`).join('')}</g><path d="${smooth(w.cap)}" fill="${foam}" stroke="${ink}" stroke-width="2.1" stroke-linejoin="round"/></svg>`;}
