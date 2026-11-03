import test from 'node:test';
import assert from 'node:assert/strict';
import {sceneFeatures,regionFeatures,featureBounds,REGION_WIDTH,MAX_EXTENT} from '../src/scene.mjs';
import {waveGeometry,geometryBounds} from '../src/geometry.mjs';

test('world content is independent of query order and bounds',()=>{
  for(const seed of [0,721,13891,0xffffffff])for(const left of [-3072,-512,0,512,7168]){
    const joint=sceneFeatures(seed,left,left+1024),a=sceneFeatures(seed,left,left+512),b=sceneFeatures(seed,left+512,left+1024);
    const unique=[...new Map([...b,...a].map(f=>[f.id,f])).values()].sort((x,y)=>x.id<y.id?-1:1);
    assert.deepEqual([...joint].sort((x,y)=>x.id<y.id?-1:1),unique);
    assert.deepEqual(sceneFeatures(seed,left,left+1024),joint);
  }
});
test('generated geometry is finite and contained by query bounds',()=>{
  let checked=0;
  for(const seed of [0,721,13891,0xffffffff])for(let region=-5;region<=10;region++)for(const f of regionFeatures(seed,region)){
    const g=waveGeometry(f),b=geometryBounds(g),query=featureBounds(f);
    assert.ok(Object.values(b).every(Number.isFinite));
    assert.ok(f.x+b.left>=query.left&&f.x+b.right<=query.right&&f.y+b.top>=query.top&&f.y+b.bottom<=query.bottom,`${f.id}: geometry outside bounds`);
    assert.ok(query.right-f.x<MAX_EXTENT&&f.x-query.left<MAX_EXTENT);
    assert.ok(g.foam.length>0);assert.deepEqual(waveGeometry(f),g);checked++;
  }
  assert.ok(checked>200);
});
test('different construction families and uneven intervals occur across a wide ocean',()=>{
  const features=sceneFeatures(721,0,REGION_WIDTH*20);
  assert.deepEqual(new Set(features.map(f=>f.family)),new Set(['curl','breaker','band']));
  const foreground=features.filter(f=>f.layer===2).sort((a,b)=>a.x-b.x);
  assert.ok(foreground.length>4);assert.ok(new Set(foreground.slice(1).map((f,i)=>f.x-foreground[i].x)).size>3);
  assert.notDeepEqual(sceneFeatures(722,0,REGION_WIDTH),sceneFeatures(721,0,REGION_WIDTH));
});
