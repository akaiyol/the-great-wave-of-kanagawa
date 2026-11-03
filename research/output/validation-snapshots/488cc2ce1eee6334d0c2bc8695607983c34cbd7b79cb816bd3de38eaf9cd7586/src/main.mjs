import {OceanRenderer} from './render.mjs';
import {Camera} from './camera.mjs';
import {WORLD_HEIGHT} from './scene.mjs';
const $=id=>document.getElementById(id),canvas=$('ocean');
const requestedSeed=new URL(location.href).searchParams.get('seed');
let seed=requestedSeed!==null&&/^\d{1,10}$/.test(requestedSeed)?Number(requestedSeed)>>>0:721;
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),camera=new Camera({reducedMotion:reduced.matches});
const renderer=new OceanRenderer(seed);
let dirty=true,drag=null,frame=0,viewWidth=innerWidth/(innerHeight/WORLD_HEIGHT),resumeAfterDialog=false,lastDpr=devicePixelRatio;
function controls(){
  $('play').textContent=camera.playing?'Pause':'Play';
  $('play').setAttribute('aria-label',camera.playing?'Pause automatic travel':'Start automatic travel');
}
function announce(text){$('announcement').textContent=text;}
function move(delta){camera.move(delta);dirty=true;controls();}
function toggle(){camera.toggle();controls();announce(camera.playing?'Automatic travel started.':'Automatic travel paused.');}
function draw(now){
  if(devicePixelRatio!==lastDpr){lastDpr=devicePixelRatio;dirty=true;}
  const previous=camera.x;camera.tick(now,viewWidth);
  if(camera.x!==previous||dirty){const result=renderer.draw(canvas,camera.x);if(result)viewWidth=result.viewWidth;canvas.dataset.worldX=camera.x.toFixed(3);canvas.dataset.seed=String(seed);dirty=false;}
  frame=requestAnimationFrame(draw);
}
function start(){try{draw(performance.now());}catch(error){camera.playing=false;controls();$('error').hidden=false;$('error').textContent='The ocean could not be drawn. Reload the page to try again.';console.error(error);}}
$('play').onclick=toggle;
$('left').onclick=()=>move(-viewWidth*.35);
$('right').onclick=()=>move(viewWidth*.35);
$('new').onclick=()=>{
  const value=new Uint32Array(1);crypto.getRandomValues(value);seed=value[0];renderer.reset(seed);camera.x=0;camera.last=null;dirty=true;
  const url=new URL(location.href);url.searchParams.set('seed',seed);history.replaceState(null,'',url);announce('A new ocean.');
};
function help(){if($('about').open)return;resumeAfterDialog=camera.playing;camera.playing=false;controls();$('about').showModal();}
$('help').onclick=help;
$('about').addEventListener('close',()=>{if(resumeAfterDialog){camera.playing=true;camera.last=null;controls();}resumeAfterDialog=false;});
canvas.addEventListener('wheel',event=>{if(event.ctrlKey)return;event.preventDefault();const factor=event.deltaMode===1?16:event.deltaMode===2?innerHeight:1;move((Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY)*factor/(innerHeight/WORLD_HEIGHT));},{passive:false});
canvas.addEventListener('pointerdown',event=>{if(event.button!==0)return;canvas.focus({preventScroll:true});canvas.setPointerCapture(event.pointerId);drag={id:event.pointerId,x:event.clientX};move(0);});
canvas.addEventListener('pointermove',event=>{if(!drag||drag.id!==event.pointerId)return;move((drag.x-event.clientX)/(innerHeight/WORLD_HEIGHT));drag.x=event.clientX;});
function endDrag(){drag=null;}canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);canvas.addEventListener('lostpointercapture',endDrag);
window.addEventListener('keydown',event=>{
  if(event.metaKey||event.ctrlKey||event.altKey||$('about').open||event.target.closest('button,select,input,textarea,a'))return;
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();move((event.key==='ArrowLeft'?-1:1)*viewWidth*.06);}
  else if(event.code==='Space'){event.preventDefault();if(!event.repeat)toggle();}
  else if(event.key==='Home'){event.preventDefault();move(-camera.x);announce('Starting view.');}
  else if(event.key.toLowerCase()==='h')help();
});
window.addEventListener('resize',()=>{viewWidth=innerWidth/(innerHeight/WORLD_HEIGHT);dirty=true;});
document.addEventListener('visibilitychange',()=>camera.setVisible(!document.hidden));
reduced.addEventListener('change',event=>{if(event.matches){camera.reduceMotion();resumeAfterDialog=false;controls();}});
window.addEventListener('pagehide',()=>cancelAnimationFrame(frame));
window.addEventListener('pageshow',event=>{if(event.persisted){camera.last=null;dirty=true;start();}});
camera.setVisible(!document.hidden);controls();start();
