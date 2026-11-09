import {generateLinkedParentInk} from './linked-parent-ink.mjs';
import {cubicBezier,pointInPolygon,segmentsCross,polygonSelfCrossings} from '../../src/procedural/geometry.mjs';
const nodes=[[310, 200], [338, 171], [376, 173], [366, 185], [358, 184], [371, 216], [381, 207], [390, 218], [393, 196], [414, 174], [460, 171], [451, 202], [437, 183], [420, 216], [440, 205]],tangents=[[17, 3], [12, -7], [6, 10], [-6, -4], [-3, 7], [-3, -4], [5, 3], [5, -4], [-4, -9], [11, 1], [5, 12], [-9, -2], [-6, 7], [1, 10], [12, 0]];
const pt=p=>p.map(v=>Number(v.toFixed(3))).join(',');
const path=ps=>'M'+ps.map(pt).join(' L')+' Z';
const same=(a,b)=>a.every((v,i)=>v===b[i]);
const bounds=ps=>[Math.min(...ps.map(p=>p[0])),Math.min(...ps.map(p=>p[1])),Math.max(...ps.map(p=>p[0])),Math.max(...ps.map(p=>p[1]))];
export function generateCrestJunctionGroup(seed=721){
 const baseline=generateLinkedParentInk(seed),g=baseline.baseline.geometry;
 const start=g.seam.findIndex(p=>same(p,[440,205])),end=g.seam.findIndex((p,i)=>i>start&&same(p,[310,200]));
 if(start<0||end<0)throw new Error('P130 exact seam stations unavailable');
 const controls=nodes.slice(0,-1).map((p,i)=>[p,p.map((v,k)=>v+tangents[i][k]),nodes[i+1].map((v,k)=>v-tangents[i+1][k]),nodes[i+1]]);
 const forward=[nodes[0],...controls.flatMap(c=>Array.from({length:48},(_,i)=>i===47?c[3]:cubicBezier(...c,(i+1)/48)))];
 const profile=[...forward].reverse(),seam=[...g.seam.slice(0,start),...profile,...g.seam.slice(end+1)];
 const supportsheet=[...g.outer,...seam.slice(1)],foamcomponents=[supportsheet,...g.children];
 const oldMarkup=`<path d="${path(g.supportsheet)}"/>`,newMarkup=`<path d="${path(supportsheet)}"/>`;
 const replacementCount=baseline.svg.split(oldMarkup).length-1;
 if(replacementCount!==2)throw new Error(`P130 Fsheet replacement count ${replacementCount}, expected 2`);
 const svg=baseline.svg.split(oldMarkup).join(newMarkup).replace('<g data-study="P116">','<g data-study="P116" data-seam-study="P130">');
 let profileCrossings=0;for(let i=0;i<profile.length-1;i++)for(let j=i+2;j<profile.length-1;j++)if(segmentsCross(profile[i],profile[i+1],profile[j],profile[j+1]))profileCrossings++;
 const materialAt=p=>!g.watercomponents.some(poly=>pointInPolygon(p,poly))?'sky':foamcomponents.some(poly=>pointInPolygon(p,poly))?'foam':'blue';
 const controlHullXYXY=bounds(controls.flat()),understrokePaddedFootprintXYXY=controlHullXYXY.map((v,i)=>v+(i<2?-1.5:1.5));
 const diagnostics={finite:[...supportsheet,...controls.flat()].every(p=>p.every(Number.isFinite)),exactEnds:same(profile[0],g.seam[start])&&same(profile.at(-1),g.seam[end]),replacementCount,profileCrossings,fullFsheetCrossings:polygonSelfCrossings(supportsheet),controlHullXYXY,understrokePaddedFootprintXYXY,sampledFootprintXYXY:bounds(profile)};
 return {seed,baseline,svg,geometry:{...g,seam,supportsheet,foamcomponents,nodes,tangents,controls,profile,materialAt},materialAt,diagnostics};
}
