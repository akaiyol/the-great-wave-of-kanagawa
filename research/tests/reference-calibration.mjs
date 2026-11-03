const $=id=>document.getElementById(id);
const sha=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),n=>n.toString(16).padStart(2,'0')).join('');
const encode=text=>new TextEncoder().encode(text);
const read=async path=>{const r=await fetch(path,{cache:'no-store'});if(!r.ok)throw Error(`Missing calibration input: ${path}`);return r;};
async function fileIdentity(files,base){
 if(!Array.isArray(files)||!files.length)throw Error('Missing identity file list');
 return sha(encode((await Promise.all(files.map(async f=>f+'\0'+await (await read(`${base}${f}`)).text()+'\0'))).join('')));
}
async function decoded(bytes,type){
 const url=URL.createObjectURL(new Blob([bytes],{type}));try{const image=new Image();image.src=url;await image.decode();return image;}finally{URL.revokeObjectURL(url);}
}
function black(canvas){const g=canvas.getContext('2d');g.save();g.globalCompositeOperation='destination-over';g.fillStyle='#000';g.fillRect(0,0,canvas.width,canvas.height);g.restore();}
async function png(id,filename,identity){
 const canvas=$(id),blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('PNG encoding failed');
 const pngDataURL=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.readAsDataURL(blob);});
 return {blob,metadata:{id,filename,mime:'image/png',width:canvas.width,height:canvas.height,sha256:await sha(await blob.arrayBuffer()),identity},pngDataURL};
}
$('calibration-run').onclick=async()=>{
 $('calibration-run').disabled=true;$('calibration-status').textContent='Checking receipt identities and reference inputs…';$('calibration-payload').value='';$('calibration-receipt').textContent='No current receipt.';
 for(const a of $('calibration-downloads').querySelectorAll('a'))URL.revokeObjectURL(a.href);$('calibration-downloads').replaceChildren();
 for(const id of ['calibration-reference','calibration-mask','calibration-sampled'])$(id).getContext('2d').clearRect(0,0,360,280);
 try{
  const modelBytes=await (await read('output/validation-model.json')).arrayBuffer(),model=JSON.parse(new TextDecoder().decode(modelBytes));
  const validHash=s=>typeof s==='string'&&/^[a-f0-9]{64}$/.test(s);
  if(![model.sourceFingerprint,model.evaluationFingerprint,model.referenceSHA256].every(validHash)||model.snapshotRoot!==`research/output/validation-snapshots/${model.sourceFingerprint}`||model.evaluationSnapshotRoot!==`research/output/validation-evaluators/${model.sourceFingerprint}-${model.evaluationFingerprint}`||model.exitCode!==0||model.failed!==0||model.passed<=0||!model.sourceUnchangedDuringRun||!model.referenceMatchesPinned)throw Error('Model receipt is incomplete; refresh it after source edits are complete.');
  const [snapshotSHA,evaluatorSHA,referenceBytes,svgBytes,jsonBytes,manifest,studyHTML,studyJS]=await Promise.all([
   fileIdentity(model.sourceFiles,`../${model.snapshotRoot}/`),fileIdentity(model.evaluationFiles,`../${model.evaluationSnapshotRoot}/`),
   read('../references/great-wave-off-kanagawa-met-DP130155.jpg').then(r=>r.arrayBuffer()),read('geometry/reference-foam-interior.svg').then(r=>r.arrayBuffer()),read('geometry/reference-foam-interior.json').then(r=>r.arrayBuffer()),read('../references/manifest.json').then(r=>r.json()),read('reference-calibration.html').then(r=>r.text()),read('tests/reference-calibration.mjs').then(r=>r.text())
  ]);
  const referenceSHA256=await sha(referenceBytes),svgSHA256=await sha(svgBytes),jsonSHA256=await sha(jsonBytes),fragment=JSON.parse(new TextDecoder().decode(jsonBytes));
  if(snapshotSHA!==model.sourceFingerprint||evaluatorSHA!==model.evaluationFingerprint||referenceSHA256!==model.referenceSHA256||referenceSHA256!==manifest.sha256)throw Error('Snapshot, evaluator or canonical reference identity mismatch.');
  if(JSON.stringify(fragment.frame)!=='[1000,672]'||JSON.stringify(fragment.crop)!=='[270,90,90,70]')throw Error('Interior fragment coordinate contract changed.');
  const svgDocument=new DOMParser().parseFromString(new TextDecoder().decode(svgBytes),'image/svg+xml');
  if(svgDocument.querySelector('parsererror')||svgDocument.documentElement.getAttribute('viewBox')!=='270 90 90 70')throw Error('Interior SVG frame does not match the calibration ROI.');
  const rendererURL=new URL(`../${model.snapshotRoot}/src/render.mjs`,location.href),{DOT_STEP,drawDotSamples}=await import(rendererURL.href);
  if(DOT_STEP!==4||typeof drawDotSamples!=='function')throw Error('Unsupported production sampling protocol.');
  const [reference,mask]=await Promise.all([decoded(referenceBytes,'image/jpeg'),decoded(svgBytes,'image/svg+xml')]);
  const sourceRect=[270/1000*reference.width,90/672*reference.height,90/1000*reference.width,70/672*reference.height];
  $('calibration-reference').getContext('2d').drawImage(reference,...sourceRect,0,0,360,280);
  const raw=$('calibration-mask');raw.getContext('2d').drawImage(mask,0,0,360,280);black(raw);
  const grid=Object.assign(document.createElement('canvas'),{width:360/DOT_STEP,height:280/DOT_STEP}),gg=grid.getContext('2d',{willReadFrequently:true});gg.drawImage(mask,0,0,grid.width,grid.height);
  const rgba=gg.getImageData(0,0,grid.width,grid.height).data,samples=Uint8Array.from({length:rgba.length/4},(_,i)=>+(rgba[i*4+3]>=128&&rgba[i*4]>=128));
  drawDotSamples($('calibration-sampled').getContext('2d'),samples,grid.width,grid.height);black($('calibration-sampled'));
  const studyFingerprint=await sha(encode('research/reference-calibration.html\0'+studyHTML+'\0research/tests/reference-calibration.mjs\0'+studyJS+'\0'));
  const protocol={version:1,kind:'reference-derived-interior-calibration',normalizedFrame:[1000,672],roi:[270,90,90,70],canonicalSourceSize:[reference.width,reference.height],canonicalSourceRect:sourceRect,panelPixels:[360,280],panelCSSPixels:[360,280],worldUnitsPerReferenceUnit:4,cssPixelsPerWorldUnit:1,pngPixelsPerWorldUnit:1,dotPitch:DOT_STEP,sampleGrid:[grid.width,grid.height],sampling:'Rasterize existing SVG directly to 90x70 transparent canvas; alpha>=128 and red>=128 occupancy; snapshot drawDotSamples at world origin [0,0].',worldTransform:[4,0,0,4,-1080,-360],referenceTreatment:'Crop and display resampling only; source bytes unchanged.',viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,userAgent:navigator.userAgent};
  const protocolSHA256=await sha(encode(JSON.stringify(protocol))),identity=await sha(encode(JSON.stringify({source:model.sourceFingerprint,evaluator:model.evaluationFingerprint,model:await sha(modelBytes),reference:referenceSHA256,svg:svgSHA256,json:jsonSHA256,study:studyFingerprint,protocol:protocolSHA256})));
  const assets=await Promise.all([png('calibration-reference','calibration-reference.png',identity),png('calibration-mask','calibration-mask.png',identity),png('calibration-sampled','calibration-sampled.png',identity)]);
  const receipt={schemaVersion:1,generatedAt:new Date().toISOString(),kind:'reference-derived calibration evidence',userLabeling:'pending',productionAcceptance:'not_assessed',repeatableSceneryAcceptance:'not_assessed',fullMaskAcceptance:'not_established',identity,sourceIdentityScope:'Checked immutable model-receipt snapshot; live working-tree freshness is not assessed by this study.',sourceFingerprint:model.sourceFingerprint,snapshotRoot:model.snapshotRoot,snapshotFingerprint:snapshotSHA,evaluationFingerprint:model.evaluationFingerprint,evaluationSnapshotRoot:model.evaluationSnapshotRoot,modelReceiptSHA256:await sha(modelBytes),model:{generatedAt:model.generatedAt,passed:model.passed,failed:model.failed},rendererModule:rendererURL.href,referenceSHA256,svgSHA256,jsonSHA256,studyFingerprint,studyIdentityScope:'Separate study files; not part of the model receipt evaluator file list.',protocol,protocolSHA256,fragment:{status:fragment.status,source:fragment.source,historicalMethod:fragment.method},captures:assets.map(a=>a.metadata),limits:['Interior ROI only; excludes the pale-sky boundary and does not establish complete semantic segmentation.','Existing run-based vectorization is reused without new brightness segmentation.','No generated crest, procedural variation, ocean composition or production acceptance is assessed.']};
  const download=(blob,filename,label)=>{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;a.textContent=label;$('calibration-downloads').append(a);};
  download(new Blob([JSON.stringify(receipt,null,2)],{type:'application/json'}),'reference-calibration.json','Download receipt');for(const a of assets)download(a.blob,a.metadata.filename,a.metadata.filename);
  $('calibration-payload').value=JSON.stringify({receipt,artifacts:assets.map(a=>({...a.metadata,pngDataURL:a.pngDataURL}))});$('calibration-receipt').textContent=JSON.stringify(receipt,null,2);
  $('calibration-provenance').textContent=`Existing asset provenance: ${fragment.method}. This page reuses the existing SVG; it performs no new image-brightness segmentation.`;
  $('calibration-status').textContent='Three reference-derived calibration PNGs ready. User labeling pending; production and scenery acceptance not assessed.';
 }catch(error){$('calibration-status').textContent=`Calibration incomplete: ${error.message}`;$('calibration-payload').value='';$('calibration-receipt').textContent='Calibration incomplete; no current receipt.';}
 finally{$('calibration-run').disabled=false;}
};
