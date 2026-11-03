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
      for(let i=-15;i<=15;i++)for(const f of scene.region(i).features)if(f.bounds.left<=x+1600&&f.bounds.right>=x)brute.push(f.id);
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

test('Opaque quiet patches overlap without reflection in both travel directions',async()=>{
  const {waterTiles,WATER_STEP,WATER_TILE_WIDTH}=await import('./material.mjs');
  for(const left of [-10000000,-1800,-1,0,1480,3200,10000000]){
    const tiles=waterTiles(left,left+1600);
    assert.ok(tiles.length<=4);assert.ok(tiles[0].x<=left);assert.ok(tiles.at(-1).x+WATER_TILE_WIDTH>=left+1600);
    for(let i=1;i<tiles.length;i++){
      assert.ok(Math.abs((tiles[i].x-tiles[i-1].x)-WATER_STEP)<1e-8);
      assert.ok(tiles[i].x<tiles[i-1].x+WATER_TILE_WIDTH);
      assert.equal(tiles[i].reflected,undefined);
    }
    const shared=waterTiles(left+100,left+1700);
    for(const tile of tiles)if(shared.some(t=>t.id===tile.id))assert.deepEqual(shared.find(t=>t.id===tile.id),tile);
  }
});
test('Quiet ridge uses complete curved source anchors and image cache remains fixed',async()=>{
  const {WATER_RIDGE,WATER_SOURCE_WIDTH,WATER_SOURCE_HEIGHT}=await import('./material.mjs');
  assert.deepEqual(WATER_RIDGE[0],[0,224]);assert.equal(WATER_RIDGE.at(-1).at(-2),WATER_SOURCE_WIDTH);
  for(const segment of WATER_RIDGE.slice(1)){assert.equal(segment.length,6);assert.ok(segment.filter((_,i)=>i%2===1).every(y=>y>0&&y<WATER_SOURCE_HEIGHT));}
  assert.equal(new OceanScene(721,assets).snapshot(3200,4800).cacheCounts.images,6);
});


test('Rolling groups alternate distinct low and swell anatomy with bounded density',()=>{
  let checked=0;
  for(const seed of [0,721,1847,13891]){
    const scene=new OceanScene(seed,assets);
    for(let i=2;i<40;i++){
      const region=scene.region(i);
      if(region.type!=='rolling')continue;
      checked++;assert.ok(region.features.length>=2&&region.features.length<=3);
      assert.deepEqual(new Set(region.features.map(f=>f.family)),new Set(['low','swell']));
      for(let j=1;j<region.features.length;j++){
        assert.notEqual(region.features[j-1].family,region.features[j].family);
        assert.ok(region.features[j].x-region.features[j-1].x>820);
      }
    }
  }
  assert.ok(checked>20);
});
test('Repeated-bank failure view contains distinct constructions while landing remains intact',()=>{
  const s=new OceanScene(721,assets),q=s.query(7200,8793);
  assert.ok(q.features.some(f=>f.family==='low'));assert.ok(q.features.some(f=>f.family==='swell'));
  assert.deepEqual(s.region(0).features.map(f=>[f.id,f.family]),[['0:hero','curl'],['0:distance','swell'],['0:fore-left','breaker'],['0:fore-right','swell']]);
  assert.equal(s.region(0).features[0].foot,980);
});

test('Opaque skyline preserves the opening hollow and remains continuous at direct joins',async()=>{
  const {waterBoundary,WATER_STEP}=await import('./material.mjs');
  assert.ok(waterBoundary(940)>740);assert.ok(waterBoundary(4000)<650);
  for(const join of [-WATER_STEP,0,WATER_STEP,2*WATER_STEP])assert.ok(Math.abs(waterBoundary(join-.01)-waterBoundary(join+.01))<.02);
  for(const worldX of [-4000,0,940,3200,4000])assert.ok(Number.isFinite(waterBoundary(worldX)));
});

test('Opaque seam follows a matching paint corridor without alpha blending',async()=>{
  const {waterSeam}=await import('./material.mjs');
  const width=160,height=30,overlap=80,pixels=new Uint8ClampedArray(width*height*4);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const value=x<overlap?0:255,index=(y*width+x)*4;
    pixels[index]=pixels[index+1]=pixels[index+2]=value;pixels[index+3]=255;
  }
  for(let y=0;y<height;y++)pixels.fill(0,(y*width+overlap+39)*4,(y*width+overlap+40)*4);
  assert.deepEqual([...waterSeam(pixels,width,height,overlap)],Array(height).fill(39));
});
