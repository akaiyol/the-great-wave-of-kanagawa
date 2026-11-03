import assert from 'node:assert/strict';
import fs from 'node:fs';
import {performance} from 'node:perf_hooks';
import {pack, textOf, waveParams, TileCache} from './core.mjs';
const mapping = [[0,0,1],[0,1,2],[0,2,4],[1,0,8],[1,1,16],[1,2,32],[0,3,64],[1,3,128]];
for (const [x,y,bit] of mapping) {
  const m = new Uint8Array(8); m[y*2+x] = 1;
  assert.equal(pack(m,2,4).cells[0],bit);
}
for (let bits=0; bits<256; bits++) {
  const m = new Uint8Array(8);
  for(const [x,y,bit] of mapping) m[y*2+x] = !!(bits & bit);
  assert.equal(textOf(pack(m,2,4)).charCodeAt(0),0x2800+bits);
}
const cache=new TileCache(i=>waveParams(721,i));
const initial=waveParams(721,0);
for(let i=-1000;i<=1000;i++) cache.visit(i-1,i+3);
cache.visit(-1,3);
assert.deepEqual(cache.tiles.get(0),initial);
assert.equal(cache.peak,5);
assert.notDeepEqual(waveParams(721,1),initial);
const timings=[];
for(const [cols,rows] of [[80,27],[160,54],[240,81]]) {
  const m = Uint8Array.from({length:cols*rows*8},(_,i)=>+(i%13<3));
  for(let n=0;n<20;n++) textOf(pack(m,cols*2,rows*4));
  const start=performance.now();
  for(let n=0;n<200;n++) textOf(pack(m,cols*2,rows*4));
  timings.push({cols,rows,packAndStringMeanMs:(performance.now()-start)/200});
}
const result={passed:true,singleDotMappings:8,exhaustivePatterns:256,
  cachePositions:2001,peakRetainedTiles:cache.peak,regenerationIdentical:true,
  timings,note:'Node CPU microbenchmark only; excludes browser layout, painting and shape generation.'};
fs.writeFileSync(new URL('../output/core-results.json',import.meta.url),JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
