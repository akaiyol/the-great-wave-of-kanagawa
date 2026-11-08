import {generateSourceHead} from './source-head.mjs';
const pt=p=>p.map(v=>Number(v.toFixed(3))).join(',');
const path=ps=>'M'+ps.map(pt).join(' L')+' Z';
function cubic(c,t){const s=1-t;return c[0].map((v,i)=>s**3*v+3*s*s*t*c[1][i]+3*s*t*t*c[2][i]+t**3*c[3][i]);}
export function generateSupportCove(seed=721){
 const baseline=generateSourceHead(seed),g=baseline.geometry,edge=baseline.baseline.geometry.supportEdge;
 const start=edge[1],end=edge[2],same=(a,b)=>a[0]===b[0]&&a[1]===b[1];
 const index=g.outer.findIndex((p,i)=>same(p,start)&&i+1<g.outer.length&&same(g.outer[i+1],end));
 if(index<0)throw new Error('P116 adjacent outer root endpoints unavailable');
 const controls=[
  [start,[503,144],[496,148],[493,154]],
  [[493,154],[488,163],[491,172],[499,174]],
  [[499,174],[514,181],[538,176],[548,172]],
  [[548,172],[550,167],[549,159],[554,153]],
  [[554,153],[555,152.8],[556,152.8],end],
 ];
 const cove=controls.flatMap((c,i)=>Array.from({length:49},(_,j)=>j===0?c[0]:j===48?c[3]:cubic(c,j/48)).slice(i?1:0));
 const outer=[...g.outer.slice(0,index+1),...cove.slice(1),...g.outer.slice(index+2)];
 const supportsheet=[...outer,...g.seam.slice(1)],waterbase=[...outer,...g.waterbase.slice(g.outer.length)];
 const foamcomponents=[supportsheet,...g.children],watercomponents=[waterbase,...g.children];
 const finite=[outer,supportsheet,waterbase].every(poly=>poly.every(p=>p.length===2&&p.every(Number.isFinite)));
 if(!finite)throw new Error('P116 nonfinite cove');
 const paths=polys=>polys.map(p=>`<path d="${path(p)}"/>`).join('');
 const bands=baseline.baseline.geometry.bands;
 const layer=`<g data-study="P116"><defs><clipPath id="cove-body-${seed}">${paths(watercomponents)}</clipPath></defs><g fill="#23485f">${paths(watercomponents)}</g><g clip-path="url(#cove-body-${seed})">${bands.map(b=>`<path d="${path(b.points)}" fill="${b.color}"/>`).join('')}<path d="${path(g.band.polygon)}" fill="#346e8b"/></g><g fill="none" stroke="#23485f" stroke-width="3" stroke-linejoin="round">${paths(foamcomponents)}</g><g fill="#eeecd5">${paths(foamcomponents)}</g></g>`;
 const at=baseline.svg.indexOf('<g data-study="P110">'),endIndex=baseline.svg.indexOf('</g><g><defs><clipPath id="front-',at);
 if(at<0||endIndex<0)throw new Error('P116 primary SVG interface unavailable');
 const svg=baseline.svg.slice(0,at)+layer+baseline.svg.slice(endIndex+4);
 return {seed,baseline,svg,geometry:{...g,outer,supportsheet,waterbase,foamcomponents,watercomponents,cove,children:g.children},diagnostics:{finite}};
}
