// One fixed diagnostic. Color clusters are NOT accepted semantic foam/water labels.
const data=await fetch('./crest-boundary.json').then(r=>r.json());
const mask=document.createElement('canvas');mask.width=data.width*2;mask.height=data.height*2;const m=mask.getContext('2d');m.scale(2,2);for(const a of data.layers){m.fillStyle=a.color;m.fill(new Path2D(a.path))}
const canvas=document.querySelector('canvas'),g=canvas.getContext('2d');function render(){const w=innerWidth,h=innerHeight,dpr=Math.min(devicePixelRatio||1,2);canvas.width=w*dpr;canvas.height=h*dpr;g.setTransform(dpr,0,0,dpr,0,0);g.fillStyle='#e8d7b1';g.fillRect(0,0,w,h);const s=Math.min((w-32)/data.width,(h-32)/data.height);g.drawImage(mask,(w-data.width*s)/2,(h-data.height*s)/2,data.width*s,data.height*s);window.crestSeparation={ready:true,status:'provisional_barrier_boundary_not_accepted',sourceSHA256:data.sourceSHA256,omittedColors:['#fbebc8','#f5e6c8','#f1dfbf']}}
addEventListener('resize',render);render();
