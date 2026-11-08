import {generateSourceHead} from './source-head.mjs';
const pt=p=>p.map(v=>Number(v.toFixed(3))).join(',');
const path=ps=>'M'+ps.map(pt).join(' L')+' Z';
export function generateCrestRelativeFork(seed=721){
 const baseline=generateSourceHead(seed),g=baseline.geometry;
 const rootX=baseline.baseline.geometry.rootcuts[0][0][0];
 function capX(y){
  const intersections=[];
  for(let i=1;i<g.outer.length;i++){
   const a=g.outer[i-1],b=g.outer[i];
   if(a[1]===b[1]){if(y===a[1])intersections.push(a[0],b[0]);continue;}
   if(y>=Math.min(a[1],b[1])&&y<=Math.max(a[1],b[1]))intersections.push(a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1]));
  }
  if(!intersections.length)throw new Error('P115 no outer intersection at y='+y);
  return Math.max(...intersections);
 }
 const warpedChild=g.children[0].map(p=>[capX(p[1])-.5+(p[0]-rootX),p[1]]);
 const children=[warpedChild,...g.children.slice(1)];
 const watercomponents=[g.waterbase,...children],foamcomponents=[g.supportsheet,...children];
 const finite=warpedChild.every(p=>p.length===2&&p.every(Number.isFinite));
 if(!finite)throw new Error('P115 nonfinite warped child');
 const paths=polys=>polys.map(p=>`<path d="${path(p)}"/>`).join('');
 const bands=baseline.baseline.geometry.bands;
 const layer=`<g data-study="P115"><defs><clipPath id="crest-relative-body-${seed}">${paths(watercomponents)}</clipPath></defs><g fill="#23485f">${paths(watercomponents)}</g><g clip-path="url(#crest-relative-body-${seed})">${bands.map(b=>`<path d="${path(b.points)}" fill="${b.color}"/>`).join('')}<path d="${path(g.band.polygon)}" fill="#346e8b"/></g><g fill="none" stroke="#23485f" stroke-width="3" stroke-linejoin="round">${paths(foamcomponents)}</g><g fill="#eeecd5">${paths(foamcomponents)}</g></g>`;
 const start=baseline.svg.indexOf('<g data-study="P110">'),end=baseline.svg.indexOf('</g><g><defs><clipPath id="front-',start);
 if(start<0||end<0)throw new Error('P115 primary SVG replacement interface unavailable');
 const svg=baseline.svg.slice(0,start)+layer+baseline.svg.slice(end+4);
 return {seed,baseline,svg,geometry:{...g,children,watercomponents,foamcomponents,warpedChild,rootX},diagnostics:{finite}};
}
