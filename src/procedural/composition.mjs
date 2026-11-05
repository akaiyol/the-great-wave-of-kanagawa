import {generateWave,waveSvg} from './study.mjs';
import {hash,random} from '../random.mjs';

const palette={sky:'#e6dcc1',cloud:'#efead6',water:'#23485f',foam:'#eeecd5',blue:'#39738a',pale:'#a2c7c4'};
const pt=p=>p.map(n=>Number(n.toFixed(3))).join(',');
const path=points=>'M'+points.map(pt).join(' L')+' Z';
const line=points=>'M'+points.map(pt).join(' L');
const smooth=t=>t*t*(3-2*t);
function envelope(knots,x){
 let i=0;while(i<knots.length-2&&x>knots[i+1][0])i++;
 const [a,b]=[knots[i],knots[i+1]],t=Math.max(0,Math.min(1,(x-a[0])/(b[0]-a[0])));
 return a[1]+(b[1]-a[1])*smooth(t);
}
// Monotone-x ridges are built from seeded envelopes, not curled-wave copies.
// Each lobe modifies the exposed crest and its attached foam together.
function ridge(seed,kind){
 const r=random(seed),front=kind==='foreground';
 const knots=front?[[-30,683],[165+(r()-.5)*35,612+(r()-.5)*16],[350,660],[640,720],[930,747],[1230,710]]:
 [[485,627],[700,612],[850+(r()-.5)*30,583+(r()-.5)*10],[990,612],[1230,620]];
 const lobes=Array.from({length:front?15:8},(_,i)=>({x:front?15+i*35+r()*17:740+i*28+r()*10,width:front?9+r()*10:8+r()*9,height:front?3+r()*10:2+r()*6}));
 const y=x=>envelope(knots,x)-lobes.reduce((sum,l)=>sum+l.height*Math.exp(-(((x-l.x)/l.width)**2)),0);
 const start=knots[0][0],end=knots.at(-1)[0],crest=Array.from({length:front?253:151},(_,i)=>{const x=start+(end-start)*i/(front?252:150);return[x,y(x)];});
 const foamDepth=x=>(front?8:4)+(front?6:3)*Math.exp(-(((x-(front?270:850))/(front?290:140))**2));
 const foam=[...crest,...crest.map(([x,v])=>[x,v+foamDepth(x)]).reverse()];
 const body=[...crest,[end,830],[start,830]];
 const bands=Array.from({length:front?7:4},(_,i)=>{
  const depth=(front?26:19)+i*(front?22:17),width=(front?8:4)+(i%3)*2;
  const upper=crest.map(([x,v])=>[x,v+depth+(front?10:4)*Math.sin(x/220+i*.43)]);
  return {color:i%3===0?palette.pale:palette.blue,points:[...upper,...upper.map(([x,v])=>[x,v+width]).reverse()]};
 });
 return {kind,knots,lobes,crest,body,foam,bands};
}
export function generateComposition(seed=721){
 if(!Number.isInteger(seed)||seed<0||seed>4294967295)throw new RangeError('Seed must be a uint32');
 const primary=generateWave(seed),{minY,maxY}=primary.bounds;
 const pose={scaleX:.95,scaleY:750/(maxY-minY),offsetX:-110,offsetY:70-minY*750/(maxY-minY)};
 const r=random(hash(seed,0x434c4f55));
 const clouds=Array.from({length:3},(_,i)=>{
  const x=570+i*185+(r()-.5)*45,y=175+i*72+(r()-.5)*22,w=180+r()*105,h=12+r()*8;
  return Array.from({length:49},(_,j)=>{const a=j/48*Math.PI*2;return[x+Math.cos(a)*w,y+Math.sin(a)*h*(1+.18*Math.sin(a*3))];});
 });
 const waterR=random(hash(seed,0x57415452)),phase=waterR()*Math.PI*2;
 const horizon=Array.from({length:61},(_,i)=>[i*20,603+3*Math.sin(i/12+phase)]);
 return {seed,primary,pose,clouds,water:[...horizon,[1200,820],[0,820]],foreground:ridge(hash(seed,0x46524f4e),'foreground'),midground:ridge(hash(seed,0x4d494447),'midground')};
}
function ridgeSvg(r,id){return `<g><defs><clipPath id="${id}"><path d="${path(r.body)}"/></clipPath></defs><path d="${path(r.body)}" fill="${palette.water}"/><g clip-path="url(#${id})">${r.bands.map(b=>`<path d="${path(b.points)}" fill="${b.color}"/>`).join('')}</g><path d="${path(r.foam)}" fill="${palette.foam}" stroke="${palette.water}" stroke-width="1.5"/><path d="${line(r.crest)}" fill="none" stroke="${palette.water}" stroke-width="1.5"/></g>`;}
export function compositionSvg(c){
 const p=c.pose,primaryLayer=waveSvg(c.primary,{background:false}).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'');
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="Generated ocean"><rect width="1200" height="800" fill="${palette.sky}"/>${c.clouds.map(points=>`<path d="${path(points)}" fill="${palette.cloud}"/>`).join('')}<path d="${path(c.water)}" fill="${palette.water}"/>${ridgeSvg(c.midground,`mid-${c.seed}`)}<g transform="matrix(${p.scaleX} 0 0 ${p.scaleY} ${p.offsetX} ${p.offsetY})">${primaryLayer}</g>${ridgeSvg(c.foreground,`front-${c.seed}`)}</svg>`;
}
