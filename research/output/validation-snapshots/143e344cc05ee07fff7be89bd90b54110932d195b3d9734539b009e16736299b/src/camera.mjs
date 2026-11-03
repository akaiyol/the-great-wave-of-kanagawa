export class Camera {
  constructor({reducedMotion=false}={}) { this.x=0;this.playing=!reducedMotion;this.visible=true;this.last=null; }
  tick(now, viewWidth) {
    if(this.last!==null&&this.playing&&this.visible)this.x+=Math.min(50,Math.max(0,now-this.last))/1000*viewWidth/90;
    this.last=now;return this.x;
  }
  move(delta) { if(!Number.isFinite(delta))return;this.x+=delta;this.playing=false; }
  toggle() { this.playing=!this.playing;this.last=null; }
  setVisible(visible) { this.visible=visible;this.last=null; }
  reduceMotion() { this.playing=false;this.last=null; }
}
