import {generateComposition,compositionSvg} from '../../src/procedural/composition.mjs';
import {hash,random} from '../../src/random.mjs';
const colors=['#2b607f','#346e8b'];
const smooth=t=>t*t*(3-2*t);
function envelope(knots,x){
 let i=0;while(i<knots.length-2&&x>knots[i+1][0])i++;
 const [a,b]=[knots[i],knots[i+1]],t=Math.max(0,Math.min(1,(x-a[0])/(b[0]-a[0])));
 return a[1]+(b[1]-a[1])*smooth(t);
}
// Opaque narrowing, with nonzero width even at the sampled ends.
const taper=t=>.06+.94*Math.sin(Math.PI*t)**.65;
const strip=(upper,lower,color)=>({color,points:[...upper,...lower.toReversed()]});

export function generateWaterHierarchy(seed=721){
 const baseline=generateComposition(seed),r=random(hash(seed,0x50303939)),map=baseline.primary.wave.surfaceChart.map;
 const primaryPlans=[121,160,205,250].map((radius,i)=>({radius,width:[8,5,12,3][i],start:-2,end:[1.74,1.81,1.68,1.60][i],phase:r()*Math.PI*2,color:colors[i%2],meanderAmplitude:3}));
 const primaryBands=primaryPlans.map(p=>{
  const upper=[],lower=[];
  for(let j=0;j<=192;j++){
   const t=j/192,u=p.start+(p.end-p.start)*t,center=p.radius+3*Math.sin(t*Math.PI*1.35+p.phase),half=p.width*taper(t)/2;
   upper.push(map(u,center-half));lower.push(map(u,center+half));
  }
  return strip(upper,lower,p.color);
 });
 const strokePlans=[{radius:139,end:1.70},{radius:185,end:1.75},{radius:233,end:1.57}].map(p=>({...p,start:-2,phase:r()*Math.PI*2}));
 const strokes=strokePlans.map(p=>Array.from({length:193},(_,j)=>{const t=j/192;return map(p.start+(p.end-p.start)*t,p.radius+2*Math.sin(t*Math.PI*1.2+p.phase));}));
 const ridgePlans={};
 const ridgeVariant=(ridge,depths,widths)=>{
  const start=ridge.knots[0][0],end=ridge.knots.at(-1)[0];
  const plans=depths.map((depth,i)=>({depth,width:widths[i],phase:r()*Math.PI*2,color:colors[i%2],start,end,modulation:ridge.kind==='foreground'?4:2}));
  ridgePlans[ridge.kind]=plans;
  const bands=plans.map(p=>{
   const upper=[],lower=[];
   for(let j=0;j<=252;j++){
    const t=j/252,x=start+(end-start)*t,y=envelope(ridge.knots,x)+p.depth+p.modulation*Math.sin(t*Math.PI*1.4+p.phase),half=p.width*taper(t)/2;
    upper.push([x,y-half]);lower.push([x,y+half]);
   }
   return strip(upper,lower,p.color);
  });
  return {...ridge,bands};
 };
 const variant={...baseline,primary:{...baseline.primary,wave:{...baseline.primary.wave,bands:primaryBands,strokes}},foreground:ridgeVariant(baseline.foreground,[28,70,120],[6,9,4]),midground:ridgeVariant(baseline.midground,[18,46],[4,3])};
 const unchangedExcept=(a,b,excluded)=>Object.keys(a).filter(k=>!excluded.includes(k)).every(k=>a[k]===b[k]);
 const invariance={scene:unchangedExcept(baseline,variant,['primary','foreground','midground']),primary:unchangedExcept(baseline.primary,variant.primary,['wave']),wave:unchangedExcept(baseline.primary.wave,variant.primary.wave,['bands','strokes']),foreground:unchangedExcept(baseline.foreground,variant.foreground,['bands']),midground:unchangedExcept(baseline.midground,variant.midground,['bands'])};
 const points=[...primaryBands.flatMap(b=>b.points),...strokes.flat(),...variant.foreground.bands.flatMap(b=>b.points),...variant.midground.bands.flatMap(b=>b.points)];
 const finite=points.every(p=>p.length===2&&p.every(Number.isFinite));
 if(!finite||!Object.values(invariance).every(Boolean))throw new Error('P099 finite/fixed-region preflight failed');
 const svg=compositionSvg(variant);
 return {seed,baseline,variant,svg,bandPlans:{primary:primaryPlans,strokes:strokePlans,...ridgePlans},diagnostics:{finite,invariance,scope:'Initial finite and fixed-region references only; whole-view visual and band integrity pending'}};
}
