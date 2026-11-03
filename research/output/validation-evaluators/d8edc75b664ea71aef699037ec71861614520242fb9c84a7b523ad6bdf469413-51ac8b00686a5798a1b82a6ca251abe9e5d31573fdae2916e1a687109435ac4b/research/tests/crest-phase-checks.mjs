import {components} from './validation-metrics.mjs';
import {CREST_FIXTURES,requireCrestFixture,requireChannels,requirePhaseCoverage} from './evaluation-contract.mjs';
// Complementary topology: eight-neighbor foam, four-neighbor open water.
export function exteriorWater(mask,width){
 const height=mask.length/width,seen=new Uint8Array(mask.length),queue=new Int32Array(mask.length);let head=0,tail=0;
 const add=n=>{if(!mask[n]&&!seen[n]){seen[n]=1;queue[tail++]=n;}};
 for(let x=0;x<width;x++){add(x);add((height-1)*width+x);}for(let y=0;y<height;y++){add(y*width);add(y*width+width-1);}
 while(head<tail){const n=queue[head++],x=n%width,y=Math.floor(n/width);if(x)add(n-1);if(x+1<width)add(n+1);if(y)add(n-width);if(y+1<height)add(n+width);}
 return seen;
}
export function runCrestPhaseChecks({sceneFeatures,waveGeometry,geometryBounds,drawFoam,DOT_STEP}){
 const records=[];
 for(const fixture of CREST_FIXTURES){
  const {seed,layer}=fixture;
  const f=requireCrestFixture(sceneFeatures(seed,0,15360),fixture);
  const geometry=waveGeometry(f),b=geometryBounds(geometry),phases=[];
  requireChannels(geometry.channels,fixture);
  for(let dy=0;dy<DOT_STEP;dy++)for(let dx=0;dx<DOT_STEP;dx++){
   const fx=f.x+dx,fy=f.y+dy,sx=Math.floor((fx+b.left)/DOT_STEP),sy=Math.floor((fy+b.top)/DOT_STEP);
   const canvas=document.createElement('canvas');canvas.width=Math.ceil((fx+b.right)/DOT_STEP)-sx;canvas.height=Math.ceil((fy+b.bottom)/DOT_STEP)-sy;
   const g=canvas.getContext('2d',{willReadFrequently:true});g.scale(1/DOT_STEP,1/DOT_STEP);g.translate(fx-sx*DOT_STEP,fy-sy*DOT_STEP);drawFoam(g,geometry,{spray:false});
   const rgba=g.getImageData(0,0,canvas.width,canvas.height).data,mask=Uint8Array.from({length:rgba.length/4},(_,i)=>+(rgba[i*4+3]>=128));
   const water=exteriorWater(mask,canvas.width),at=([x,y])=>Math.floor((fy+y)/DOT_STEP-sy)*canvas.width+Math.floor((fx+x)/DOT_STEP-sx);
   const channels=(geometry.channels||[]).map(({head,mouth},channel)=>({channel,headOpen:water[at(head)]===1,mouthOpen:water[at(mouth)]===1}));
   phases.push({dx,dy,...components(mask,canvas.width),channels});
  }
  records.push({seed,id:f.id,layer,width:f.width,height:f.height,phaseCount:phases.length,
   minimumLargestComponentFraction:Math.min(...phases.map(p=>p.largestComponentFraction)),maximumComponents:Math.max(...phases.map(p=>p.componentsAtLeastThreeSamples)),
   channelHeadFailures:phases.reduce((n,p)=>n+p.channels.filter(c=>!c.headOpen).length,0),channelMouthFailures:phases.reduce((n,p)=>n+p.channels.filter(c=>!c.mouthOpen).length,0),phases});
 }
 return {records,coverage:requirePhaseCoverage(records,DOT_STEP),phaseCount:records.reduce((n,r)=>n+r.phaseCount,0),limits:'Fixed foreground and middle curl fixtures only; no spray. Probe connectivity is not minimum-width measurement, a proof of vector simplicity, or artistic acceptance.'};
}
