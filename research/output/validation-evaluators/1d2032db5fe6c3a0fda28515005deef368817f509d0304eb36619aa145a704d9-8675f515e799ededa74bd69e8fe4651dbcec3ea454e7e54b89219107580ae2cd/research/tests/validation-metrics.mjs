import {requirePhaseCoverage} from './evaluation-contract.mjs';
export function components(mask,width,minSize=3){
 const height=mask.length/width,seen=new Uint8Array(mask.length),queue=new Int32Array(mask.length),sizes=[];
 for(let i=0;i<mask.length;i++)if(mask[i]&&!seen[i]){
  let head=0,tail=1;queue[0]=i;seen[i]=1;
  while(head<tail){const n=queue[head++],x=n%width,y=Math.floor(n/width);
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=width||ny>=height)continue;const k=ny*width+nx;if(mask[k]&&!seen[k]){seen[k]=1;queue[tail++]=k;}}
  }sizes.push(tail);
 }
 const occupied=sizes.reduce((a,b)=>a+b,0);
 return {occupiedSamples:occupied,componentsAtLeastThreeSamples:sizes.filter(s=>s>=minSize).length,largestComponentFraction:occupied?Math.max(...sizes)/occupied:0};
}

// Largest-component fraction includes every occupied sample, including fragments
// smaller than the diagnostic component-count threshold. No tolerance is applied.
export function fixedPhaseConnectivity(records,dotStep=4){
 const coverage=requirePhaseCoverage(records,dotStep),failures=[];
 for(const record of records)for(const phase of record.phases){
  const {occupiedSamples:occupied,componentsAtLeastThreeSamples:count,largestComponentFraction:fraction}=phase;
  if(!Number.isInteger(occupied)||occupied<=0||!Number.isInteger(count)||count<0||count>Math.floor(occupied/3)||!Number.isFinite(fraction)||fraction<=0||fraction>1)throw Error(`Incomplete or invalid fixed connectivity evidence: ${record.seed}/${record.id} (${phase.dx},${phase.dy})`);
  if(fraction!==1||count!==(occupied>=3?1:0))failures.push({seed:record.seed,id:record.id,layer:record.layer,dx:phase.dx,dy:phase.dy,occupiedSamples:occupied,componentsAtLeastThreeSamples:count,largestComponentFraction:fraction});
 }
 return {pass:failures.length===0,fixtures:coverage.fixtures,phases:coverage.phases,failures,scope:'Six fixed curl fixtures at sixteen offsets each; no spray; eight-neighbor foam connectivity. This does not establish openness, minimum width, or artistic fidelity.'};
}

// Principal cove probes must remain exterior-connected. This is not a
// minimum-width or resemblance test; those remain separate review criteria.
export function fixedPhaseOpenness(records,dotStep=4){
 const coverage=requirePhaseCoverage(records,dotStep),failures=[];let headProbes=0,mouthProbes=0;
 for(const r of records)for(const p of r.phases)for(const [channel,c]of p.channels.entries()){
  if(typeof c.headOpen!=='boolean'||typeof c.mouthOpen!=='boolean')throw Error('Incomplete principal-cove openness evidence');
  headProbes++;mouthProbes++;
  if(!c.headOpen||!c.mouthOpen)failures.push({seed:r.seed,id:r.id,layer:r.layer,dx:p.dx,dy:p.dy,channel,headOpen:c.headOpen,mouthOpen:c.mouthOpen});
 }
 return {pass:failures.length===0,fixtures:coverage.fixtures,phases:coverage.phases,headProbes,mouthProbes,failures,scope:'Fixed principal-cove head/mouth probes only; four-neighbor exterior water. Not minimum-width or artistic acceptance.'};
}
