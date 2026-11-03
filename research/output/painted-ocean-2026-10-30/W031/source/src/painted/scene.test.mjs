import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {OceanScene} from './scene.mjs';
const assets=JSON.parse(readFileSync(new URL('../../assets/woodblock/manifest.json',import.meta.url))).assets;
test('Return travel and independent instances reproduce full feature data',()=>{
  const a=new OceanScene(1847,assets),b=new OceanScene(1847,assets),first=a.query(-500,1600);
  for(const x of [90000,-74000,10000000,-10000000])a.query(x,x+1600);
  assert.deepEqual(a.query(-500,1600),first);assert.deepEqual(b.query(-500,1600),first);
});
test('Query includes every overlapping full sprite, including neighboring overhang',()=>{
  for(const seed of [0,1,1847,4294967295]){
    const scene=new OceanScene(seed,assets);
    for(let x=-22000;x<22000;x+=1300){
      const brute=[];
      for(let i=-15;i<=15;i++)for(const f of [...scene.surface(i),...scene.region(i).features])if(f.bounds.left<=x+1600&&f.bounds.right>=x)brute.push(f.id);
      assert.deepEqual(scene.query(x,x+1600).features.map(f=>f.id).sort(),brute.sort());
    }
  }
});
test('Regions contain quiet and breaking groups without curls in every region',()=>{
  const s=new OceanScene(1847,assets),regions=Array.from({length:80},(_,i)=>s.region(i-40));
  assert.ok(regions.some(r=>r.type==='open'));assert.ok(regions.some(r=>r.type==='breakers'));assert.ok(regions.some(r=>r.type==='rolling'));
  const curls=regions.filter(r=>r.features.some(f=>f.family==='curl')).length;assert.ok(curls>1&&curls<25);
  assert.notDeepEqual(s.query(5000,7000),new OceanScene(1850,assets).query(5000,7000));
});
test('Opaque feet anchor uniform transforms; IDs unique and depth ordered',()=>{
  const s=new OceanScene(1234,assets),q=s.query(-5000,9000);
  assert.equal(new Set(q.features.map(f=>f.id)).size,q.features.length);
  for(let i=0;i<q.features.length;i++){
    const f=q.features[i],a=assets.find(a=>a.family===f.family),scale=f.width/a.width;
    assert.ok(Math.abs(f.height/a.height-scale)<1e-10);assert.ok(Math.abs(f.y+a.nearOpaqueBounds[3]*scale-f.foot)<1e-9);
    if(i)assert.ok(q.features[i-1].foot<=f.foot);
  }
  assert.equal(s.snapshot(0,1600).cacheCounts.regions,0);
});
