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
