import {CREST_FIXTURES,requireCrestFixture,reviewIdentity} from './evaluation-contract.mjs';
import {FOCUSED_PROTOCOL,focusedCaptureKey,requireFocusedEvidence} from './focused-capture-contract.mjs';
export {FOCUSED_PROTOCOL};
const make=(w,h)=>Object.assign(document.createElement('canvas'),{width:w,height:h});
const black=canvas=>{const g=canvas.getContext('2d');g.save();g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='destination-over';g.fillStyle='#000';g.fillRect(0,0,canvas.width,canvas.height);g.restore();};
export async function captureFocused({receipt,original,OceanRenderer,sceneFeatures,waveGeometry,drawFoam,drawDotSamples,DOT_STEP,sha,host}){
 host.replaceChildren();const assets=[],identity=reviewIdentity(receipt.sourceFingerprint,receipt.referenceSHA256,receipt.evaluationFingerprint,receipt.renderProtocolFingerprint);
 const sheet=make(720,CREST_FIXTURES.length*264),sg=sheet.getContext('2d');sg.fillStyle='#000';sg.fillRect(0,0,sheet.width,sheet.height);
 async function record(id,canvas,metadata={}){
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error(`PNG encoding failed: ${id}`);
  const bytes=await blob.arrayBuffer(),pngDataURL=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob);});assets.push({id,canvas,blob,pngDataURL,metadata:{id,filename:`${id}.png`,mime:'image/png',width:canvas.width,height:canvas.height,sha256:await sha(bytes),identity,...metadata}});
 }
 for(const [index,fixture] of CREST_FIXTURES.entries()){
  const f=requireCrestFixture(sceneFeatures(fixture.seed,0,15360),fixture),geometry=waveGeometry(f),sprite=new OceanRenderer(fixture.seed).sprite(f);
  const width=sprite.canvas.width*DOT_STEP,height=sprite.canvas.height*DOT_STEP,origin=[sprite.x*DOT_STEP,sprite.y*DOT_STEP];
  const raw=make(width,height),rg=raw.getContext('2d');rg.translate(f.x-origin[0],f.y-origin[1]);drawFoam(rg,geometry);black(raw);
  const rgba=sprite.canvas.getContext('2d').getImageData(0,0,sprite.canvas.width,sprite.canvas.height).data,mask=Uint8Array.from({length:rgba.length/4},(_,i)=>+(rgba[i*4+3]>=128&&rgba[i*4]>=128));
  const sampled=make(width,height);drawDotSamples(sampled.getContext('2d'),mask,sprite.canvas.width,sprite.canvas.height);black(sampled);
  const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent=`Seed ${fixture.seed}, ${fixture.id}, layer ${fixture.layer}: native 1 CSS pixel/world unit`;details.append(summary);host.append(details);
  for(const [column,[kind,canvas]] of ['raw','sampled'].map((kind,i)=>[i,[kind,i?sampled:raw]])){
   const id=focusedCaptureKey(fixture,kind);canvas.id=`focused-${id}`;canvas.style.cssText=`width:${width}px;height:${height}px;max-width:none;flex:none`;canvas.setAttribute('aria-label',`${summary.textContent}; ${kind}`);
   const scroll=document.createElement('div');scroll.style.overflow='auto';scroll.append(canvas);details.append(scroll);
   const scale=Math.min(352/width,232/height),x=column*360+(360-width*scale)/2,y=index*264+24+(240-height*scale)/2;
   sg.drawImage(canvas,x,y,width*scale,height*scale);sg.fillStyle='#ddd';sg.font='12px monospace';sg.fillText(`${fixture.seed}/${fixture.id} ${kind}`,column*360+6,index*264+16);
   await record(id,canvas,{fixture:{seed:fixture.seed,id:fixture.id,layer:fixture.layer},worldBounds:[...origin,width,height],cssPixelsPerWorldUnit:1,pngPixelsPerWorldUnit:1,spray:true});
  }
 }
 sheet.id='focused-contact-sheet';sheet.style.maxWidth='720px';host.prepend(sheet);await record('contact-sheet',sheet,{role:'scaled-preview',panel:[360,240]});
 const [x,y,w,h]=FOCUSED_PROTOCOL.referenceCropNormalized,[nw,nh]=FOCUSED_PROTOCOL.referenceNormalizedSize;
 const crop=make(Math.round(w/nw*original.width),Math.round(h/nh*original.height));crop.id='focused-reference-crop';crop.getContext('2d').drawImage(original,x/nw*original.width,y/nh*original.height,w/nw*original.width,h/nh*original.height,0,0,crop.width,crop.height);crop.style.maxWidth='810px';host.append(crop);
 await record('reference-crop',crop,{role:'canonical-reference-crop',sourceSHA256:receipt.referenceSHA256,sourceRect:[x/nw*original.width,y/nh*original.height,w/nw*original.width,h/nh*original.height]});
 receipt.captures=assets.map(a=>a.metadata);receipt.captureCoverage=requireFocusedEvidence(receipt);
 return assets;
}
export function publishFocused(receipt,assets){
 const payload=document.getElementById('focused-payload'),links=document.getElementById('focused-downloads');
 for(const node of links.querySelectorAll('a'))URL.revokeObjectURL(node.href);links.replaceChildren();
 const download=(blob,filename,label)=>{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;a.textContent=label;a.style.marginRight='14px';links.append(a);};
 download(new Blob([JSON.stringify(receipt,null,2)],{type:'application/json'}),'focused-validation.json','Download focused receipt');
 for(const a of assets)download(a.blob,a.metadata.filename,a.id);
 payload.value=JSON.stringify({receipt,artifacts:assets.map(a=>({...a.metadata,pngDataURL:a.pngDataURL}))});
 document.getElementById('focused-json').textContent=JSON.stringify(receipt,null,2);
}
