import {generateParentFork} from './parent-fork.mjs';
import {cubicBezier,pointInPolygon} from '../../src/procedural/geometry.mjs';
const pt=p=>p.map(v=>v.toFixed(3)).join(',');

export function generateCompactParent(seed=721){
 const baseline=generateParentFork(seed),curves=structuredClone(baseline.curves);
 const byName=new Map(curves.map(c=>[c.feature,c])),modifiedFeatures=[];
 const set=(name,controls)=>{byName.get(name).controls=controls;modifiedFeatures.push(name);};
 const {A,B,C}=baseline.anchors,p=baseline.params;
 const root=[-32,-32],upperEnd=byName.get('P-upper').controls[3];
 set('P-upper',[root,[-3,-30],[118,-8],upperEnd]);
 set('A-outer',[upperEnd,[A[0]-25,55],[A[0]+18,A[1]-24],A]);
 const ar=[A[0]-p.upperReturn,A[1]-15];
 set('A-return',[A,[A[0]-6,A[1]+8],[ar[0],ar[1]+11],ar]);
 set('A-inner',[ar,[ar[0],ar[1]-11],[171,75],[146,90]]);
 const bStart=byName.get('B-outer').controls[0];
 set('B-outer',[bStart,[B[0]+12,B[1]-32],[B[0]+15,B[1]-10],B]);
 const br=[B[0]-p.rightReturn,B[1]-13];
 set('B-return',[B,[B[0]-7.5,B[1]+5],[br[0],br[1]+9],br]);
 set('B-inner',[br,[br[0],br[1]-9],[111,176],[104,191]]);
 const cStart=byName.get('C-outer').controls[0],cr=[C[0]+p.leftReturn,C[1]-14];
 set('C-outer',[cStart,[84,211],[C[0]+7,C[1]],C]);
 set('C-return',[C,[C[0]-6,C[1]],[C[0]-7,C[1]-9],cr]);
 const v=[cr[0]-(C[0]-7),cr[1]-(C[1]-9)];
 set('C-inner',[cr,[cr[0]+v[0]*.6,cr[1]+v[1]*.6],[75,170],[53,174]]);
 // Width changes here remain visible inside the fixed frame, below y=130.
 set('J-left',[[53,174],[33,171],[42,155],[35,147]]);
 set('P-left',[[35,147],[-6,137],[-35,105],[-36,77]]);
 set('P-close',[[-36,77],[-37,39],[-35,-15],root]);
 const outline=[curves[0].controls[0]];
 for(const c of curves)for(let i=1;i<=32;i++)outline.push(cubicBezier(...c.controls,i/32));
 const coverage=baseline.supports.map(s=>{
  let inside=true;
  for(let k=1;k<s.points.length;k++)for(let i=0;i<=12;i++){
   const t=i/12,q=s.points[k-1].map((v,j)=>v+(s.points[k][j]-v)*t);
   for(const d of [[0,0],[3,0],[-3,0],[0,3],[0,-3]])inside&&=pointInPolygon(q.map((v,j)=>v+d[j]),outline);
  }
  return {from:s.from,to:s.to,inside};
 });
 const finite=curves.flatMap(c=>c.controls).flat().every(Number.isFinite)&&outline.flat().every(Number.isFinite);
 if(!finite||!coverage.every(c=>c.inside))throw new Error('Finite nested-support check failed: '+JSON.stringify(coverage));
 const d='M'+pt(curves[0].controls[0])+curves.map(c=>' C'+c.controls.slice(1).map(pt).join(' ')).join('')+' Z';
 // Replace only the first (foam outline) d attribute; preserve exact ink markup.
 const svg=baseline.svg.replace(/(<path d=")[^"]*(" fill="#eeecd5")/,'$1'+d+'$2');
 return {seed,baseline,graph:baseline.graph,anchors:baseline.anchors,params:p,curves,outline,
  ink:baseline.ink,accent:baseline.accent,inkCurves:baseline.inkCurves,supports:baseline.supports,
  modifiedFeatures,coverage,svg,diagnostics:{finite,forkLevelsImplemented:coverage.every(c=>c.inside),
   scope:'sampled support only; curvature and source gain await native review'}};
}
