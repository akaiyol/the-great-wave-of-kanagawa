import test from 'node:test';
import assert from 'node:assert/strict';
import {generateIntegratedCrest,integratedCrestSvg} from './integrated-crest.mjs';
import {buildBranchCreases,creaseClearance,creasePairGap} from './branch-creases.mjs';
import {cubicBezier,lerp,pointInPolygon,polygonClearance} from './geometry.mjs';
const data=v=>JSON.parse(JSON.stringify(v));
for(const seed of [0,1,721,1847,13891,4294967295,5,11])test(`branch creases ${seed}: contained, deterministic, geometry unchanged`,()=>{
 const baseline=generateIntegratedCrest(seed,'all','interlocked');
 const off=generateIntegratedCrest(seed,'all','interlocked',{branchCreases:false});
 const on=generateIntegratedCrest(seed,'all','interlocked',{branchCreases:true});
 assert.deepEqual(data(off),data(baseline));
 assert.deepEqual(data(on),data(generateIntegratedCrest(seed,'all','interlocked',{branchCreases:true})));
 const {inkSeams,diagnostics,...geometry}=on;
 assert.deepEqual(data(geometry),data((({inkSeams,diagnostics,...rest})=>rest)(off)));
 assert.ok(integratedCrestSvg(on).includes('stroke-linecap="round"'));
 assert.equal(diagnostics.branchCreases.length,on.branches.filter(b=>b.parentId!=='cap').length);
 const seams=inkSeams.slice(off.inkSeams.length);assert.ok(seams.length>0);
 for(const seam of seams){
  const branch=on.branches.find(b=>b.id===seam.ownerId),d=diagnostics.branchCreases.find(d=>d.ownerId===branch.id);
  assert.ok(seam.points.flat().every(Number.isFinite));assert.ok(seam.strokeWidth>=1&&seam.strokeWidth<=2);assert.ok(d.arcLength>=5);
  assert.ok(creaseClearance(seam.points,branch.points,seam.strokeWidth).safe);
  seam.points.forEach((p,i)=>assert.ok(Math.hypot(...p.map((x,k)=>x-cubicBezier(...branch.controls,d.retainedInterval[0]+(d.retainedInterval[1]-d.retainedInterval[0])*i/(seam.points.length-1))[k]))<1e-9));
  for(let i=1;i<seam.points.length;i++)for(let j=0;j<=20;j++){
   const p=lerp(seam.points[i-1],seam.points[i],j/20);
   assert.ok(pointInPolygon(p,branch.points));assert.ok(polygonClearance(p,branch.points)>=seam.strokeWidth/2+1);
  }
 }
 for(let i=0;i<seams.length;i++)for(let j=i+1;j<seams.length;j++)assert.ok(creasePairGap(seams[i],seams[j])>=Math.max(seams[i].strokeWidth,seams[j].strokeWidth));
});
test('too small child explicitly omits crease',()=>{
 const branch={id:'tiny',parentId:'parent',rootWidth:1,tipWidth:.2,controls:[[0,0],[1,0],[2,0],[3,0]],points:[[0,-.5],[3,-.5],[3,.5],[0,.5]]};
 const result=buildBranchCreases([branch]);assert.equal(result.inkSeams.length,0);assert.ok(result.diagnostics[0].reason);
});
