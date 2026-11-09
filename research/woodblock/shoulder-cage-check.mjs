import fs from 'node:fs';
import{generateInkParent}from'./ink-parent.mjs';
import{generateSupportCove}from'./support-cove.mjs';
import{hash}from'../../src/random.mjs';
import{pointInPolygon,polygonClearance}from'../../src/procedural/geometry.mjs';
const g=generateSupportCove(721).baseline.baseline.geometry;
const audit=g.roots.map((root,i)=>{const local=generateInkParent(hash(721,106+i));const child=g.children[i].map(p=>p.map((v,k)=>(v-root[k])/g.scales[i]+[40,67][k]));const end=f=>local.curves.find(c=>c.feature===f).controls[3];const cage=[child[0],end('P-upper'),end('A-inner'),end('J-left')];let witness=null;for(let e=0;e<4&&!witness;e++)for(let k=1;k<500;k++){const t=k/500,p=cage[e].map((v,j)=>v+(cage[(e+1)%4][j]-v)*t),distance=polygonClearance(p,child);if(!pointInPolygon(p,child)&&distance>1e-8){witness={edge:e,t,point:p,distanceFromParentBoundary:distance};break;}}return{childIndex:i,cage,allMarkVerticesInsideCage:[...local.ink,local.accent].flat().every(p=>pointInPolygon(p,cage)),outsideWitness:witness};});
const result={phase:'P127',status:audit.some(a=>a.outsideWitness)?'fail_actual_material_patch':'unverified_requires_complete_edge_partition',audit,scope:'A positive-clearance outside witness is a counterexample. Absence of sampled failure would NOT prove containment; complete intersection-partition test would be required.',prototypeRun:false,targetsChanged:false,nextAction:'Stop declared quad construction before worker dispatch; do not move corners or weaken wholepatch requirement.'};
fs.writeFileSync('research/woodblock/shoulder-cage-gate.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
