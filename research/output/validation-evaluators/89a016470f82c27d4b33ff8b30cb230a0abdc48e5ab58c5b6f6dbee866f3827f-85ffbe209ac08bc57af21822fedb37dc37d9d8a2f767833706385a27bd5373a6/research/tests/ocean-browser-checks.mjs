import {OceanRenderer,DOT_STEP,TILE_WIDTH} from '../../src/render.mjs';
import {WORLD_HEIGHT,sceneFeatures} from '../../src/scene.mjs';
const $=id=>document.getElementById(id);
const digest=a=>{let h=2166136261;for(const v of a)h=Math.imul(h^v,16777619);return h>>>0;};
const percentile=(a,q)=>[...a].sort((x,y)=>x-y)[Math.min(a.length-1,Math.floor(a.length*q))];
const check=(condition,message)=>{if(!condition)throw Error(message);};
const DEFAULT_ENGINE={OceanRenderer,DOT_STEP,TILE_WIDTH,WORLD_HEIGHT,sceneFeatures};
export async function runOceanChecks(canvas,engine=DEFAULT_ENGINE){
  const {OceanRenderer,DOT_STEP,TILE_WIDTH,WORLD_HEIGHT,sceneFeatures}=engine;
  const start=performance.now();let comparisons=0,mismatches=0;
  for(const seed of [0,721,13891])for(const left of [-1024,0,2048]){
   const joint=new OceanRenderer(seed).samples(left,TILE_WIDTH*2);
   const a=new OceanRenderer(seed).samples(left,TILE_WIDTH),b=new OceanRenderer(seed).samples(left+TILE_WIDTH,TILE_WIDTH);
   const cols=TILE_WIDTH/DOT_STEP;
   for(let y=0;y<WORLD_HEIGHT/DOT_STEP;y++)for(let x=0;x<cols*2;x++)if(joint[y*cols*2+x]!== (x<cols?a[y*cols+x]:b[y*cols+x-cols]))mismatches++;
   comparisons++;
  }
  check(mismatches===0,'Independent tiles differ from combined rendering');
  const renderer=new OceanRenderer(721),original=digest(renderer.samples(0,TILE_WIDTH));
  const back={id:'back',seed:937,family:'curl',x:0,y:200,width:600,height:300,layer:1,depth:500};
  const front={id:'front',seed:173,family:'breaker',x:100,y:240,width:600,height:160,layer:2,depth:510};
  const composition=new OceanRenderer(721),backOnly=composition.samples(0,1024,[back]),combined=composition.samples(0,1024,[back,front]);
  const fg=composition.sprite(front),rgba=fg.canvas.getContext('2d').getImageData(0,0,fg.canvas.width,fg.canvas.height).data;
  let occluded=0,occlusionErrors=0;
  for(let y=0;y<fg.canvas.height;y++)for(let x=0;x<fg.canvas.width;x++){
   const i=(y*fg.canvas.width+x)*4,wx=x+fg.x,wy=y+fg.y;
   if(wx<0||wx>=1024/DOT_STEP||wy<0||wy>=WORLD_HEIGHT/DOT_STEP)continue;
   const n=wy*(1024/DOT_STEP)+wx;
   if(rgba[i+3]===255&&rgba[i]===0&&backOnly[n]){occluded++;if(combined[n])occlusionErrors++;}
  }
  check(occluded>0&&occlusionErrors===0,`Foreground black water occlusion: ${occluded} overlapping dots; ${occlusionErrors} errors`);
  let maxTiles=0,maxObjects=0;
  for(let i=0;i<80;i++){
   const left=(i%2===0?1:-1)*i*TILE_WIDTH*3;renderer.prepare(left,left+1536,1);
   maxTiles=Math.max(maxTiles,renderer.tiles.size);maxObjects=Math.max(maxObjects,renderer.objects.size);
   if(i%10===0)await new Promise(requestAnimationFrame);
  }
  check(maxTiles<=7,'Tile cache grew beyond the fixed viewport neighborhood');
  check(maxObjects<160,'Object cache grew beyond expected neighborhood');
  check(digest(renderer.samples(0,TILE_WIDTH))===original,'Evicted world failed to regenerate');
  renderer.reset(721);canvas.style.width=`${innerWidth}px`;canvas.style.height=`${innerHeight}px`;renderer.draw(canvas,0);
  const initial=digest(renderer.samples(0,TILE_WIDTH));renderer.prepare(0,1536,2);check(digest(renderer.samples(0,TILE_WIDTH))===initial,'Raster bucket changed geometry');
  const intervals=[],submit=[];let previous;
  for(let i=0;i<120;i++){
   const now=await new Promise(requestAnimationFrame);if(previous!==undefined)intervals.push(now-previous);previous=now;
   const t=performance.now();renderer.draw(canvas,i*8);submit.push(performance.now()-t);
  }
  const features=sceneFeatures(721,0,1536*10),families=Object.fromEntries(['curl','breaker','band'].map(name=>[name,features.filter(f=>f.family===name).length]));
  const report={date:'2026-10-11',userAgent:navigator.userAgent,viewport:[innerWidth,innerHeight],renderedCanvasCSS:[canvas.clientWidth,canvas.clientHeight],dpr:devicePixelRatio,
   seamComparisons:comparisons,seamMismatchedDots:mismatches,occludedBackgroundDots:occluded,occlusionErrors,
   travelPositions:80,maxRetainedTiles:maxTiles,maxRetainedObjects:maxObjects,regenerationPassed:true,rasterBucketGeometryPassed:true,
   familiesAcrossTenViewWidths:families,frameIntervalMs:{median:percentile(intervals,.5),p95:percentile(intervals,.95),max:Math.max(...intervals)},
   drawSubmissionMs:{median:percentile(submit,.5),p95:percentile(submit,.95),max:Math.max(...submit)},
   tileGenerationMs:{median:percentile(renderer.metrics.tileTimes,.5),p95:percentile(renderer.metrics.tileTimes,.95),max:Math.max(...renderer.metrics.tileTimes)},
   elapsedMs:performance.now()-start,limits:'Single local Chrome-based desktop browser. 120 frame intervals after stress checks; retained-cache counts are not measured process memory. Visual fidelity and cross-browser behavior remain unapproved.'};
  return report;
}
if($('run')&&$('results')&&$('test-canvas'))$('run').onclick=async()=>{
 $('run').disabled=true;$('results').textContent='Running…';
 try{$('results').textContent=JSON.stringify(await runOceanChecks($('test-canvas')),null,2);}
 catch(e){$('results').textContent=`FAILED: ${e.stack}`;}
 finally{$('run').disabled=false;}
};
