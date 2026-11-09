import fs from 'node:fs';
import {generateSupportCove} from './support-cove.mjs';
import {generateInkParent} from './ink-parent.mjs';
import {hash} from '../../src/random.mjs';
import {pointInPolygon,segmentsCross,pointSegmentDistance} from '../../src/procedural/geometry.mjs';
const scene=generateSupportCove(721),g=scene.baseline.baseline.geometry;
const results=[];
for(let childIndex=1;childIndex<4;childIndex++){
const local=generateInkParent(hash(721,106+childIndex)),child=g.children[childIndex],root=g.roots[childIndex],scale=g.scales[childIndex];
const transform=p=>p.map((v,i)=>root[i]+(v-[40,67][i])*scale);
const polygons=[...local.ink,local.accent].map(ps=>ps.map(transform));
const checks=polygons.map(poly=>{let contacts=0,minClearance=Infinity;for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length];for(let j=0;j<child.length;j++){const c=child[j],d=child[(j+1)%child.length],distance=Math.min(pointSegmentDistance(a,c,d),pointSegmentDistance(b,c,d),pointSegmentDistance(c,a,b),pointSegmentDistance(d,a,b));if(segmentsCross(a,b,c,d)||distance<1e-8)contacts++;minClearance=Math.min(minClearance,distance);}}return{allVerticesInside:poly.every(p=>pointInPolygon(p,child)),boundaryContacts:contacts,minClearance};});
results.push({childIndex,parentSeed:hash(721,106+childIndex),root,scale,polygons,checks,pass:checks.every(c=>c.allVerticesInside&&!c.boundaryContacts)});
}
const out='research/output/agent-phase-2026-11-09/P125';fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/containment.json',JSON.stringify({phase:'P125',pass:results.every(r=>r.pass),results},null,2)+'\n');console.log(JSON.stringify({pass:results.every(r=>r.pass),children:results.map(r=>({i:r.childIndex,checks:r.checks}))}));

const summary={phase:"P125",pass:results.every(r=>r.pass),details:"containment.json",scope:"Complete transformed polygons vs each actual clipped child, not whole-art/variety evidence.",children:results.map(({childIndex,parentSeed,root,scale,checks,pass})=>({childIndex,parentSeed,root,scale,checks,pass}))};
fs.writeFileSync(out+"/containment-summary.json",JSON.stringify(summary,null,2)+"\n");
