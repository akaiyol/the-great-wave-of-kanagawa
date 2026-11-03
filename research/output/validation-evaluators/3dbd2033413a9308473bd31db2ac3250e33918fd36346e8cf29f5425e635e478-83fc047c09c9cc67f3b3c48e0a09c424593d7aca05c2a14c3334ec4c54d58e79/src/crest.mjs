// UNACCEPTED RESEARCH STUDY. Not a production or artistically approved crest.
// Copy of the connected-tail checkpoint; only central ROOTS[2] length and
// PROFILES[2] differ. Production rendering and six-fixture review are pending.
// Foam-only interpretation of the canonical Met crest, in normalized units.
// Candidate study: authored branch profiles share a closed boundary with coves.
// Sampling and independent visual review still determine whether the form works.
const M=(...v)=>['M',...v],C=(...v)=>['C',...v],L=(...v)=>['L',...v],Z=()=>['Z'];
export const CREST_RIDGE=[
 M(0,940),C(100,920,170,770,245,520),C(300,320,390,175,490,115),
 C(550,75,610,75,650,105),C(678,112,685,155,712,185),
 C(737,193,746,213,742,231),C(758,220,787,249,785,280),
 C(812,286,827,311,822,333),C(851,327,863,356,850,375),
 C(881,375,891,400,893,419),C(919,413,945,441,940,462),
 C(971,459,991,486,985,509),C(1007,521,1001,561,975,580)
];
// Sample only the authored outer ridge to keep negative coves below it.
const ridgeSamples=[];let ridgeStart=CREST_RIDGE[0].slice(1);
for(const [,x1,y1,x2,y2,x3,y3]of CREST_RIDGE.slice(1)){
 for(let i=0;i<=40;i++){const t=i/40,u=1-t;ridgeSamples.push([u*u*u*ridgeStart[0]+3*u*u*t*x1+3*u*t*t*x2+t*t*t*x3,u*u*u*ridgeStart[1]+3*u*u*t*y1+3*u*t*t*y2+t*t*t*y3]);}
 ridgeStart=[x3,y3];
}
const ridgeBelow=(x,half)=>Math.max(...ridgeSamples.filter(p=>Math.abs(p[0]-x)<=half+6).map(p=>p[1]));
// Uneven primary lobes: long groups alternate with short connecting tongues.
// The spacing leaves room for open coves at the middle-layer dot resolution.
const ROOTS=[
 [333,629,108,72,-.10],
 [466,358,138,92,.15],
 [609,300,232,104,.50],
 [771,408,170,100,.60],
 [925,513,130,82,.40]
];
// Each root owns a distinct two-level silhouette. Coordinates use root width
// horizontally and branch length vertically; these are authored constructions,
// not noise variants of one repeated hook.
const PROFILES=[
 [C(.55,.25,.35,.67,.05,.92),C(-.12,1.05,-.42,1.0,-.38,.86),
  C(-.27,.88,-.15,.81,-.24,.69),C(-.42,.48,-.54,.24,-.5,0)],
 [C(.65,.22,.58,.66,.36,.9),C(.15,1.08,-.12,1.02,-.04,.85),
  C(.14,.83,.20,.73,.09,.63),C(-.08,.45,-.10,.55,-.23,.75),
  C(-.42,.97,-.64,.77,-.51,.65),C(-.35,.72,-.30,.59,-.36,.45),
  C(-.47,.25,-.55,.14,-.5,0)],
 // Unaccepted dominant-group study: one long directional curl with two
 // unequal subordinate fingers. The returning edges leave exterior notches;
 // broad main stems replace the baseline's short protrusions on a pendant.
 // Root endpoints stay at (+/-.5,0), preserving principal cove attachment.
 [C(.60,.14,.77,.27,.91,.39),C(1.02,.49,.82,.62,.66,.54),
  C(.78,.49,.71,.39,.56,.36),C(.43,.33,.22,.37,.19,.49),
  C(.22,.66,.43,.82,.29,1.02),C(.14,1.24,-.15,1.28,-.30,1.10),
  C(-.11,1.15,.01,1.02,-.08,.91),C(-.24,.83,-.30,.71,-.25,.57),
  C(-.42,.62,-.45,.86,-.65,.91),C(-.81,.95,-.91,.83,-.84,.74),
  C(-.70,.81,-.54,.63,-.53,.48),C(-.48,.32,-.66,.16,-.5,0)],
 [C(.64,.13,.73,.30,.45,.44),C(.29,.50,.12,.40,.24,.32),
  C(.18,.54,.52,.70,.28,.96),C(.07,1.12,-.12,.91,-.01,.80),
  C(.09,.88,.11,.72,-.05,.66),C(-.18,.60,-.26,.70,-.37,.80),
  C(-.59,.92,-.68,.68,-.50,.61),C(-.38,.69,-.31,.50,-.44,.39),
  C(-.56,.24,-.57,.12,-.5,0)],
 [C(.52,.30,.80,.54,.61,.80),C(.43,1.0,.15,.82,.23,.70),
  C(.36,.82,.48,.64,.30,.57),C(.08,.50,.04,.79,-.18,.87),
  C(-.43,1.0,-.61,.78,-.43,.70),C(-.22,.77,-.19,.52,-.34,.39),
  C(-.50,.21,-.54,.10,-.5,0)]
];
export function crestGeometry(f,r,{baseline=false}={}){
 const vary=(base,span)=>baseline?base:base+(r()-.5)*span;
 const stretch=vary(1,.18),lean=vary(0,.10);
 const transform=(x,y)=>[f.width*(x/1000+lean*Math.sin(Math.PI*y/1000)),f.height*(.10+(y/1000-.10)*stretch)];
 const mapped=p=>p.map(([op,...v])=>[op,...v.flatMap((_,i)=>i%2?[]:transform(v[i],v[i+1]))]);
 const fingers=ROOTS.map(([x,y,len,width,angle],i)=>({x,y,length:len*vary(1,.30),width:width*vary(1,.12),angle:angle+vary(0,.16),fork:len>120&&(baseline||r()>.15)}));
 const outline=[...CREST_RIDGE],roots=[],channels=[];
 let previous=[975,580];
 for(let i=fingers.length-1;i>=0;i--){
  const {x,y,length:len,width:w,angle,fork}=fingers[i],right=[x+w*.5,y],left=[x-w*.5,y];
  if(i===fingers.length-1)outline.push(C(973,578,right[0]+8,right[1]+8,...right));
  else{
   // Round-ended negative cove, open all the way into the surrounding black
   // water. Its mouth and neighboring lobe boundaries are authored together.
   const mouthX=(previous[0]+right[0])*.5;
   const half=(previous[0]-right[0])*.36;
   const nx=mouthX+half*[-.35,.40,-.45,.30][i];
   const ridge=ridgeBelow(nx,half),bridge=8*1000/f.height;
   const round=8*1000/f.height;
   const ny=Math.max(Math.min(previous[1],right[1])-vary([110,65,130,80][i],25),ridge+bridge+round);
   outline.push(C(previous[0]-5,previous[1]-20,nx+half,ny+(previous[1]-ny)*.55,nx+half,ny),
    C(nx+half,ny-round,nx-half,ny-round,nx-half,ny),
    C(nx-half,ny+(right[1]-ny)*.60,right[0]+8,right[1]-14,...right));
   // Probe the head and the open mouth independently after rasterization.
   channels.push({head:transform(nx,ny),mouth:transform(mouthX,(previous[1]+right[1])*.5+24)});
  }
  for(const [op,...values] of PROFILES[i]){
   outline.push([op,...values.map((value,j)=>j%2?y+value*len:x+value*w)]);
  }
  const a=transform(...left),b=transform(...right);roots.push(Math.hypot(a[0]-b[0],a[1]-b[1]));previous=left;
 }
 // Broaden the returning tail boundary so the first sampled run joins the cap.
 // Preserve the zero-width endpoint; do not delete disconnected samples in the renderer.
 outline.push(C(270,733,160,1000,0,940),Z());
 const body=mapped([M(0,950),C(220,860,240,280,490,115),C(640,-5,760,190,850,375),C(940,400,1020,480,1000,575),C(960,660,900,550,825,488),C(670,380,540,580,660,800),C(760,965,985,990,1100,1000),L(1120,1000),L(1120,1000),L(0,1000),Z()]);
 body.splice(-3,2,L(f.width*1.12,f.height+140),L(-32,f.height+140));
 const spray=[];
 for(let i=0;i<18;i++){const x=680+r()*325,y=165+(x-680)*.85-r()*75;const [px,py]=transform(x,y);spray.push([px,py,1.5+r()*1.6,2+r()*2.5]);}
 return {body,foam:[mapped(outline)],holes:[],spray,rootWidths:roots,channels};
}
