/* W046: a new annular front patch, not the W044/45 base-to-crest map.
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
 // Front flow bands turn around the same hollow. Their ends stop at the
 // exposed lip; neither their orientation nor their shape uses constant-s.
 for(const [radius,width,end,color] of [[112,8,-19,blue],[159,10,-25,pale],[211,7,-8,blue],[242,5,-5,pale]]){
  bands.push({points:[...arc(-130,end,radius),...arc(end,-130,radius+width)],color});
 }
 // Lower flow feeds the rotated patch at its back edge.
 for(let i=0;i<8;i++){
  const r=109+i*19,start=map(-125,r),base=[150+i*125,737];const edge=[];
  for(let t=0;t<=1;t+=.025)edge.push(bez(base,[base[0]-260,695],[start[0]-110,start[1]+220],start,t));
  const top=map(-125,r+7+i%3*2);for(let t=1;t>=0;t-=.025)edge.push(bez([base[0]+25,739],[base[0]-215,702],[top[0]-105,top[1]+220],top,t));
  bands.unshift({points:edge,color:i%3===0?pale:blue});
 }
 const strokes=[...Array.from({length:9},(_,i)=>arc(-125,-18+i*.7,116+i*15))];
 const patch={center:[cx,cy],outer,inner:arc(-125,-16,102),longitudinalRange:[-125,-1],foamTips:[map(-2,252),map(-27,200),map(-57,146)]};
 return{seed,body,cap,bands,strokes,patch,descriptor:{family:'rolled-front-patch',crests:1,roots:3,tips:3,principalHollow:[cx,cy]}};
}
export function waveSvg(w){return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="Rolled front wave study"><defs><clipPath id="water-${w.seed}"><path d="${curve(w.body)}"/></clipPath></defs><rect width="1200" height="800" fill="#e6dcc1"/><path d="M780 125 Q800 100 825 120 Q842 80 870 115 Q925 95 955 132 Q1005 122 1020 145 L775 150Z" fill="#efead6"/><path d="${curve(w.body)}" fill="${ink}" stroke="${ink}" stroke-width="2.5"/><g clip-path="url(#water-${w.seed})">${w.bands.map(b=>`<path d="${d(b.points)}" fill="${b.color}"/>`).join('')}${w.strokes.map(p=>`<path d="M${p.map(pt).join(' L')}" fill="none" stroke="#1c3c52" stroke-width="1.1"/>`).join('')}</g><path d="${curve(w.cap)}" fill="${foam}" stroke="${ink}" stroke-width="2.1" stroke-linejoin="round"/></svg>`;}
