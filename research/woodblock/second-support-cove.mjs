import {generateSupportCove} from './support-cove.mjs';
const pt=p=>p.map(v=>Number(v.toFixed(3))).join(',');
const path=ps=>'M'+ps.map(pt).join(' L')+' Z';
function cubic(c,t){const s=1-t;return c[0].map((v,i)=>s**3*v+3*s*s*t*c[1][i]+3*s*t*t*c[2][i]+t**3*c[3][i]);}
export function generateSecondSupportCove(seed=721){
 const baseline=generateSupportCove(seed),g=baseline.geometry,edge=baseline.baseline.baseline.geometry.supportEdge;
 const start=edge[3],end=edge[4],same=(a,b)=>a[0]===b[0]&&a[1]===b[1];
 const index=g.outer.findIndex((p,i)=>same(p,start)&&i+1<g.outer.length&&same(g.outer[i+1],end));
 if(index<0)throw new Error('P117 adjacent outer root endpoints unavailable');
 const controls=[
  [start,[554,204],[548,207],[544,213]],
  [[544,213],[539,221],[545,229],[553,230]],
  [[553,230],[569,234],[586,227],[597,224]],
  [[597,224],[600,221],[600,219],[603,218]],
  [[603,218],[604,217],[605,216.9],end],
 ];
 const secondCove=controls.flatMap((c,i)=>Array.from({length:49},(_,j)=>j===0?c[0]:j===48?c[3]:cubic(c,j/48)).slice(i?1:0));
 const outer=[...g.outer.slice(0,index+1),...secondCove.slice(1),...g.outer.slice(index+2)];
 const supportsheet=[...outer,...g.seam.slice(1)],waterbase=[...outer,...g.waterbase.slice(g.outer.length)];
 const foamcomponents=[supportsheet,...g.children],watercomponents=[waterbase,...g.children];
 const finite=[outer,supportsheet,waterbase].every(poly=>poly.every(p=>p.length===2&&p.every(Number.isFinite)));
 if(!finite)throw new Error('P117 nonfinite cove');
 const paths=polys=>polys.map(p=>`<path d="${path(p)}"/>`).join('');
 const bands=baseline.baseline.baseline.geometry.bands;
 const layer=`<g data-study="P117"><defs><clipPath id="second-cove-body-${seed}">${paths(watercomponents)}</clipPath></defs><g fill="#23485f">${paths(watercomponents)}</g><g clip-path="url(#second-cove-body-${seed})">${bands.map(b=>`<path d="${path(b.points)}" fill="${b.color}"/>`).join('')}<path d="${path(g.band.polygon)}" fill="#346e8b"/></g><g fill="none" stroke="#23485f" stroke-width="3" stroke-linejoin="round">${paths(foamcomponents)}</g><g fill="#eeecd5">${paths(foamcomponents)}</g></g>`;
 const at=baseline.svg.indexOf('<g data-study="P116">'),endIndex=baseline.svg.indexOf('</g><g><defs><clipPath id="front-',at);
 if(at<0||endIndex<0)throw new Error('P117 primary SVG interface unavailable');
 const svg=baseline.svg.slice(0,at)+layer+baseline.svg.slice(endIndex+4);
 return {seed,baseline,svg,geometry:{...g,outer,supportsheet,waterbase,foamcomponents,watercomponents,secondCove,children:g.children},diagnostics:{finite}};
}
