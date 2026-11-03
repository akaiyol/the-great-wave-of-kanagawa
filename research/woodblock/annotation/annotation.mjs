const query=new URLSearchParams(location.search),dataset=query.get('data')||'./annotation.json',colorMode=query.get('color')==='1';
const data=await fetch(dataset).then(r=>{if(!r.ok)throw Error('Annotation unavailable');return r.json()});
document.querySelector('header').textContent=`${data.iteration} · ${data.scope} · Unreviewed`;
document.querySelector('footer').textContent=data.uncertainty.join(' ')+(colorMode?' Color view is a fixed source-derived reconstruction clipped by the outer domain and sky cuts. Its original water colors do not validate the separate principal-water mask or procedural readiness.':'');
if(colorMode)document.querySelector('#mask').previousElementSibling.textContent='Source colors through annotated domain · fixed control';
const image=new Image();image.src='../../../references/great-wave-off-kanagawa-met-DP130155.jpg';await image.decode();
let colorData=null,colorCache=null;
if(colorMode){
 colorData=await fetch('../crest-contours.json').then(r=>r.json());
 if(colorData.sourceSHA256!==data.reference.sha256)throw Error('Color/reference identity mismatch');
 colorCache=document.createElement('canvas');colorCache.width=colorData.width*colorData.samplingPerReferenceUnit;colorCache.height=colorData.height*colorData.samplingPerReferenceUnit;
 const cg=colorCache.getContext('2d');cg.scale(colorData.samplingPerReferenceUnit,colorData.samplingPerReferenceUnit);
 for(const layer of colorData.layers){cg.fillStyle=layer.color;cg.fill(new Path2D(layer.path))}
}
function polygon(g,points){g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath()}
function clipped(g,draw){g.save();polygon(g,data.foam.vertices);g.clip();draw();g.restore()}
function render(){
 const[left,top,w,h]=data.context,dpr=Math.min(devicePixelRatio||1,2);
 for(const id of['source','overlay','mask']){
  const canvas=document.getElementById(id);canvas.style.aspectRatio=`${w}/${h}`;const cw=canvas.clientWidth,ch=cw*h/w;
  canvas.width=Math.round(cw*dpr);canvas.height=Math.round(ch*dpr);const g=canvas.getContext('2d');g.setTransform(dpr*cw/w,0,0,dpr*cw/w,0,0);
  g.fillStyle=id==='mask'&&!colorMode?'#193e58':'#e8d7b1';g.fillRect(0,0,w,h);
  if(id!=='mask')g.drawImage(image,left/1000*image.naturalWidth,top/672*image.naturalHeight,w/1000*image.naturalWidth,h/672*image.naturalHeight,0,0,w,h);
  g.translate(-left,-top);if(id==='source')continue;
  polygon(g,data.foam.vertices);
  if(id==='mask'){
   if(colorMode)clipped(g,()=>{g.drawImage(colorCache,colorData.roi[0],colorData.roi[1],colorData.width,colorData.height);g.fillStyle='#e8d7b1';for(const v of data.skyExclusions||[]){polygon(g,v.vertices);g.fill()}});
   else{g.fillStyle='#f3eed9';g.fill();clipped(g,()=>{g.fillStyle='#193e58';for(const v of[...(data.waterExclusions||[]),...(data.skyExclusions||[])]){polygon(g,v.vertices);g.fill()}})}
  }else{
   g.fillStyle='#ff334426';g.fill();g.strokeStyle='#d51c3b';g.lineWidth=.2;g.stroke();
   clipped(g,()=>{for(const v of data.waterExclusions||[]){polygon(g,v.vertices);g.fillStyle='#1260c52b';g.fill();g.strokeStyle='#1260c5';g.stroke()}
    for(const v of data.skyExclusions||[]){polygon(g,v.vertices);g.fillStyle='#00d4cf26';g.fill();g.strokeStyle='#00a4a0';g.stroke()}});
   for(const gap of data.exteriorSkyGaps||[]){polygon(g,gap.vertices);g.strokeStyle='#00d4cf';g.stroke()}
  }
  for(const{from,to}of(data.rootCuts||[data.rootCut])){g.beginPath();g.moveTo(...from);g.lineTo(...to);g.strokeStyle='#e34134';g.lineWidth=.35;g.stroke()}
 }
 window.waveAnnotation={ready:true,dataset,iteration:data.iteration,status:data.status,context:data.context,vertexCount:data.foam.vertices.length,waterExclusionCount:data.waterExclusions?.length||0,skyExclusionCount:data.skyExclusions?.length||0,rootCut:data.rootCut,scope:data.scope,uncertainty:data.uncertainty,colorControl:colorMode?{kind:'fixed_source_color_control',sourceSHA256:colorData.sourceSHA256,notWaterMaskApproval:true,notProcedural:true}:false};
}
addEventListener('resize',render);render();
