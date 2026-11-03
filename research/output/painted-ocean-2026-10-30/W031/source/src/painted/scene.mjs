import {hash, random} from '../random.mjs';
export const WORLD_HEIGHT=896;
export const REGION_WIDTH=2600;
export const MAX_SPRITE_WIDTH=2500;
const types=['open','rolling','breakers','rolling','open','curl'];
export class OceanScene {
  constructor(seed, assets){this.seed=seed>>>0;this.assets=new Map(assets.map(a=>[a.family,a]));}
  feature(id,region,family,x,width,foot){
    const a=this.assets.get(family), b=a.nearOpaqueBounds, scale=width/(b[2]-b[0]);
    const left=x-b[0]*scale, top=foot-b[3]*scale;
    return {id,region,family,x:left,y:top,width:a.width*scale,height:a.height*scale,foot,
      bounds:{left,right:left+a.width*scale,top,bottom:top+a.height*scale}};
  }
  region(index){
    const r=random(hash(this.seed,index));
    if(index===0){
      const width=1330+r()*55;
      return {index,type:'landing',features:[
        this.feature('0:hero',0,'curl',-90,width,980),
        this.feature('0:distance',0,'swell',1100,1680,940),
        this.feature('0:fore-left',0,'breaker',-460,1470,1170),
        this.feature('0:fore-right',0,'swell',600,2180,1170)
      ]};
    }
    const type=types[Math.floor(r()*types.length)], features=[];
    const count=type==='open'?1:type==='curl'?2:2+Math.floor(r()*3);
    let cursor=index*REGION_WIDTH+160+r()*380;
    for(let i=0;i<count;i++){
      const family=type==='curl'&&i===0?'curl':type==='breakers'&&r()<.8?'breaker':'swell';
      const width=family==='curl'?1150+r()*250:family==='breaker'?950+r()*600:1400+r()*850;
      const foot=family==='curl'?1000+r()*90:880+r()*370;
      features.push(this.feature(`${index}:${i}`,index,family,cursor,width,foot));
      cursor+=type==='open'?1900:400+r()*700;
    }
    return {index,type,features:features.filter(f=>f.bounds.right < -200 || f.bounds.left > 2400)};
  }
  surface(index){
    const r=random(hash(this.seed^0x61b4a39d,index));
    const features=[];
    // Broad overlapping low swells ground the banks. Their complete images retain
    // the original alpha; the following depth hides their closed opaque feet.
    for(let i=0;i<4;i++){
      const x=index*REGION_WIDTH+i*650-300+r()*90;
      features.push({...this.feature(`surface:${index}:far:${i}`,index,'swell',x,1450+r()*100,730+r()*15),layer:'surface'});
    }
    for(let i=0;i<3;i++){
      const x=index*REGION_WIDTH+i*(REGION_WIDTH/3)-540+r()*100;
      features.push({...this.feature(`surface:${index}:near:${i}`,index,'swell',x,2300+r()*100,1080+r()*20),layer:'surface'});
    }
    return features;
  }
  query(left,right){
    if(!Number.isFinite(left)||!Number.isFinite(right)||right<left)throw new RangeError('Invalid view');
    const first=Math.floor((left-3*REGION_WIDTH)/REGION_WIDTH),last=Math.floor((right+MAX_SPRITE_WIDTH)/REGION_WIDTH);
    const regions=[]; const features=[];
    for(let i=first;i<=last;i++){
      const region=this.region(i);regions.push({index:i,type:region.type});
      for(const f of [...this.surface(i),...region.features])if(f.bounds.right>=left&&f.bounds.left<=right)features.push(f);
    }
    features.sort((a,b)=>a.foot-b.foot||a.id.localeCompare(b.id));
    return {regions,features};
  }
  snapshot(left,right){const q=this.query(left,right);return {seed:this.seed,worldBounds:{left,right,top:0,bottom:WORLD_HEIGHT},regions:q.regions,features:q.features,cacheCounts:{regions:0,images:4}};}
}
