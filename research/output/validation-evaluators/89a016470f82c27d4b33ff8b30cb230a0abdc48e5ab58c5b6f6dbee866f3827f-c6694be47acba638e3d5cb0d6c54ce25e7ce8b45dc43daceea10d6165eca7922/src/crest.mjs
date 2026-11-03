// Foam-only interpretation of the canonical Met crest, in normalized units.
// The ridge, fingers, and open coves share ONE closed boundary. No overlay can
// seal a cove and no subtraction can sever an independently attached finger.
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
 [609,300,162,104,.50],
 [771,408,170,100,.60],
 [925,513,130,82,.40]
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
   const nx=(previous[0]+right[0])*.5;
   const half=(previous[0]-right[0])*.36;
   const ridge=ridgeBelow(nx,half),bridge=8*1000/f.height;
   const round=8*1000/f.height;
   const ny=Math.max(Math.min(previous[1],right[1])-vary(90,40),ridge+bridge+round);
   outline.push(C(previous[0]-5,previous[1]-20,nx+half,ny+27,nx+half,ny),
    C(nx+half,ny-round,nx-half,ny-round,nx-half,ny),
    C(nx-half,ny+27,right[0]+5,right[1]-18,...right));
   // Probe the head and the open mouth independently after rasterization.
   channels.push({head:transform(nx,ny),mouth:transform(nx,(previous[1]+right[1])*.5+24)});
  }
  // A primary tongue curls back toward its root; a shorter side tongue
  // shares its shoulder. Their cove belongs to this same boundary.
  const tx=x+w*.25+len*(angle-.3)*.12,ty=y+len;
  outline.push(C(x+w*.56,y+len*.25,tx+w*.35,ty-len*.23,tx+w*.10,ty),
   C(tx-w*.05,ty+len*.16,tx-w*.49,ty+len*.07,tx-w*.40,ty-len*.07),
   C(tx-w*.34,ty-len*.20,tx-w*.12,ty-len*.17,tx-w*.14,ty-len*.07));
  if(fork){
   const bx=x-w*.32,by=y+len*.61;
   outline.push(C(tx-w*.01,ty-len*.33,bx+w*.27,by-len*.07,bx+w*.02,by+len*.15),
    C(bx-w*.13,by+len*.32,bx-w*.45,by+len*.21,bx-w*.38,by+len*.06),
    C(bx-w*.30,by-len*.05,bx-w*.12,by-len*.03,bx-w*.13,by+len*.05),
    C(x-w*.27,y+len*.38,x-w*.59,y+len*.18,...left));
  }else outline.push(C(tx-w*.07,ty-len*.34,x-w*.58,y+len*.25,...left));
  const a=transform(...left),b=transform(...right);roots.push(Math.hypot(a[0]-b[0],a[1]-b[1]));previous=left;
 }
 outline.push(C(270,733,160,922,0,940),Z());
 const body=mapped([M(0,950),C(220,860,240,280,490,115),C(640,-5,760,190,850,375),C(940,400,1020,480,1000,575),C(960,660,900,550,825,488),C(670,380,540,580,660,800),C(760,965,985,990,1100,1000),L(1120,1000),L(1120,1000),L(0,1000),Z()]);
 body.splice(-3,2,L(f.width*1.12,f.height+140),L(-32,f.height+140));
 const spray=[];
 for(let i=0;i<18;i++){const x=680+r()*325,y=165+(x-680)*.85-r()*75;const [px,py]=transform(x,y);spray.push([px,py,1.5+r()*1.6,2+r()*2.5]);}
 return {body,foam:[mapped(outline)],holes:[],spray,rootWidths:roots,channels};
}
