import {WORLD_HEIGHT} from './scene.mjs';
export class OceanRenderer {
  constructor(canvas,images){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.images=images;}
  resize(){const dpr=Math.min(2,window.devicePixelRatio||1);this.canvas.width=Math.round(innerWidth*dpr);this.canvas.height=Math.round(innerHeight*dpr);this.dpr=dpr;this.scale=innerHeight/WORLD_HEIGHT;this.viewWidth=innerWidth/this.scale;}
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
    const c=this.ctx;
    // A continuous surface beneath every bank, with low flowing contour lines.
    c.beginPath();c.moveTo(0,805);
    for(let p=0;p<=w+30;p+=30)c.lineTo(p,805+12*Math.sin((p+x)/330)+7*Math.sin((p+x)/103));
    c.lineTo(w,WORLD_HEIGHT);c.lineTo(0,WORLD_HEIGHT);c.closePath();c.fillStyle='#276482';c.fill();
    for(let j=0;j<11;j++){
      c.beginPath();for(let p=0;p<=w+20;p+=20){const y=823+j*13+6*Math.sin((p+x)/(190+j*13)+j*.7);if(p===0)c.moveTo(p,y);else c.lineTo(p,y);}
      c.strokeStyle=j%3===0?'#b4d1cc':j%3===1?'#1b4666':'#4e8da1';c.lineWidth=j%3===0?2:4;c.stroke();
    }
  }
}
