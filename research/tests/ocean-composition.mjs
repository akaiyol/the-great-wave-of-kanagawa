import {OceanRenderer,TILE_WIDTH} from '../archive/braille-2026-10-30/runtime/src/render.mjs';
import {sceneFeatures,WORLD_HEIGHT} from '../archive/braille-2026-10-30/runtime/src/scene.mjs';
const views=document.getElementById('views');
function render(){
 const seed=Number(document.getElementById('seed').value),renderer=new OceanRenderer(seed);
 views.replaceChildren();
 for(let i=0;i<10;i++){
  const f=document.createElement('figure'),c=document.createElement('canvas'),caption=document.createElement('figcaption');
  c.width=1536;c.height=WORLD_HEIGHT;c.setAttribute('role','img');c.setAttribute('aria-label',`Ocean viewport ${i+1}`);
  const g=c.getContext('2d');renderer.prepare(i*1536,(i+1)*1536,1);
  for(let id=i*3;id<i*3+3;id++)g.drawImage(renderer.tile(id),(id-i*3)*TILE_WIDTH,0);
  caption.textContent=`View ${i+1} · world ${i*1536}–${(i+1)*1536}`;f.append(c,caption);views.append(f);
 }
 const features=sceneFeatures(seed,0,15360),counts=['curl','breaker','band'].map(name=>`${features.filter(f=>f.family===name).length} ${name}`);
 document.getElementById('summary').textContent=`Seed ${seed}: ${counts.join(', ')} features intersect this region. Shared boundary features are counted once.`;
}
document.getElementById('seed').onchange=render;render();
