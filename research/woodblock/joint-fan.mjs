import {generateWaterHierarchy} from './water-hierarchy.mjs';
import {generateMeasuredFork} from './measured-fork.mjs';
import {hash,random} from '../../src/random.mjs';
const pt=p=>p.map(v=>Number(v.toFixed(3))).join(',');
const path=p=>'M'+p.map(pt).join(' L')+' Z';
const lerp=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
function cubic(c,t){const s=1-t;return c[0].map((v,i)=>s**3*v+3*s*s*t*c[1][i]+3*s*t*t*c[2][i]+t**3*c[3][i]);}
const curve=(c,n=32)=>Array.from({length:n+1},(_,i)=>cubic(c,i/n));
function openChain(outline){
 const chains=[];let chain=[];
 for(let i=1;i<outline.length;i++){
  const a=outline[i-1],b=outline[i],ai=a[0]>=40,bi=b[0]>=40;
  if(ai!==bi){const cut=lerp(a,b,(40-a[0])/(b[0]-a[0]));cut[0]=40;
   if(bi)chain=[cut,b];else{chain.push(cut);chains.push(chain);chain=[];}
  }else if(bi)chain.push(b);
 }
 if(chain.length)chains.push(chain);
 if(chains.length!==1)throw new Error('P103 requires one exposed x40 chain');
 return chains[0];
}
export function generateJointFan(seed=721){
 const study=generateWaterHierarchy(seed),baseline=study.variant,r=random(hash(seed,0x50313033));
 const vary=(p,a=3)=>p.map(v=>v+(r()-.5)*2*a);
 const roots=[[500,100],[555,165],[605,230],[640,300]].map(p=>vary(p));
 const scales=roots.map(()=>.28+r()*.05);
 const groupchains=roots.map((root,i)=>openChain(generateMeasuredFork(hash(seed,i+103)).outline).map(p=>[root[0]+(p[0]-40)*scales[i],root[1]+(p[1]-67)*scales[i]]));
 const outer=curve([[0,300],vary([150,230]),vary([255,80]),groupchains[0][0]],64);
 outer[outer.length-1]=groupchains[0][0];
 const connectors=[];
 for(let i=0;i<groupchains.length;i++){
  const chain=groupchains[i];if(i)outer.push(...chain.slice(1));else outer.push(...chain.slice(1));
  if(i<groupchains.length-1){
   const a=chain.at(-1),b=groupchains[i+1][0],connector=curve([a,[a[0]+12,a[1]+6],[b[0]-12,b[1]-6],b],16);
   connector[connector.length-1]=b;
   connectors.push(connector);outer.push(...connector.slice(1));
  }
 }
 const H=vary([465,335],2),end=outer.at(-1);
 outer.push(...curve([end,[end[0]-45,end[1]+8],[525,310],H],32).slice(1));
 const hollow=curve([H,[414,387],[420,570],[620,700]],64);
 const body=[...outer,...hollow.slice(1),[730,830],[0,830]];
 // One W water head, with ordered source-related shoulders; no other heads.
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
 const seam=seamControls.flatMap((c,i)=>curve(c,24).slice(i?1:0));
 const foam=[...outer,...seam.slice(1)];
 const outside=curve([[0,830],[0,590],[80,290],[275,215]],192);
 const inside=curve([[730,830],[465,685],[375,430],H],192);
 const bands=[{u:.15,w:.022},{u:.34,w:.014},{u:.57,w:.035},{u:.81,w:.012}].map((p,i)=>{
  const upper=[],lower=[],phase=r()*Math.PI*2;
  for(let j=0;j<outside.length;j++){const t=j/192,u=p.u+.008*Math.sin(t*Math.PI*1.4+phase),h=p.w*(.15+.85*Math.sin(Math.PI*t)**.65)/2;upper.push(lerp(outside[j],inside[j],u-h));lower.push(lerp(outside[j],inside[j],u+h));}
  return {color:['#2b607f','#346e8b'][i%2],points:[...upper,...lower.toReversed()]};
 });
 const routes={water:[[497,247],[484,255],[470,270],[460,300]],foam:[[604,279],[649,302]],provisionalFoamCorridor:6};
 const geometry={body,foam,sharedouter:outer,groupchains,scales,roots,routes,seam,hollow,connectors,bands};
 const finite=[...body,...foam,...bands.flatMap(b=>b.points)].every(p=>p.every(Number.isFinite));
 const sharedRootCoverage=groupchains.map(chain=>chain.every(p=>outer.includes(p)&&body.includes(p)&&foam.includes(p)));
 // Connector endpoints retain the same source sample references.
 // Chain first points are already represented by the preceding connector.
 for(let i=1;i<groupchains.length;i++)sharedRootCoverage[i]=groupchains[i].every(p=>outer.some(q=>q===p||(q[0]===p[0]&&q[1]===p[1])));
 const layer=`<g data-study="P103"><defs><clipPath id="joint-body-${seed}"><path d="${path(body)}"/></clipPath></defs><path d="${path(body)}" fill="#23485f"/><g clip-path="url(#joint-body-${seed})">${bands.map(b=>`<path d="${path(b.points)}" fill="${b.color}"/>`).join('')}</g><path d="${path(foam)}" fill="#eeecd5" stroke="#23485f" stroke-width="1.5" stroke-linejoin="round"/></g>`;
 const p=baseline.pose,marker=`<g transform="matrix(${p.scaleX} 0 0 ${p.scaleY} ${p.offsetX} ${p.offsetY})">`,start=study.svg.indexOf(marker),endIndex=study.svg.indexOf('</g><g><defs><clipPath id="front-',start);
 if(start<0||endIndex<0)throw new Error('P103 primary replacement interface unavailable');
 const svg=study.svg.slice(0,start)+layer+study.svg.slice(endIndex+4);
 const diagnostics={finite,sharedRootCoverage,scaleRange:[Math.min(...scales),Math.max(...scales)],scope:'Initial finite/shared root coverage only; routes, polygon integrity and visual review pending.'};
 if(!finite||!sharedRootCoverage.every(Boolean))throw new Error('P103 finite/shared root preflight failed');
 return {seed,baseline,svg,geometry,diagnostics};
}
