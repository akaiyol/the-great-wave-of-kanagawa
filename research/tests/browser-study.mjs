import {pack,textOf,rng,waveParams,TileCache} from './core.mjs';
const $=id=>document.getElementById(id);
const canvas=(w,h)=>Object.assign(document.createElement('canvas'),{width:w,height:h});
const ctx=c=>c.getContext('2d',{willReadFrequently:true});
const font='14px Menlo, monospace', cw=10, ch=20;
function glyphImage(p) {
  const c=canvas(p.cols*cw,p.rows*ch),g=ctx(c);
  g.fillStyle='#fff';g.font=font;g.textBaseline='top';
  for(let y=0;y<p.rows;y++)for(let x=0;x<p.cols;x++) {
    const b=p.cells[y*p.cols+x];
    if(b)g.fillText(String.fromCharCode(0x2800+b),x*cw,y*ch);
  }
  return c;
}
function sample(c,cols,rows) {
  const small=canvas(cols*2,rows*4),s=ctx(small);s.drawImage(c,0,0,small.width,small.height);
  const rgba=s.getImageData(0,0,small.width,small.height).data;
  const mask=Uint8Array.from({length:cols*rows*8},(_,i)=>+(rgba[i*4+3]>100 && rgba[i*4]>127));
  return pack(mask,cols*2,rows*4);
}
const original=new Image();original.src='../references/great-wave-off-kanagawa-met-DP130155.jpg';await original.decode();
const ref=canvas(1000,672),rctx=ctx(ref);rctx.drawImage(original,0,0,1000,672);
const pixels=rctx.getImageData(0,0,1000,672).data;
const bright=canvas(1000,672),bctx=ctx(bright),bi=bctx.createImageData(1000,672);
let skyOn=0,skyN=0,waterOn=0,waterN=0;
for(let y=0;y<672;y++)for(let x=0;x<1000;x++) {
  const i=(y*1000+x)*4,on=.2126*pixels[i]+.7152*pixels[i+1]+.0722*pixels[i+2]>184;
  bi.data[i]=bi.data[i+1]=bi.data[i+2]=255;bi.data[i+3]=on?255:0;
  if(x>650 && x<950 && y>50 && y<250){skyN++;skyOn+=on;}
  if(x>275 && x<325 && y>215 && y<245){waterN++;waterOn+=on;}
}
bctx.putImageData(bi,0,0);
// Hand-marked semantic REGION, not a production segmentation or a traced foam contour.
const gate=canvas(1000,672),gctx=ctx(gate);
const outline=[[0,237],[55,250],[126,193],[200,98],[277,62],[366,54],[441,88],[493,141],[540,153],[565,195],[593,233],[591,272],[560,300],[536,287],[506,254],[490,218],[467,210],[452,224],[433,278],[438,350],[471,425],[504,460],[443,431],[409,390],[386,380],[344,409],[291,433],[246,427],[211,470],[141,458],[93,436],[49,391],[1,373]];
gctx.beginPath();outline.forEach(([x,y],i)=>i?gctx.lineTo(x,y):gctx.moveTo(x,y));gctx.closePath();gctx.fill();
gctx.globalCompositeOperation='source-in';gctx.drawImage(bright,0,0);gctx.globalCompositeOperation='source-over';
function refView(){
  const cols=+$('resolution').value,rows=Math.round(cols*.336);
  for(const [id,input]of [['threshold',bright],['gated',gate]]){
    const c=$(id),p=sample(input,cols,rows);c.width=cols*cw;c.height=rows*ch;ctx(c).drawImage(glyphImage(p),0,0);
  }
  const crest=canvas(610,460);ctx(crest).drawImage(gate,0,0,610,460,0,0,610,460);
  const p=sample(crest,cols,Math.round(cols*460/610/2));
  $('text-sample').textContent=textOf(p);
  const cellWidth=$('sample-shell').clientWidth/cols;
  // Measure the actual fallback Braille glyph, not the ASCII M advance.
  const probe=ctx(canvas(1,1));probe.font='100px Menlo, monospace';
  const advance=probe.measureText('⣿').width;
  $('text-sample').style.fontSize=`${cellWidth*100/advance}px`;
  $('text-sample').style.lineHeight=`${cellWidth*2}px`;
}
$('resolution').onchange=refView;window.addEventListener('resize',refView);refView();
$('reference-result').textContent=`Brightness threshold marks ${(100*skyOn/skyN).toFixed(1)}% of a manually selected sky rectangle and ${(100*waterOn/waterN).toFixed(1)}% of a dark-water rectangle. These are diagnostic regions, not a ground-truth segmentation benchmark.`;

// Closed, overhanging geometry in object coordinates. A static scroll study only.
function drawWave(g,id,seed=721,origin=id*600) {
  const p=waveParams(seed,id),r=rng(p.seed);
  g.save();g.translate(origin,0);g.translate(20,30);g.scale(p.reach,p.height);
  const body=new Path2D('M -100 330 C 80 325 105 70 267 53 C 332 37 398 59 429 133 C 379 104 337 99 320 169 C 296 246 406 303 650 328 L 650 430 L -100 430 Z');
  // Black body explicitly occludes foam behind it while remaining invisible itself.
  g.fillStyle='#000';g.fill(body);
  const foam=new Path2D('M -100 330 C 80 325 105 70 267 53 C 332 37 398 59 429 133 C 385 89 335 79 288 99 C 206 128 183 261 100 308 C 36 340 -30 352 -100 347 Z');
  g.fillStyle='#fff';g.fill(foam);
  // Connected offshoots: roots lie on the cap; unequal length/angle are stable per wave.
  for(let i=0;i<p.fingers;i++) {
    const t=i/(p.fingers-1),x=210+195*t,y=96-30*Math.sin(t*Math.PI)+20*t;
    const len=20+r()*34,wide=7+r()*8;
    g.beginPath();g.moveTo(x-wide,y-12);
    g.bezierCurveTo(x+12,y+2,x+len*.5,y+len*.7,x+len*.15,y+len);
    g.bezierCurveTo(x+len*.9,y+len*.7,x+len*.6,y+len*.15,x+wide,y-9);
    g.closePath();g.fill();
  }
  // Texture is clipped to the foam, so no dots can appear inside dark water/sky.
  g.save();g.clip(foam);g.strokeStyle='#000';g.lineCap='round';
  for(let i=0;i<18;i++) {
    const x=70+i*18;g.lineWidth=2+r()*3;g.beginPath();g.moveTo(x,280-i*11);
    g.bezierCurveTo(x+15,230-i*9,x+15,180-i*6,x+35,145-i*4);g.stroke();
  }
  g.restore();g.restore();
}
const tileCols=120,tileRows=40,tileW=tileCols*cw,tileH=tileRows*ch;
function maskRegion(x,width){
  const c=canvas(width,400),g=ctx(c);g.translate(-x,0);
  for(let id=Math.floor(x/600)-2;id<=Math.floor((x+width)/600)+1;id++)drawWave(g,id);
  return c;
}
function worldData(x,width){
  // Rasterize every OBJECT in a fixed local frame, then composite at integer
  // world-dot offsets. Canvas path rasterization can otherwise change slightly
  // with canvas clipping/translation, even when the mathematical path is equal.
  const dw=width*.4,dh=160,c=canvas(dw,dh),g=ctx(c);
  g.imageSmoothingEnabled=false;
  for(let id=Math.floor(x/600)-2;id<=Math.floor((x+width)/600)+1;id++){
    const sprite=canvas(400,dh),s=ctx(sprite);s.scale(.4,.4);drawWave(s,id,721,100);
    g.drawImage(sprite,id*240-x*.4-40,0);
  }
  const rgba=g.getImageData(0,0,dw,dh).data;
  return pack(Uint8Array.from({length:dw*dh},(_,i)=>+(rgba[i*4+3]>100&&rgba[i*4]>127)),dw,dh);
}
function tileData(id){return worldData(id*600,600);}
function makeTile(id){return glyphImage(tileData(id));}
const cache=new TileCache(makeTile);let camera=0,playing=false,last=0;
const screen=$('strip');
function render(){
  const w=screen.clientWidth,h=screen.clientHeight,dpr=Math.min(devicePixelRatio,2);
  if(screen.width!==Math.round(w*dpr)||screen.height!==Math.round(h*dpr)){screen.width=Math.round(w*dpr);screen.height=Math.round(h*dpr);}
  const g=ctx(screen);g.setTransform(dpr,0,0,dpr,0,0);g.fillStyle='#000';g.fillRect(0,0,w,h);
  const scale=h/tileH,first=Math.floor(camera/tileW),lastId=Math.floor((camera+w/scale)/tileW);
  for(const[id,tile]of cache.visit(first-1,lastId+1))g.drawImage(tile,(id*tileW-camera)*scale,0,tileW*scale,tileH*scale);
  $('status').textContent=`Camera ${camera.toFixed(1)} · ${cache.tiles.size} retained tiles · seed 721 · fixed world-space Braille cells`;
}
function tick(now){if(playing && !document.hidden){camera+=Math.min(50,now-last)*.07;render();}last=now;requestAnimationFrame(tick);}
$('play').onclick=()=>{playing=!playing;$('play').textContent=playing?'Pause':'Play';};
$('next').onclick=()=>{camera+=tileW;render();};$('reset').onclick=()=>{camera=0;render();};
screen.addEventListener('wheel',e=>{e.preventDefault();camera+=e.deltaX||e.deltaY;render();},{passive:false});
window.addEventListener('resize',render);render();requestAnimationFrame(tick);

function percentile(a,q){return [...a].sort((x,y)=>x-y)[Math.min(a.length-1,Math.floor(a.length*q))];}
function digest(cells){let h=2166136261;for(const c of cells)h=Math.imul(h^c,16777619);return h>>>0;}
$('run').onclick=async()=>{
  playing=false;$('play').textContent='Play';$('run').disabled=true;$('results').textContent='Running browser checks…';
  try{
    const start=performance.now();let patternPass=0;
    const dots=[[0,0,1],[0,1,2],[0,2,4],[1,0,8],[1,1,16],[1,2,32],[0,3,64],[1,3,128]];
    for(let n=0;n<256;n++){const m=new Uint8Array(8);for(const[x,y,b]of dots)m[y*2+x]=+(!!(n&b));if(pack(m,2,4).cells[0]===n)patternPass++;}
    // Compare independent neighboring tiles against a single continuous raster of the same world.
    const joint=worldData(0,1200),a=tileData(0),b=tileData(1);let seamDiff=0;const mismatches=[];
    for(let y=0;y<40;y++)for(let x=0;x<240;x++)if(joint.cells[y*240+x]!== (x<120?a.cells[y*120+x]:b.cells[y*120+x-120])){seamDiff++;mismatches.push([x,y]);}
    const regen=digest(a.cells)===digest(tileData(0).cells),times=[];
    for(let i=0;i<24;i++){const t=performance.now();makeTile(i);times.push(performance.now()-t);}
    const top=tileData(0);let topDots=0;for(let i=0;i<top.cols*3;i++)topDots+=+(top.cells[i]!==0);
    const frameTimes=[],submitTimes=[];let prev;
    for(let i=0;i<120;i++){
      await new Promise(resolve=>requestAnimationFrame(t=>{if(prev!==undefined)frameTimes.push(t-prev);prev=t;resolve();}));
      const t=performance.now();camera=i*15;render();submitTimes.push(performance.now()-t);
    }
    const widthProbe=ctx(canvas(1,1));widthProbe.font=font;
    const report={userAgent:navigator.userAgent,viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,
      patternsPassed:patternPass,patternsTotal:256,neighborTileMismatchedCells:seamDiff,mismatchCoordinates:mismatches,
      repeatedTileIdentical:regen,topThreeRowsNonemptyCells:topDots,
      cachedTileDimensions:[tileW,tileH],retainedTiles:cache.tiles.size,peakRetainedTiles:cache.peak,
      estimatedRetainedRGBAMiB:cache.peak*tileW*tileH*4/1048576,
      tileGenerationMs:{median:percentile(times,.5),p95:percentile(times,.95),max:Math.max(...times)},
      frameIntervalMs:{median:percentile(frameTimes,.5),p95:percentile(frameTimes,.95),max:Math.max(...frameTimes)},
      drawSubmissionMs:{median:percentile(submitTimes,.5),p95:percentile(submitTimes,.95),max:Math.max(...submitTimes)},
      glyphAdvance:{blank:widthProbe.measureText('⠀').width,full:widthProbe.measureText('⣿').width,asciiM:widthProbe.measureText('M').width},
      skyThresholdPercent:100*skyOn/skyN,elapsedMs:performance.now()-start,
      limits:'Single local browser, 120 frames, synthetic waves; timing is not a mobile hardware or long-duration performance guarantee. Draw submission excludes asynchronous GPU completion.'};
    $('results').textContent=JSON.stringify(report,null,2);camera=0;render();
  }catch(e){$('results').textContent=e.stack;throw e;}finally{$('run').disabled=false;}
};
