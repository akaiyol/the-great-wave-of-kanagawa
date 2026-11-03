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
const ROOTS=[
 [310,683,105,42,-.12],[359,567,145,52,.12],
 [403,461,100,40,.22],[448,363,142,48,.26],
 [503,308,100,44,.20],[559,286,148,50,.15],
 [622,302,101,41,.60],[675,338,145,52,.35],
 [733,380,92,40,.88],[787,417,151,48,.60],
 [844,461,105,44,.40],[905,494,144,48,.65],
 [962,533,94,36,.32]
];
export function crestGeometry(f,r,{baseline=false}={}){
 const vary=(base,span)=>baseline?base:base+(r()-.5)*span;
 const stretch=vary(1,.18),lean=vary(0,.10);
 const transform=(x,y)=>[f.width*(x/1000+lean*Math.sin(Math.PI*y/1000)),f.height*(.10+(y/1000-.10)*stretch)];
 const mapped=p=>p.map(([op,...v])=>[op,...v.flatMap((_,i)=>i%2?[]:transform(v[i],v[i+1]))]);
 const fingers=ROOTS.map(([x,y,len,width,angle],i)=>({x,y,length:len*vary(1,.30),width:Math.min(30,width*.64)*vary(1,.12),angle:angle+vary(0,.16),fork:i%3!==1&&(baseline||r()>.25)}));
 const outline=[...CREST_RIDGE],roots=[],channels=[];
 let previous=[975,580];
 for(let i=fingers.length-1;i>=0;i--){
  const {x,y,length:len,width:w,angle,fork}=fingers[i],right=[x+w*.5,y],left=[x-w*.5,y];
  if(i===fingers.length-1)outline.push(C(988,570,right[0]+8,right[1]+8,...right));
  else{
   // Round-ended negative cove, open all the way into the surrounding black
   // water. Its mouth and neighboring lobe boundaries are authored together.
   const nx=(previous[0]+right[0])*.5,ny=Math.min(previous[1],right[1])-vary(65,45);
   const half=Math.min(16,Math.max(7,(previous[0]-right[0])*.45));
   outline.push(C(previous[0]-5,previous[1]-20,nx+half,ny+27,nx+half,ny),
    C(nx+half,ny-22,nx-half,ny-22,nx-half,ny),
    C(nx-half,ny+27,right[0]+5,right[1]-18,...right));
   // Probe the head and the open mouth independently after rasterization.
   channels.push({head:transform(nx,ny),mouth:transform(nx,(previous[1]+right[1])*.5+24)});
  }
  const tx=x+Math.max(-7,Math.min(7,len*(angle-.30)*.12)),ty=y+len;
  outline.push(C(x+w*.60,y+len*.27,tx+w*.52,ty-len*.32,tx+w*.18,ty-len*.05),
   C(tx+w*.12,ty+len*.12,tx-w*.33,ty+len*.08,tx-w*.30,ty-len*.12));
  if(fork){
   const bx=x-w*.33,by=y+len*.67;
   outline.push(C(tx-w*.23,ty-len*.36,bx+w*.12,by+len*.17,bx-w*.30,by+len*.18),
    C(bx-w*.53,by+len*.15,bx-w*.42,by+len*.02,bx-w*.27,by-len*.03),
    C(x-w*.53,y+len*.48,x-w*.58,y+len*.20,...left));
  }else outline.push(C(tx-w*.22,ty-len*.44,x-w*.58,y+len*.25,...left));
  const a=transform(...left),b=transform(...right);roots.push(Math.hypot(a[0]-b[0],a[1]-b[1]));previous=left;
 }
 outline.push(C(270,733,160,922,0,940),Z());
 const body=mapped([M(0,950),C(220,860,240,280,490,115),C(640,-5,760,190,850,375),C(940,400,1020,480,1000,575),C(960,660,900,550,825,488),C(670,380,540,580,660,800),C(760,965,985,990,1100,1000),L(1120,1000),L(1120,1000),L(0,1000),Z()]);
 body.splice(-3,2,L(f.width*1.12,f.height+140),L(-32,f.height+140));
 const spray=[];
 for(let i=0;i<18;i++){const x=680+r()*325,y=165+(x-680)*.85-r()*75;const [px,py]=transform(x,y);spray.push([px,py,1.5+r()*1.6,2+r()*2.5]);}
 return {body,foam:[mapped(outline)],holes:[],spray,rootWidths:roots,channels};
}
