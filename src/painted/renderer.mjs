import {WORLD_HEIGHT} from './scene.mjs';
import {WATER_SCALE,WATER_CROP_LEFT,WATER_CROP_WIDTH,WATER_SOURCE_HEIGHT,waterBoundary,waterTiles} from './material.mjs';
export class OceanRenderer {
  constructor(canvas,images,skyCrop=[950,0,650,350]){
    this.canvas=canvas;this.ctx=canvas.getContext('2d');this.images=images;this.skyCrop=skyCrop;
  }
  resize(){
    const dpr=Math.min(2,window.devicePixelRatio||1);this.canvas.width=Math.round(innerWidth*dpr);this.canvas.height=Math.round(innerHeight*dpr);this.dpr=dpr;this.scale=innerHeight/WORLD_HEIGHT;this.viewWidth=innerWidth/this.scale;
  }
  draw(scene,camera){
    const c=this.ctx,s=this.scale,w=this.viewWidth;
    c.setTransform(this.dpr*s,0,0,this.dpr*s,0,0);
    c.fillStyle='#eee1bd';c.fillRect(0,0,w,WORLD_HEIGHT);
    // Unmodified museum sky; crop excludes lettering, boats, mountain and water.
    const [sx,sy,sw,sh]=this.skyCrop,skyScale=Math.max(w/sw,WORLD_HEIGHT/sh),cw=w/skyScale,ch=WORLD_HEIGHT/skyScale;
    c.drawImage(this.images.get('sky'),sx+(sw-cw)/2,sy+(sh-ch)/2,cw,ch,0,0,w,WORLD_HEIGHT);
    c.filter='saturate(0.72) contrast(0.88) brightness(1.03)';
    this.water(camera.x,w);
    for(const f of scene.query(camera.x,camera.x+w).features)c.drawImage(this.images.get(f.family),f.x-camera.x,f.y,f.width,f.height);
    c.filter='none';
  }
  water(x,w){
    const c=this.ctx;
    // Opaque material is clipped by a curved skyline in world coordinates.
    // Near the opening curl this is an authored ridge preserving its sky hollow.
    const boundary=()=>{
      c.beginPath();c.moveTo(-4,waterBoundary(x-4));
      for(let local=0;local<=w+4;local+=4)c.lineTo(local,waterBoundary(x+local));
    };
    c.save();boundary();c.lineTo(w+4,WORLD_HEIGHT);c.lineTo(-4,WORLD_HEIGHT);c.closePath();c.clip();
    const tiles=waterTiles(x,x+w);
    for(let index=0;index<tiles.length;index++){
      const tile=tiles[index];
      c.save();
      c.translate(tile.x-x,390);
      c.scale(WATER_SCALE,WATER_SCALE);
      c.drawImage(this.images.get('water'),WATER_CROP_LEFT,0,WATER_CROP_WIDTH,WATER_SOURCE_HEIGHT,0,0,WATER_CROP_WIDTH,WATER_SOURCE_HEIGHT);
      c.restore();
    }
    boundary();c.strokeStyle='#eee5c9';c.lineWidth=7;c.stroke();
    c.restore();
    boundary();c.strokeStyle='#365665';c.lineWidth=1.25;c.stroke();
  }
}
