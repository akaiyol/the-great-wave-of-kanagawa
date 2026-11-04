import test from 'node:test';
import assert from 'node:assert/strict';
import {generateWave,waveSvg,normalizedGeometry} from './study.mjs';
import {generateIntegratedCrest} from './integrated-crest.mjs';
import {pointInPolygon,cubicBezier} from './geometry.mjs';

const seeds=[0,1,721,1847,13891,4294967295,5,11];
// Exercise the same direct Array.map call used by the gallery.
const fixtures=seeds.map(generateWave);
const signature=p=>JSON.stringify(normalizedGeometry(p));

for(const p of fixtures)test(`integrated gallery fixture ${p.seed} passes current combined checks`,()=>{
 assert.equal(p.valid,true,p.reasons.join('; '));
 assert.deepEqual(p.reasons,[]);
 assert.equal(p.groupCount,'all');
 assert.equal(p.diagnostics.variant,'interlocked');
 assert.equal(p.grafts.length,p.wave.frontGroups.length);
 assert.ok(p.bodyPolygons.length>1&&p.foamPolygons.length>1);
 for(const h of p.innerBayHeads){
  assert.ok(p.bodyPolygons.some(poly=>pointInPolygon(h.witness,poly)));
  assert.ok(!p.foamPolygons.some(poly=>pointInPolygon(h.witness,poly)));
 }
 for(const g of p.grafts)assert.ok(pointInPolygon(cubicBezier(...g.branches[0].controls,.03),p.baseFoam));
 const points=[...p.bodyPolygons,...p.foamPolygons].flat();
 assert.deepEqual(p.bounds,{minX:Math.min(...points.map(q=>q[0])),maxX:Math.max(...points.map(q=>q[0])),minY:Math.min(...points.map(q=>q[1])),maxY:Math.max(...points.map(q=>q[1]))});
 assert.ok(points.every(([x,y])=>x>=-1e-6&&x<=1200+1e-6&&y>=0&&y<=800));
});

test('adapter exposes the actual integrated construction without substituting a fallback',()=>{
 const p=fixtures[2],actual=generateIntegratedCrest(721,'all','interlocked',{branchCreases:true});
 assert.deepEqual(p.bodyPolygons,actual.bodyPolygons);
 assert.deepEqual(p.foamPolygons,actual.foamPolygons);
 assert.deepEqual(p.inkSeams,actual.inkSeams);
 assert.equal(p.topology,p.wave.topology);
 assert.equal(p.profile,p.wave.profile);
 assert.equal(p.continuity,p.wave.continuity);
});

test('full normalized geometry and fingerprint reproduce deterministically',()=>{
 const p=fixtures[2],again=generateWave(721);
 assert.equal(signature(p),signature(again));
 assert.equal(p.fingerprint,again.fingerprint);
 assert.equal(waveSvg(p),waveSvg(again));
});

test('seed, IDs, topology, diagnostics and stale base geometry do not distinguish signatures',()=>{
 const p=fixtures[2];
 const altered={...p,seed:9,fingerprint:'changed',valid:false,reasons:['changed'],topology:{changed:true},profile:{changed:true},continuity:{changed:true},diagnostics:{changed:true},branches:p.branches.map(b=>({...b,id:'other',parentId:'other'})),wave:{...p.wave,seed:9,topology:{changed:true},body:[[99,99]],cap:[[98,98]],diagnostics:{changed:true}},inkSeams:p.inkSeams.map(s=>({...s,ownerId:'other',diagnostics:{changed:true}}))};
 assert.equal(signature(p),signature(altered));
});

test('an actual graft branch change distinguishes the normalized geometry',()=>{
 const p=fixtures[2],bodyPolygons=p.bodyPolygons.map(poly=>poly.map(q=>q.slice()));
 bodyPolygons[1][10][0]+=.25;
 assert.notEqual(signature(p),signature({...p,bodyPolygons}));
 const foamPolygons=p.foamPolygons.map(poly=>poly.map(q=>q.slice()));
 foamPolygons[1][10][1]+=.25;
 assert.notEqual(signature(p),signature({...p,foamPolygons}));
});

test('current ink points and stroke width contribute to signatures',()=>{
 // Supply a controlled seam to isolate point and width signature changes.
 // Supply an explicit seam to test the adapter's supported geometry input.
 const base=fixtures[2],p={...base,inkSeams:[{points:base.branches[0].points.slice(0,3),strokeWidth:1}]};
 const seams=p.inkSeams.map(s=>({...s,points:s.points.map(q=>q.slice())}));
 seams[0].strokeWidth+=.2;
 assert.notEqual(signature(p),signature({...p,inkSeams:seams}));
 seams[0].strokeWidth=p.inkSeams[0].strokeWidth;
 seams[0].points[0][0]+=.25;
 assert.notEqual(signature(p),signature({...p,inkSeams:seams}));
});

test('six default fixtures have distinct full actual geometry signatures',()=>{
 assert.equal(new Set(fixtures.slice(0,6).map(signature)).size,6);
});

test('invalid seeds are rejected without producing substitute geometry',()=>{
 for(const seed of [-1,4294967296,1.5,NaN,Infinity,null,'721'])assert.throws(()=>generateWave(seed),RangeError);
});

test('collection SVGs reference their own integrated water clipping path',()=>{
 for(const p of fixtures.slice(0,6)){
  const svg=waveSvg(p);
  assert.ok(svg.includes(`id="graft-water-${p.seed}"`));
  assert.ok(svg.includes(`clip-path="url(#graft-water-${p.seed})"`));
 }
});
