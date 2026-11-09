import {generateSupportCove} from './support-cove.mjs';
import {generateInkParent} from './ink-parent.mjs';
import {hash} from '../../src/random.mjs';
const path=points=>'M'+points.map(p=>p.join(',')).join(' L')+' Z';

export function generateLinkedParentInk(seed=721){
 const baseline=generateSupportCove(seed),g=baseline.baseline.baseline.geometry;
 const parentSeed=hash(seed,106),local=generateInkParent(parentSeed);
 const root=g.roots[0],scale=g.scales[0],origin=[40,67];
 const transform=p=>p.map((v,i)=>root[i]+(v-origin[i])*scale);
 const marks=local.ink.map(poly=>poly.map(transform)),accent=local.accent.map(transform);
 const layer=`<g data-study="P124"><path d="${path(accent)}" fill="#b3d2cc"/>${marks.map(poly=>`<path d="${path(poly)}" fill="#23485f"/>`).join('')}</g>`;
 const at=baseline.svg.indexOf('<g><defs><clipPath id="front-');
 if(at<0)throw new Error('P124 foreground SVG interface unavailable');
 const svg=baseline.svg.slice(0,at)+layer+baseline.svg.slice(at);
 return {seed,baseline,svg,marks,accent,mapping:{parentSeed,root,scale,origin,childIndex:0}};
}
