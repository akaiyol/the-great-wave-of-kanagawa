import {sceneFeatures,WORLD_HEIGHT} from './scene.mjs';
import {waveGeometry,geometryBounds} from './geometry.mjs';
export const DOT_STEP=4,TILE_WIDTH=512;
const create=(w,h)=>Object.assign(document.createElement('canvas'),{width:w,height:h});
const ctx=c=>c.getContext('2d',{willReadFrequently:true});
export function drawPath(g,commands){g.beginPath();for(const [op,...v]of commands){if(op==='M')g.moveTo(...v);else if(op==='L')g.lineTo(...v);else if(op==='C')g.bezierCurveTo(...v);else if(op==='Z')g.closePath();}g.fill();}
export function drawDotSamples(g,samples,cols,rows){
  g.fillStyle='#fff';g.beginPath();
  for(let row=0;row<rows;row++)for(let col=0;col<cols;col++)if(samples[row*cols+col]){
    const x=col*DOT_STEP+DOT_STEP/2,y=row*DOT_STEP+DOT_STEP/2;g.moveTo(x+1.15,y);g.arc(x,y,1.15,0,Math.PI*2);
  }
  g.fill();
}

export class OceanRenderer {
  constructor(seed=721) {this.seed=seed;this.tiles=new Map();this.objects=new Map();this.bucket=1;this.window=null;this.metrics={tileTimes:[],peakTiles:0,peakObjects:0};}
  reset(seed=this.seed){this.seed=seed;this.tiles.clear();this.objects.clear();this.window=null;this.metrics={tileTimes:[],peakTiles:0,peakObjects:0};}
  sprite(feature){
    if(this.objects.has(feature.id))return this.objects.get(feature.id);
    const geometry=waveGeometry(feature),b=geometryBounds(geometry);
    const x=Math.floor((feature.x+b.left)/DOT_STEP),y=Math.floor((feature.y+b.top)/DOT_STEP);
    const width=Math.ceil((feature.x+b.right)/DOT_STEP)-x,height=Math.ceil((feature.y+b.bottom)/DOT_STEP)-y;
    const c=create(width,height),g=ctx(c),foam=create(width,height),fg=ctx(foam);
    for(const context of [g,fg]){context.scale(1/DOT_STEP,1/DOT_STEP);context.translate(feature.x-x*DOT_STEP,feature.y-y*DOT_STEP);}
    g.fillStyle='#000';drawPath(g,geometry.body);
    fg.fillStyle='#fff';for(const shape of geometry.foam)drawPath(fg,shape);
    fg.globalCompositeOperation='destination-out';for(const hole of geometry.holes)drawPath(fg,hole);
    fg.globalCompositeOperation='source-over';for(const [px,py,rx,ry]of geometry.spray){fg.beginPath();fg.ellipse(px,py,rx,ry,0,0,Math.PI*2);fg.fill();}
    g.setTransform(1,0,0,1,0,0);g.drawImage(foam,0,0);
    const sprite={canvas:c,x,y};this.objects.set(feature.id,sprite);this.metrics.peakObjects=Math.max(this.metrics.peakObjects,this.objects.size);return sprite;
  }
  samples(left,width,features=sceneFeatures(this.seed,left,left+width)){
    if(left%TILE_WIDTH||width%TILE_WIDTH)throw new RangeError('Samples require tile-aligned intervals');
    const c=create(width/DOT_STEP,WORLD_HEIGHT/DOT_STEP),g=ctx(c);g.imageSmoothingEnabled=false;
    for(const feature of features) {const s=this.sprite(feature);g.drawImage(s.canvas,s.x-left/DOT_STEP,s.y);}
    const pixels=g.getImageData(0,0,c.width,c.height).data;
    return Uint8Array.from({length:c.width*c.height},(_,i)=>+(pixels[i*4+3]>=128&&pixels[i*4]>=128));
  }
  tile(id){
    if(this.tiles.has(id))return this.tiles.get(id);
    const start=performance.now(),samples=this.samples(id*TILE_WIDTH,TILE_WIDTH);
    const c=create(TILE_WIDTH*this.bucket,WORLD_HEIGHT*this.bucket),g=ctx(c);
    g.scale(this.bucket,this.bucket);
    // Two columns and four rows per Braille cell, drawn directly as circles.
    drawDotSamples(g,samples,TILE_WIDTH/DOT_STEP,WORLD_HEIGHT/DOT_STEP);
    this.tiles.set(id,c);this.metrics.tileTimes.push(performance.now()-start);if(this.metrics.tileTimes.length>128)this.metrics.tileTimes.shift();
    this.metrics.peakTiles=Math.max(this.metrics.peakTiles,this.tiles.size);return c;
  }
  prepare(left,right,bucket=1){
    if(bucket!==this.bucket){this.bucket=bucket;this.tiles.clear();}
    const first=Math.floor(left/TILE_WIDTH)-1,last=Math.floor(right/TILE_WIDTH)+1;
    const key=`${first}:${last}:${bucket}`;
    if(this.window===key)return {first,last};
    for(const id of this.tiles.keys())if(id<first||id>last)this.tiles.delete(id);
    const features=sceneFeatures(this.seed,first*TILE_WIDTH,(last+1)*TILE_WIDTH),keep=new Set(features.map(f=>f.id));
    for(const id of this.objects.keys())if(!keep.has(id))this.objects.delete(id);
    for(let id=first;id<=last;id++)this.tile(id);
    this.window=key;
    return {first,last};
  }
  draw(canvas,camera){
    const width=canvas.clientWidth,height=canvas.clientHeight,dpr=Math.min(window.devicePixelRatio||1,2),scale=height/WORLD_HEIGHT;
    if(!width||!height)return;
    if(canvas.width!==Math.round(width*dpr)||canvas.height!==Math.round(height*dpr)){canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);}
    const viewWidth=width/scale,bucket=scale*dpr>1.25?2:1;
    const {first,last}=this.prepare(camera,camera+viewWidth,bucket),g=canvas.getContext('2d');
    g.setTransform(dpr,0,0,dpr,0,0);g.fillStyle='#000';g.fillRect(0,0,width,height);
    for(let id=first;id<=last;id++)g.drawImage(this.tiles.get(id),(id*TILE_WIDTH-camera)*scale,0,TILE_WIDTH*scale,WORLD_HEIGHT*scale);
    return {viewWidth,scale,tiles:this.tiles.size,objects:this.objects.size,bucket};
  }
}
