import {hash, random} from './random.mjs';
const path = (...commands) => commands;
const M = (x,y) => ['M',x,y], L = (x,y) => ['L',x,y];
const C = (...values) => ['C',...values];
const Z = () => ['Z'];

function curve(points, steps = 100) {
  const out = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0,i-1)], p1=points[i], p2=points[i+1], p3=points[Math.min(points.length-1,i+2)];
    for (let j=0;j<steps/(points.length-1);j++) {
      const t=j/(steps/(points.length-1)), t2=t*t,t3=t2*t;
      out.push([.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),.5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)]);
    }
  }
  out.push(points.at(-1));return out;
}
function ribbon(points, width) {
  const sides=[[],[]];
  for(let i=0;i<points.length;i++){
    const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)];
    const dx=b[0]-a[0],dy=b[1]-a[1],n=Math.hypot(dx,dy)||1;
    const w=typeof width==='function'?width(i/(points.length-1)):width;
    for(let s=0;s<2;s++){const sign=s?1:-1;sides[s].push([points[i][0]+sign*(-dy/n)*w/2,points[i][1]+sign*(dx/n)*w/2]);}
  }
  return [M(...sides[0][0]),...sides[0].slice(1).map(p=>L(...p)),...sides[1].reverse().map(p=>L(...p)),Z()];
}
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
  if(f.family==='curl'){
    const peak=.52+r()*.1,lip=.74+r()*.08;
    const anchors=[[0,h*.98],[w*.19,h*.81],[w*.32,h*.36],[w*peak,h*.075],[w*(peak+.14),h*.12],[w*.83,h*.36],[w*lip,h*.66]];
    crest=curve(anchors);
    foam.push(ribbon(crest,t=>(12+Math.sin(t*Math.PI)*h*.115)*(1+.12*Math.sin(t*31))));
    body=path(M(0,h),C(w*.23,h,w*.21,h*.23,w*peak,h*.065),C(w*.75,-h*.005,w*.88,h*.28,w*.82,h*.48),C(w*.8,h*.59,w*.78,h*.64,w*lip,h*.66),C(w*.73,h*.28,w*.61,h*.24,w*.58,h*.53),C(w*.54,h*.83,w*.9,h*.96,w*1.1,h),L(w*1.12,h+140),L(-32,h+140),Z());
    const count=8+Math.floor(r()*5);
    for(let i=0;i<count;i++){
      const t=.39+i/(count-1)*.58,root=crest[Math.floor(t*(crest.length-1))];
      attachBranches(foam,root,h*(.1+r()*.13),h*(.032+r()*.022),.45+r()*.4,r);
    }
    // Short negative channels break up the broad foam without crossing its back.
    for(let i=0;i<7;i++){
      const p=crest[Math.floor((.32+i*.07)*(crest.length-1))];
      holes.push(ribbon(curve([[p[0]-7,p[1]+8],[p[0]+2,p[1]+17],[p[0]+15,p[1]+28]],12),t=>2.5+4*Math.sin(t*Math.PI)));
    }
    for(let i=0;i<24;i++){const t=.55+r()*.43,p=crest[Math.floor(t*(crest.length-1))];spray.push([p[0]+(r()-.2)*65,p[1]-8-r()*42,1.4+r()*2.1,2+r()*3.5]);}
  }else if(f.family==='breaker'){
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
