// Hand-authored foam construction after the canonical Met crest. Coordinates
// describe foam, not the pale sky. This is an editable interpretation, not a trace.
const M=(...v)=>['M',...v],C=(...v)=>['C',...v],L=(...v)=>['L',...v],Z=()=>['Z'];
export const CREST_CAP=[
 M(0,940),C(100,920,170,770,245,520),C(300,320,390,175,490,115),
 C(550,75,610,75,650,105),C(678,112,685,155,712,185),
 C(745,208,775,240,785,280),C(820,305,845,330,850,375),
 C(910,390,965,445,985,493),C(1010,530,1000,565,975,580),
 C(950,555,939,524,905,514),C(860,500,835,452,790,434),
 C(750,408,705,360,650,326),C(596,293,548,299,505,340),
 C(453,385,414,475,374,580),C(302,757,166,921,0,940),Z()
];
// Shared roots follow the inner contour; spacing and lengths are deliberately
// unequal. The upper ridge remains continuous above these attached lobes.
const ROOTS=[
 [310,683,105,42,-.12],[359,567,145,52,.12],
 [403,461,100,40,.22],[448,363,142,48,.26],
 [503,308,100,44,.20],[559,286,148,50,.15],
 [622,302,101,41,.60],[675,338,145,52,.35],
 [733,380,92,40,.88],[787,417,151,48,.60],
 [844,461,105,44,.40],[905,494,144,48,.65],
 [962,533,94,36,.32]
];

// Two independently shaped sides produce a tapered lobe without the
// offset-curve self intersections of a tight, returning ribbon hook.
function lobe(x,y,length,width,lean,tip){
 const dx=length*lean,tx=x+dx,ty=y+length;
 return [M(x-width*.5,y),
  C(x-width*.65,y+length*.27,tx-width*.48,ty-length*.34,tx+tip,ty),
  C(tx+tip+width*.24,ty+length*.06,tx+width*.46,ty-length*.30,tx+width*.32,ty-length*.48),
  C(x+width*.64,y+length*.23,x+width*.56,y+length*.10,x+width*.5,y),Z()];
}

export function crestGeometry(f,r,{baseline=false}={}){
 const stretch=baseline?1:.91+r()*.18,lean=baseline?0:(r()-.5)*.10;
 const transform=(x,y)=>[f.width*(x/1000+lean*Math.sin(Math.PI*y/1000)),f.height*(.10+(y/1000-.10)*stretch)];
 const mapped=p=>p.map(([op,...v])=>[op,...v.flatMap((_,i)=>i%2?[]:transform(v[i],v[i+1]))]);
 const foam=[mapped(CREST_CAP)],holes=[],spray=[],roots=[];
 for(const [x,y,len,w,angle]of ROOTS){
  const length=len*(baseline?1:.78+r()*.43),width=w*(baseline?1:.88+r()*.24),direction=angle+(baseline?0:(r()-.5)*.24);
  const tip=width*(baseline?-.20:(r()-.65)*.58);
  foam.push(mapped(lobe(x,y,length,width,direction,tip)));
  const a=transform(x-width*.5,y),b=transform(x+width*.5,y);roots.push(Math.hypot(a[0]-b[0],a[1]-b[1]));
  // Unequal side lobes share an area with their parent rather than touching
  // at a single point. Some parents remain unbranched.
  const childCount=baseline?(x%3===0?1:2):(r()<.22?0:1+Math.floor(r()*3));
  for(let child=0;child<childCount;child++){
   const at=.43+child*.15,px=x+length*direction*at,py=y+length*at;
   const childWidth=width*(.54-child*.08),childLength=length*(baseline?.49:.38+r()*.28);
   const childLean=direction+(child%2?.48:-.72)-(baseline?0:r()*.30);
   foam.push(mapped(lobe(px,py,childLength,childWidth,childLean,-childWidth*.23)));
   const ca=transform(px-childWidth*.5,py),cb=transform(px+childWidth*.5,py);roots.push(Math.hypot(ca[0]-cb[0],ca[1]-cb[1]));
  }
 }
 // Long unequal channels rising with the water flow. Most open at the inner
 // edge; they are coves between foam masses, not decorative enclosed loops.
 for(const [x,y,len,width,drift]of [[342,660,125,23,49],[424,448,111,26,32],[477,353,86,19,34],[600,332,130,24,-18],[711,402,107,27,-50],[821,483,80,19,-42],[936,563,71,18,-34]]){
  holes.push(mapped([M(x-width*.24,y+40),
   C(x-width*.30,y-len*.18,x+drift-width*.95,y-len*.46,x+drift-width*.95,y-len*.72),
   C(x+drift-width*.95,y-len*1.08,x+drift+width*.82,y-len*1.06,x+drift+width*.87,y-len*.76),
   C(x+drift+width*.92,y-len*.48,x+width*.38,y-len*.20,x+width*.34,y+40),Z()]));
 }
 const body=mapped([M(0,950),C(220,860,240,280,490,115),C(640,-5,760,190,850,375),C(940,400,1020,480,1000,575),C(960,660,900,550,825,488),C(670,380,540,580,660,800),C(760,965,985,990,1100,1000),L(1120,1000),L(1120,1000),L(0,1000),Z()]);
 body.splice(-3,2,L(f.width*1.12,f.height+140),L(-32,f.height+140));
 for(let i=0;i<18;i++){const x=680+r()*325,y=165+(x-680)*.85-r()*75;const [px,py]=transform(x,y);spray.push([px,py,1.5+r()*1.6,2+r()*2.5]);}
 return {body,foam,holes,spray,rootWidths:roots};
}
