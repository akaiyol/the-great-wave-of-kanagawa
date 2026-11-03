import {curve,ribbon} from './foam-path.mjs';
import {hash, random} from './random.mjs';
import {crestGeometry} from './crest.mjs';
const path = (...commands) => commands;
const M = (x,y) => ['M',x,y], L = (x,y) => ['L',x,y];
const C = (...values) => ['C',...values];
const Z = () => ['Z'];

function tendril(root, length, width, bend, r) {
  const x=root[0],y=root[1];
  const points=curve([[x,y],[x+length*.3,y+length*.22],[x+length*bend,y+length*.72],[x+length*(bend-.2),y+length],[x+length*(bend-.46),y+length*.77]],30);
  return {shape:ribbon(points,t=>Math.max(1.2,width*(1-t)**.66)),points};
}
function attachBranches(foam, root, length, width, bend, r, children=true) {
  const stem=tendril(root,length,width,bend,r);foam.push(stem.shape);
  if(children)for(let j=0;j<2+Math.floor(r()*2);j++){
    const at=Math.floor(stem.points.length*(.25+j*.16));
    const p=stem.points[at],len=length*(.32+r()*.23);
    foam.push(tendril(p,len,width*(.36+r()*.13),bend+(j%2?.6:-.8),r).shape);
  }
}
function waterFromCrest(crest,w,h) {
  return [M(...crest[0]),...crest.slice(1).map(p=>L(...p)),L(w*1.12,h+140),L(-32,h+140),Z()];
}

export function waveGeometry(f) {
  const r=random(hash(f.seed,312)),w=f.width,h=f.height;
  const foam=[],holes=[],spray=[];let crest,body;
  if(f.family==='curl')return crestGeometry(f,r);
  if(f.family==='breaker'){
    const peak=.4+r()*.18;
    crest=curve([[0,h*.95],[w*.22,h*.68],[w*peak,h*.18],[w*.72,h*.31],[w*.91,h*.78],[w*1.05,h*.98]]);
    foam.push(ribbon(crest,t=>(4+h*.18*Math.sin(t*Math.PI)**2)*(.7+.3*Math.cos(t*27))));
    body=waterFromCrest(crest,w,h);
    const count=7+Math.floor(r()*6);
    for(let i=0;i<count;i++){
      const t=.24+i/(count-1)*.66,root=crest[Math.floor(t*(crest.length-1))];
      attachBranches(foam,root,h*(.18+r()*.28),7+h*(.025+r()*.035),.15+r()*.6,r,i%3!==0);
    }
    for(let i=0;i<10;i++){const p=crest[Math.floor((.3+r()*.5)*(crest.length-1))];spray.push([p[0]+(r()-.5)*30,p[1]-8-r()*25,1.3+r()*1.5,2+r()*2]);}
  }else{
    crest=curve([[0,h*.9],[w*.25,h*.46],[w*.53,h*.19],[w*.76,h*.49],[w,h*.9]],60);
    foam.push(ribbon(crest,t=>3.5+h*.19*(.5+.5*Math.sin(t*Math.PI))));
    body=waterFromCrest(crest,w,h);
    for(let i=0;i<5+Math.floor(r()*4);i++){
      const p=crest[Math.floor((.16+r()*.7)*(crest.length-1))];
      foam.push(ribbon(curve([p,[p[0]+4,p[1]-h*.2],[p[0]+12,p[1]-h*.28],[p[0]+15,p[1]-h*.1]],15),t=>Math.max(1.4,5*(1-t))));
    }
  }
  return {body,foam,holes,spray};
}

export function geometryBounds(geometry) {
  let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;
  const add=(x,y)=>{left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);};
  for(const p of [geometry.body,...geometry.foam,...geometry.holes])for(const command of p)for(let i=1;i<command.length;i+=2)add(command[i],command[i+1]);
  for(const [x,y,rx,ry]of geometry.spray){add(x-rx,y-ry);add(x+rx,y+ry);}
  return {left:left-8,right:right+8,top:top-8,bottom:bottom+8};
}
