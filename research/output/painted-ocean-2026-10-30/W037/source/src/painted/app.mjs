import {Camera} from '../camera.mjs';
import {OceanScene} from './scene.mjs';
import {OceanRenderer} from './renderer.mjs';
const canvas=document.querySelector('canvas'),play=document.querySelector('#play'),dialog=document.querySelector('dialog'),status=document.querySelector('#status');
const controls=[...document.querySelectorAll('nav button')];
controls.forEach(button=>button.disabled=true);
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const camera=new Camera({reducedMotion:reduced.matches});
let seed=Number(new URL(location.href).searchParams.get('seed')??1847)>>>0,scene,renderer,manifest,frameID=null,renderCount=0;
const images=new Map();
const assetURL=path=>new URL(`../../${path}`,import.meta.url).href;
const load=(path)=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(new Error(`Unable to load ${path}`));i.src=assetURL(path);});
const sync=()=>{play.textContent=camera.playing?'Pause':'Play';play.setAttribute('aria-label',camera.playing?'Pause travel':'Play travel');};
function schedule(){
  if(!api.ready||!camera.playing||!camera.visible){
    if(frameID!==null)cancelAnimationFrame(frameID);
    frameID=null;camera.last=null;return;
  }
  if(frameID===null)frameID=requestAnimationFrame(frame);
}
function frame(now){
  frameID=null;
  if(!api.ready||!camera.playing||!camera.visible){schedule();return;}
  camera.tick(now,renderer.viewWidth);drawOnce();
}
function drawOnce(){
  if(api.ready&&camera.visible){renderer.draw(scene,camera);renderCount++;}
  sync();schedule();
}
const seek=x=>{if(!api.ready||!Number.isFinite(x))return;camera.x=x;camera.playing=false;camera.last=null;drawOnce();};
function setSeed(value){
  if(!api.ready)return seed;
  seed=Number(value)>>>0;scene=new OceanScene(seed,manifest.assets);camera.x=0;camera.last=null;
  const url=new URL(location.href);url.searchParams.set('seed',String(seed));history.replaceState(history.state,'',url);
  drawOnce();return seed;
}
const api=window.paintedOcean={ready:false,get seed(){return seed;},camera,seek,setSeed,drawOnce,snapshot(){
  if(!this.ready)return {ready:false,seed,renderCount};
  return {...scene.snapshot(camera.x,camera.x+renderer.viewWidth),playing:camera.playing,visible:camera.visible,viewport:{width:innerWidth,height:innerHeight,dpr:renderer.dpr},ready:true,renderCount};
}};
const move=amount=>{if(!api.ready)return;camera.move(amount);drawOnce();};
const toggle=()=>{if(!api.ready)return;camera.toggle();drawOnce();};
play.addEventListener('click',toggle);
document.querySelector('#left').addEventListener('click',()=>move(-240));document.querySelector('#right').addEventListener('click',()=>move(240));
document.querySelector('#another').addEventListener('click',()=>setSeed((seed+2654435769)>>>0));
const help=()=>{if(!api.ready)return;camera.playing=false;drawOnce();if(!dialog.open)dialog.showModal();};document.querySelector('#help').addEventListener('click',help);
window.addEventListener('keydown',event=>{
  const target=event.target;
  if(!api.ready||dialog.open||target.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"])'))return;
  // Space retains native button activation; other navigation remains global.
  if(event.key===' '&&target.closest('button,[role="button"]'))return;
  if(['ArrowLeft','ArrowRight',' ','Home','h','H','?'].includes(event.key))event.preventDefault();
  if(event.key==='ArrowLeft')move(-180);if(event.key==='ArrowRight')move(180);
  if(event.key===' '&&!event.repeat)toggle();if(event.key==='Home')seek(0);if(['h','H','?'].includes(event.key))help();
});
canvas.addEventListener('wheel',event=>{if(!api.ready)return;event.preventDefault();move((event.deltaX||event.deltaY)/renderer.scale);},{passive:false});
let drag=null;
canvas.addEventListener('pointerdown',event=>{if(!api.ready)return;canvas.focus({preventScroll:true});drag={id:event.pointerId,x:event.clientX};canvas.setPointerCapture(event.pointerId);camera.playing=false;drawOnce();});
canvas.addEventListener('pointermove',event=>{if(!api.ready||drag?.id!==event.pointerId)return;move((drag.x-event.clientX)/renderer.scale);drag.x=event.clientX;});
const release=()=>{drag=null;};canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',release);
window.addEventListener('resize',()=>{if(api.ready){renderer.resize();drawOnce();}});
document.addEventListener('visibilitychange',()=>{camera.setVisible(!document.hidden);if(api.ready)drawOnce();});
reduced.addEventListener('change',event=>{if(event.matches){camera.reduceMotion();drawOnce();}});
try{
  const response=await fetch(assetURL('assets/woodblock/manifest.json'));if(!response.ok)throw new Error('Unable to load ocean manifest');manifest=await response.json();
  const entries=[...manifest.assets.map(a=>[a.family,a.path]),['sky',manifest.sky?.path??manifest.baseline],['water',manifest.waterField.path]];
  await Promise.all(entries.map(async([family,path])=>images.set(family,await load(path))));
  scene=new OceanScene(seed,manifest.assets);renderer=new OceanRenderer(canvas,images,manifest.sky?.crop);renderer.resize();camera.setVisible(!document.hidden);api.ready=true;controls.forEach(button=>button.disabled=false);status.remove();drawOnce();
}catch(error){status.textContent='The ocean could not load. Please reload.';console.error(error);}
