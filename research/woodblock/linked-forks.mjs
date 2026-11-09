import {generateLinkedParentInk} from './linked-parent-ink.mjs';
import {generateInkParent} from './ink-parent.mjs';
import {hash} from '../../src/random.mjs';
const path=points=>'M'+points.map(p=>p.join(',')).join(' L')+' Z';

export function generateLinkedForks(seed=721){
 const baseline=generateLinkedParentInk(seed),g=baseline.baseline.baseline.baseline.geometry;
 const additions=[1,2,3].map(childIndex=>{
  const parentSeed=hash(seed,106+childIndex),local=generateInkParent(parentSeed);
  const root=g.roots[childIndex],scale=g.scales[childIndex],origin=[40,67];
  const transform=p=>p.map((v,i)=>root[i]+(v-origin[i])*scale);
  return {childIndex,parentSeed,marks:local.ink.map(poly=>poly.map(transform)),accent:local.accent.map(transform),mapping:{root,scale,origin}};
 });
 const layer=`<g data-study="P125">${additions.map(({marks,accent})=>`<path d="${path(accent)}" fill="#b3d2cc"/>${marks.map(poly=>`<path d="${path(poly)}" fill="#23485f"/>`).join('')}`).join('')}</g>`;
 const at=baseline.svg.indexOf('<g><defs><clipPath id="front-');
 if(at<0)throw new Error('P125 foreground SVG interface unavailable');
 const svg=baseline.svg.slice(0,at)+layer+baseline.svg.slice(at);
 return {seed,baseline,svg,additions};
}
