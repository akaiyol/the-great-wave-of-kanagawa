import {generateWaterHierarchy} from './water-hierarchy.mjs';
import {generateMeasuredFork} from './measured-fork.mjs';
import {hash,random} from '../../src/random.mjs';
const pt=p=>p.map(v=>Number(v.toFixed(3))).join(',');
const path=ps=>'M'+ps.map(pt).join(' L')+' Z';
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
function cubic(c,t){const s=1-t;return c[0].map((v,i)=>s**3*v+3*s*s*t*c[1][i]+3*s*t*t*c[2][i]+t**3*c[3][i]);}
const sample=(c,n=32)=>Array.from({length:n+1},(_,i)=>cubic(c,i/n));
// Clip a mathematically generated parent to x >= 40. Closing the result
// retains the vertical root interface as a component boundary, never as
// an exposed traversal connector.
function clipRoot(outline){
 const result=[];
 for(let i=0;i<outline.length-1;i++){
  const a=outline[i],b=outline[i+1],ai=a[0]>=40,bi=b[0]>=40;
  if(ai!==bi){const p=mix(a,b,(40-a[0])/(b[0]-a[0]));p[0]=40;result.push(p);}
  if(bi)result.push(b);
 }
 if(result.length<3||result[0][0]!==40||result.at(-1)[0]!==40)throw new Error('P106 closed root interface unavailable');
 return result;
}
export function generateComponentField(seed=721){
 const context=generateWaterHierarchy(seed),baseline=context.variant,r=random(hash(seed,0x50313036));
 const vary=(p,amplitude=2)=>p.map(v=>v+(r()-.5)*2*amplitude);
 const roots=[[505,110],[555,175],[605,240],[640,300]].map(p=>vary(p));
 const scales=roots.map(()=>.27+r()*.09);
 const children=roots.map((root,i)=>clipRoot(generateMeasuredFork(hash(seed,106+i)).outline).map(p=>[root[0]+(p[0]-40)*scales[i],root[1]+(p[1]-67)*scales[i]]));
 const rootcuts=children.map(p=>[p[0],p.at(-1)]);
 const supportEdge=rootcuts.flatMap(([a,b])=>[[a[0]+3,a[1]],[b[0]+3,b[1]]]);
 const H=vary([465,335]),O=[0,300],first=supportEdge[0],last=supportEdge.at(-1);
 const rising=sample([O,vary([150,230]),vary([300,77]),first],64);
 const returning=sample([last,[last[0]-43,last[1]+8],[520,320],H],32);
 const outer=[...rising,...supportEdge.slice(1),...returning.slice(1)];
 // Exactly one rounded body-connected water head W; no per-child slots.
 const seamControls=[
 [H,[471,314],[474,289],[474,275]],
 [[474,275],[484,266],[500,270],[510,264]],
 [[510,264],[518,259],[519,250],[515,244]],
 [[515,244],[511,232],[502,230],[496,230]],
 [[496,230],[486,230],[480,236],[480,244]],
 [[480,244],[480,253],[472,259],[470,266]],
 [[470,266],[460,250],[456,224],[440,205]],
 [[440,205],[426,188],[411,177],[390,180]],
 [[390,180],[357,180],[340,208],[310,200]],
 [[310,200],[293,197],[288,211],[275,215]],
 [[275,215],[195,232],[82,312],[0,330]],
 ];
 const seam=seamControls.flatMap((c,i)=>sample(c,24).slice(i?1:0));
 const supportsheet=[...outer,...seam.slice(1)];
 const hollow=sample([H,[414,387],[420,570],[620,700]],64);
 const waterbase=[...outer,...hollow.slice(1),[730,830],[0,830]];
 const foamcomponents=[supportsheet,...children],watercomponents=[waterbase,...children];
 const outside=sample([[0,830],[0,590],[80,290],[275,215]],192);
 const inside=sample([[730,830],[465,685],[375,430],H],192);
 const bands=[{u:.15,w:.022},{u:.34,w:.014},{u:.57,w:.035},{u:.81,w:.012}].map((p,i)=>{
  const upper=[],lower=[],phase=r()*Math.PI*2;
  for(let j=0;j<outside.length;j++){const t=j/192,u=p.u+.008*Math.sin(t*Math.PI*1.4+phase),h=p.w*(.15+.85*Math.sin(Math.PI*t)**.65)/2;upper.push(mix(outside[j],inside[j],u-h));lower.push(mix(outside[j],inside[j],u+h));}
  return {color:['#2b607f','#346e8b'][i%2],points:[...upper,...lower.toReversed()]};
 });
 const lastP=[roots.at(-1)[0]+20*scales.at(-1),roots.at(-1)[1]-7*scales.at(-1)];
 const routes={W:[497,247],F:[604,279],P:lastP,water:[[497,247],[484,255],[470,270],[460,300]],foam:[[604,279],lastP],provisionalFoamCorridor:6};
 const geometry={children,supportsheet,rootcuts,supportEdge,scales,roots,routes,waterbase,foamcomponents,watercomponents,seam,hollow,bands};
 const finite=[...watercomponents,...foamcomponents,...bands.map(b=>b.points)].every(ps=>ps.every(p=>p.length===2&&p.every(Number.isFinite)));
 if(!finite)throw new Error('P106 nonfinite component geometry');
 const paths=ps=>ps.map(p=>`<path d="${path(p)}"/>`).join('');
 const layer=`<g data-study="P106"><defs><clipPath id="component-water-${seed}">${paths(watercomponents)}</clipPath></defs><g fill="#23485f">${paths(watercomponents)}</g><g clip-path="url(#component-water-${seed})">${bands.map(b=>`<path d="${path(b.points)}" fill="${b.color}"/>`).join('')}</g><g fill="none" stroke="#23485f" stroke-width="3" stroke-linejoin="round">${paths(foamcomponents)}</g><g fill="#eeecd5">${paths(foamcomponents)}</g></g>`;
 const p=baseline.pose,marker=`<g transform="matrix(${p.scaleX} 0 0 ${p.scaleY} ${p.offsetX} ${p.offsetY})">`,start=context.svg.indexOf(marker),end=context.svg.indexOf('</g><g><defs><clipPath id="front-',start);
 if(start<0||end<0)throw new Error('P106 primary replacement interface unavailable');
 const svg=context.svg.slice(0,start)+layer+context.svg.slice(end+4);
 return {seed,baseline,svg,geometry,diagnostics:{finite,scope:'Initial finite check only; component simplicity, union support, corridor coverage and native visual comparison unverified.'}};
}
