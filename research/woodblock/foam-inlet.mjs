import {generateSourceHead} from './source-head.mjs';
import {pointInPolygon} from '../../src/procedural/geometry.mjs';
// Exact sparse recipe from research/proposals/P114-foam-inlet-curves.json.
export const sourceCurves=[[[1060,595],[1088,599],[1102,616],[1105,634]],[[1105,634],[1109,647],[1124,650],[1136,661]],[[1136,661],[1150,674],[1148,692],[1135,710]],[[1135,710],[1130,707],[1127,706],[1120,705]],[[1120,705],[1130,690],[1132,680],[1124,671]],[[1124,671],[1113,662],[1097,657],[1091,640]],[[1091,640],[1081,620],[1071,621],[1040,620]]];
const map=p=>[p[0]*1200/3859,p[1]*800/2594];
const pt=p=>p.map(v=>Number(v.toFixed(3))).join(',');
const line=ps=>'M'+ps.map(pt).join(' L');
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
function cubic(c,t){const s=1-t;return c[0].map((v,i)=>s**3*v+3*s*s*t*c[1][i]+3*s*t*t*c[2][i]+t**3*c[3][i]);}
export function generateFoamInlet(seed=721){
 const baseline=generateSourceHead(seed),g=baseline.geometry;
 const curves=sourceCurves.map(c=>c.map(map));
 const polygon=curves.flatMap((c,i)=>Array.from({length:33},(_,j)=>j===0?c[0]:j===32?c[3]:cubic(c,j/32)).slice(i?1:0));
 const outside=p=>!g.foamcomponents.some(poly=>pointInPolygon(p,poly));
 const flags=polygon.map(outside),starts=flags.flatMap((flag,i)=>flag&&(i===0||!flags[i-1])?[i]:[]);
 if(starts.length!==1)throw new Error('P114 requires one contiguous exposed interval');
 const first=starts[0];let last=first;while(last+1<flags.length&&flags[last+1])last++;
 if(first===0||last===flags.length-1)throw new Error('P114 root ends must lie inside original foam');
 function intersection(insidePoint,outsidePoint){
  let a=insidePoint,b=outsidePoint;
  for(let i=0;i<20;i++){const mid=mix(a,b,.5);if(outside(mid))b=mid;else a=mid;}
  return mix(a,b,.5);
 }
 const rootIntersections=[intersection(polygon[first-1],polygon[first]),intersection(polygon[last+1],polygon[last])];
 const exposed=[rootIntersections[0],...polygon.slice(first,last+1),rootIntersections[1]];
 const finite=[...polygon,...exposed].every(p=>p.length===2&&p.every(Number.isFinite));
 if(!finite)throw new Error('P114 nonfinite inlet');
 const marker='</g><g><defs><clipPath id="front-',at=baseline.svg.indexOf(marker);
 if(at<0)throw new Error('P114 primary-end SVG interface unavailable');
 const layer=`<g data-inlet="P114"><path d="${line(polygon)} Z" fill="#eeecd5"/><path d="${line(exposed)}" fill="none" stroke="#23485f" stroke-width="1.5" stroke-linejoin="round"/></g>`;
 const svg=baseline.svg.slice(0,at)+layer+baseline.svg.slice(at);
 const geometry={...g,foamcomponents:[...g.foamcomponents,polygon],inlet:{polygon,exposed,rootIntersections,sourceCurves}};
 return {seed,baseline,svg,geometry,diagnostics:{finite}};
}
