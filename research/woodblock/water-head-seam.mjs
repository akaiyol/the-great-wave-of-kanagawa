import {generateSourceHead} from './source-head.mjs';
// Exact sparse calibration knots from research/proposals/P113-seam-knots.json.
// Approximate construction in study coordinates, not source segmentation.
export const knots=[[440,205],[468,192],[471,182],[463,178],[460,169],[452,162],[445,156],[439,157],[440,166],[447,173],[441,182],[433,193],[427,198],[428,190],[433,182],[431,175],[424,168],[416,166],[414,173],[417,178],[412,186],[403,196],[394,210],[390,212],[391,204],[399,195],[403,187],[397,182],[390,178],[383,177],[379,183],[383,190],[385,198],[380,205],[374,208],[373,204],[374,197],[370,188],[367,177],[360,171],[350,170],[343,176],[344,183],[352,190],[359,197],[360,205],[357,209],[350,210],[345,205],[338,202],[331,204],[326,211],[321,215],[312,219],[300,222],[288,220],[275,215]];
const pt=p=>p.map(v=>Number(v.toFixed(3))).join(',');
const path=ps=>'M'+ps.map(pt).join(' L')+' Z';
function cubic(c,t){const s=1-t;return c[0].map((v,i)=>s**3*v+3*s*s*t*c[1][i]+3*s*t*t*c[2][i]+t**3*c[3][i]);}
function sampleKnots(){
 const points=[knots[0]];
 for(let i=0;i<knots.length-1;i++){
  const a=knots[i],b=knots[i+1],previous=knots[Math.max(0,i-1)],next=knots[Math.min(knots.length-1,i+2)];
  const c1=a.map((v,j)=>v+(b[j]-previous[j])/6),c2=b.map((v,j)=>v-(next[j]-a[j])/6);
  for(let j=1;j<=12;j++)points.push(j===12?b:cubic([a,c1,c2,b],j/12));
 }
 return points;
}
export function generateWaterHeadSeam(seed=721){
 const baseline=generateSourceHead(seed),g=baseline.geometry;
 const first=g.seam.findIndex(p=>p[0]===440&&p[1]===205),last=g.seam.findIndex((p,i)=>i>first&&p[0]===275&&p[1]===215);
 if(first<0||last<0)throw new Error('P113 exact seam endpoints unavailable');
 const replacement=sampleKnots(),seam=[...g.seam.slice(0,first),...replacement,...g.seam.slice(last+1)];
 const supportsheet=[...g.outer,...seam.slice(1)],foamcomponents=[supportsheet,...g.children];
 const geometry={...g,seam,supportsheet,foamcomponents};
 const finite=foamcomponents.every(poly=>poly.every(p=>p.length===2&&p.every(Number.isFinite)));
 if(!finite)throw new Error('P113 nonfinite seam geometry');
 const paths=polys=>polys.map(p=>`<path d="${path(p)}"/>`).join('');
 const bands=baseline.baseline.geometry.bands;
 const layer=`<g data-study="P113"><defs><clipPath id="seam-body-${seed}">${paths(g.watercomponents)}</clipPath></defs><g fill="#23485f">${paths(g.watercomponents)}</g><g clip-path="url(#seam-body-${seed})">${bands.map(b=>`<path d="${path(b.points)}" fill="${b.color}"/>`).join('')}<path d="${path(g.band.polygon)}" fill="#346e8b"/></g><g fill="none" stroke="#23485f" stroke-width="3" stroke-linejoin="round">${paths(foamcomponents)}</g><g fill="#eeecd5">${paths(foamcomponents)}</g></g>`;
 const start=baseline.svg.indexOf('<g data-study="P110">'),end=baseline.svg.indexOf('</g><g><defs><clipPath id="front-',start);
 if(start<0||end<0)throw new Error('P113 primary SVG replacement interface unavailable');
 const svg=baseline.svg.slice(0,start)+layer+baseline.svg.slice(end+4);
 return {seed,baseline,svg,geometry,diagnostics:{finite}};
}
