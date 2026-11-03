import {WORLD_HEIGHT} from './scene.mjs';
import {WATER_SCALE,WATER_TILE_WIDTH,waterHorizon,waterTiles} from './material.mjs';
export class OceanRenderer {
  constructor(canvas,images){
    this.canvas=canvas;this.ctx=canvas.getContext('2d');this.images=images;
    this.sea=document.createElement('canvas');this.mask=document.createElement('canvas');
    // Feather only the incoming tile edge; an opaque preceding patch is beneath.
    this.tile=document.createElement('canvas');this.tile.width=2172;this.tile.height=724;
    const t=this.tile.getContext('2d');t.drawImage(images.get('water'),0,0);
    const edge=t.createLinearGradient(0,0,430,0);edge.addColorStop(0,'rgba(255,255,255,0)');edge.addColorStop(1,'white');
    t.globalCompositeOperation='destination-in';t.fillStyle=edge;t.fillRect(0,0,2172,724);
  }
  resize(){
    const dpr=Math.min(2,window.devicePixelRatio||1);this.canvas.width=Math.round(innerWidth*dpr);this.canvas.height=Math.round(innerHeight*dpr);this.dpr=dpr;this.scale=innerHeight/WORLD_HEIGHT;this.viewWidth=innerWidth/this.scale;
    this.sea.width=this.canvas.width;this.sea.height=this.canvas.height;
    this.mask.width=Math.ceil(this.viewWidth/8);this.mask.height=112;
  }
  draw(scene,camera){
    const c=this.ctx,s=this.scale,w=this.viewWidth;
    c.setTransform(this.dpr*s,0,0,this.dpr*s,0,0);
    c.fillStyle='#eee1bd';c.fillRect(0,0,w,WORLD_HEIGHT);
    // This rectangle is entirely sky in the immutable painted baseline.
    c.drawImage(this.images.get('sky'),950,0,650,350,0,0,w,WORLD_HEIGHT);
    const wash=c.createLinearGradient(0,430,0,850);wash.addColorStop(0,'rgba(94,103,100,0)');wash.addColorStop(.8,'rgba(91,105,104,.45)');wash.addColorStop(1,'#547987');
    c.fillStyle=wash;c.fillRect(0,430,w,466);
    this.water(camera.x,w);
    for(const f of scene.query(camera.x,camera.x+w).features)c.drawImage(this.images.get(f.family),f.x-camera.x,f.y,f.width,f.height);
  }
  water(x,w){
    const sea=this.sea.getContext('2d'),m=this.mask.getContext('2d');
    sea.setTransform(1,0,0,1,0,0);sea.clearRect(0,0,this.sea.width,this.sea.height);
    sea.setTransform(this.dpr*this.scale,0,0,this.dpr*this.scale,0,0);
    // Material is world anchored in both axes, uniformly scaled, and cropped by
    // the viewport. Adjacent patches crossfade rather than assuming a seamless tile.
    for(const tile of waterTiles(x,x+w))sea.drawImage(this.tile,tile.x-x,390,WATER_TILE_WIDTH,724*WATER_SCALE);
    m.clearRect(0,0,this.mask.width,this.mask.height);
    for(let column=0;column<this.mask.width;column++){
      const horizon=waterHorizon(x+(column+.5)*w/this.mask.width)/8;
      const fade=m.createLinearGradient(0,horizon,0,horizon+15);fade.addColorStop(0,'rgba(255,255,255,0)');fade.addColorStop(1,'white');
      m.fillStyle=fade;m.fillRect(column,0,1,this.mask.height);
    }
    sea.globalCompositeOperation='destination-in';sea.drawImage(this.mask,0,0,w,WORLD_HEIGHT);sea.globalCompositeOperation='source-over';
    this.ctx.drawImage(this.sea,0,0,w,WORLD_HEIGHT);
  }
}
