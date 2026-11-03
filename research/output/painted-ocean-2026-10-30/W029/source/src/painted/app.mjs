import {Camera} from '../camera.mjs';
import {OceanScene} from './scene.mjs';
import {OceanRenderer} from './renderer.mjs';
const canvas=document.querySelector('canvas'),play=document.querySelector('#play'),dialog=document.querySelector('dialog'),status=document.querySelector('#status');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const camera=new Camera({reducedMotion:reduced.matches});
let seed=Number(new URL(location.href).searchParams.get('seed')??1847)>>>0,scene,renderer;
const images=new Map();
const assetURL=path=>new URL(`../../${path}`,import.meta.url).href;
const load=(path)=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(new Error(`Unable to load ${path}`));i.src=assetURL(path);});
const sync=()=>{play.textContent=camera.playing?'Pause':'Play';play.setAttribute('aria-label',camera.playing?'Pause travel':'Play travel');};
const drawOnce=()=>{if(renderer)renderer.draw(scene,camera);sync();};
const seek=x=>{if(!Number.isFinite(x))return;camera.x=x;camera.playing=false;camera.last=null;drawOnce();};
function setSeed(value){seed=Number(value)>>>0;scene=new OceanScene(seed,manifest.assets);camera.x=0;camera.last=null;drawOnce();return seed;}
let manifest;
const api=window.paintedOcean={ready:false,get seed(){return seed;},camera,seek,setSeed,drawOnce,snapshot(){return {...scene.snapshot(camera.x,camera.x+renderer.viewWidth),playing:camera.playing,visible:camera.visible,viewport:{width:innerWidth,height:innerHeight,dpr:renderer.dpr},ready:this.ready};}};
try{
  const response=await fetch(assetURL('assets/woodblock/manifest.json'));if(!response.ok)throw new Error('Unable to load ocean manifest');manifest=await response.json();
  const entries=[...manifest.assets.map(a=>[a.family,a.path]),['sky',manifest.baseline]];
  await Promise.all(entries.map(async([family,path])=>images.set(family,await load(path))));
  scene=new OceanScene(seed,manifest.assets);renderer=new OceanRenderer(canvas,images);renderer.resize();camera.setVisible(!document.hidden);api.ready=true;status.remove();drawOnce();
  const frame=now=>{camera.tick(now,renderer.viewWidth);drawOnce();requestAnimationFrame(frame);};requestAnimationFrame(frame);
}catch(error){status.textContent='The ocean could not load. Please reload.';console.error(error);}
play.addEventListener('click',()=>{camera.toggle();drawOnce();});
const move=amount=>{camera.move(amount);drawOnce();};
document.querySelector('#left').addEventListener('click',()=>move(-240));document.querySelector('#right').addEventListener('click',()=>move(240));
document.querySelector('#another').addEventListener('click',()=>setSeed((seed+2654435769)>>>0));
const help=()=>{camera.playing=false;drawOnce();if(!dialog.open)dialog.showModal();};document.querySelector('#help').addEventListener('click',help);
window.addEventListener('keydown',event=>{if(dialog.open||event.target.closest('button'))return;if(['ArrowLeft','ArrowRight',' ','Home','h','H','?'].includes(event.key))event.preventDefault();if(event.key==='ArrowLeft')move(-180);if(event.key==='ArrowRight')move(180);if(event.key===' '){camera.toggle();drawOnce();}if(event.key==='Home')seek(0);if(['h','H','?'].includes(event.key))help();});
canvas.addEventListener('wheel',event=>{event.preventDefault();move((event.deltaX||event.deltaY)/renderer.scale);},{passive:false});
let drag=null;
canvas.addEventListener('pointerdown',event=>{drag={id:event.pointerId,x:event.clientX};canvas.setPointerCapture(event.pointerId);camera.playing=false;drawOnce();});
canvas.addEventListener('pointermove',event=>{if(drag?.id!==event.pointerId)return;move((drag.x-event.clientX)/renderer.scale);drag.x=event.clientX;});
const release=()=>{drag=null;};canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);
window.addEventListener('resize',()=>{if(renderer){renderer.resize();drawOnce();}});document.addEventListener('visibilitychange',()=>camera.setVisible(!document.hidden));reduced.addEventListener('change',event=>{if(event.matches){camera.reduceMotion();drawOnce();}});
