import fs from 'node:fs';
import {generateCrestJunctionRepair,path,area} from './crest-junction-repair.mjs';
import {pointInPolygon,pointSegmentDistance,segmentsCross} from '../../src/procedural/geometry.mjs';
const dist=(a,b,c,d)=>segmentsCross(a,b,c,d)?0:Math.min(pointSegmentDistance(a,c,d),pointSegmentDistance(b,c,d),pointSegmentDistance(c,a,b),pointSegmentDistance(d,a,b));
const same=(a,b)=>Math.hypot(...a.map((v,k)=>v-b[k]))<1e-9;
const clean=ps=>{const p=ps.filter((v,i)=>!i||!same(v,ps[i-1]));if(same(p[0],p.at(-1)))p.pop();return p;};
function contacts(ps,closed){const p=closed?clean(ps):ps,n=p.length-(closed?0:1);let crossings=0,touches=0;for(let i=0;i<n;i++)for(let j=i+2;j<n;j++)if(!(closed&&i===0&&j===n-1)){const a=p[i],b=p[(i+1)%p.length],c=p[j],d=p[(j+1)%p.length];if(segmentsCross(a,b,c,d))crossings++;else if(dist(a,b,c,d)<1e-8)touches++;}return {crossings,touches,pass:!crossings&&!touches};}
const study=generateCrestJunctionRepair(),g=study.geometry,old=study.baseline.baseline.geometry;
const blue=[...g.waterbase.slice(g.outer.length-1),...g.seam.toReversed().slice(0,-1)];
const rounded=p=>p.map(q=>q.map(v=>Number(v.toFixed(3))));
const shapes={profile:g.profile,Fsheet:g.supportsheet,mainBlue:blue},integrity={};for(const [k,p] of Object.entries(shapes))integrity[k]={raw:contacts(p,k!=='profile'),serialized:contacts(rounded(p),k!=='profile')};
let inside=true;for(let i=1;i<g.profile.length;i++){const a=g.profile[i-1],b=g.profile[i];for(const p of [a,b,a.map((v,k)=>(v+b[k])/2)])inside&&=pointInPolygon(p,g.waterbase);for(let j=0;j<g.waterbase.length;j++)if(segmentsCross(a,b,g.waterbase[j],g.waterbase[(j+1)%g.waterbase.length]))inside=false;}
const areaResidual=Math.abs(area(g.supportsheet)+area(blue)-area(g.waterbase));
const roles={W:'blue',F:'foam',S:'sky'},probes=Object.fromEntries(Object.entries(roles).map(([k,role])=>[k,{count:g.routes[k].probes.length,failed:g.routes[k].probes.filter(p=>study.materialAt(p.point)!==role).length}]));
const oldMarkup=`<path d="${path(old.supportsheet)}"/>`,newMarkup=`<path d="${path(g.supportsheet)}"/>`;
const restored=study.svg.split(newMarkup).join(oldMarkup).replace(' data-seam-study="P130"','').replace(' data-integrity-study="P131"','');
const byteExact=restored===study.baseline.svg,frozen=['waterbase','outer','children','watercomponents','band'].every(k=>g[k]===old[k]),deterministic=study.svg===generateCrestJunctionRepair().svg;
const pass=Object.values(integrity).every(v=>v.raw.pass&&v.serialized.pass)&&inside&&areaResidual<=1e-6&&Object.values(probes).every(v=>!v.failed)&&byteExact&&frozen&&deterministic;
const summary={phase:'P131',pass,cleanup:study.cleanup,integrity,profileInsideBody:inside,areaResidual,probes,byteExact,frozen,deterministic};
const out=process.argv[2]||'research/output/agent-phase-2026-11-09/P131';fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/summary.json',JSON.stringify(summary,null,2)+'\n');fs.writeFileSync(out+'/details.json',JSON.stringify({geometry:g,mainBlue:blue,cleanup:study.cleanup})+'\n');if(pass)fs.writeFileSync(out+'/candidate.svg',study.svg);else if(fs.existsSync(out+'/candidate.svg'))fs.unlinkSync(out+'/candidate.svg');console.log(JSON.stringify(summary));if(!pass)process.exitCode=1;
