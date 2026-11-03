import {CREST_FIXTURES,reviewIdentity,requirePhaseCoverage} from './evaluation-contract.mjs';
export const FOCUSED_PROTOCOL={version:1,mode:'focused',nativeCSSPixelsPerWorldUnit:1,pngPixelsPerWorldUnit:1,spray:true,phaseSpray:false,phaseOffsets:16,contactPanel:[360,240],referenceCropNormalized:[200,50,405,265],referenceNormalizedSize:[1000,672]};
export const FOCUSED_UNRUN_CHECKS=['Tile continuity and water occlusion','Regeneration and retained cache bounds','White-dot output and declared sky region','Generated ocean coverage'];
export function focusedCaptureKey(fixture,kind){return `fixture-${fixture.seed}-${fixture.id.replaceAll(':','-')}-${kind}`;}
export function requireFocusedEvidence(receipt){
 const identity=reviewIdentity(receipt.sourceFingerprint,receipt.referenceSHA256,receipt.evaluationFingerprint,receipt.renderProtocolFingerprint);
 if(receipt.mode!=='focused'||receipt.expected?.status!=='incomplete'||!['pass','fail'].includes(receipt.expected?.focusedChecks)||JSON.stringify(receipt.renderProtocol?.focused)!==JSON.stringify(FOCUSED_PROTOCOL))throw Error('Inconsistent focused protocol or status');
 if(!Array.isArray(receipt.unrunChecks)||receipt.unrunChecks.length!==FOCUSED_UNRUN_CHECKS.length||FOCUSED_UNRUN_CHECKS.some(name=>receipt.unrunChecks.filter(c=>c.name===name&&c.status==='not_run').length!==1))throw Error('Unrun full-validation checks must remain not_run');
 requirePhaseCoverage(receipt.crestPhases?.records||[],4);
 const required=['contact-sheet','reference-crop',...CREST_FIXTURES.flatMap(f=>['raw','sampled'].map(k=>focusedCaptureKey(f,k)))];
 if(!Array.isArray(receipt.captures)||receipt.captures.length!==required.length)throw Error('Incomplete focused captures');
 for(const id of required){
  const matches=receipt.captures.filter(c=>c.id===id);
  if(matches.length!==1)throw Error(`Missing or duplicate focused capture: ${id}`);
  const c=matches[0];
  if(!/^[a-f0-9]{64}$/.test(c.sha256)||c.identity!==identity||!Number.isInteger(c.width)||!Number.isInteger(c.height)||c.width<=0||c.height<=0||c.mime!=='image/png')throw Error(`Invalid focused capture identity or PNG metadata: ${id}`);
 }
 for(const f of CREST_FIXTURES){
  const pair=['raw','sampled'].map(k=>receipt.captures.find(c=>c.id===focusedCaptureKey(f,k)));
  if(pair.some(c=>c.cssPixelsPerWorldUnit!==1||c.pngPixelsPerWorldUnit!==1||c.fixture?.seed!==f.seed||c.fixture?.id!==f.id||c.fixture?.layer!==f.layer||!Array.isArray(c.worldBounds)||c.worldBounds.length!==4||!c.worldBounds.every(Number.isFinite)||c.worldBounds[2]!==c.width||c.worldBounds[3]!==c.height)||JSON.stringify(pair[0].worldBounds)!==JSON.stringify(pair[1].worldBounds))throw Error(`Inconsistent native-scale capture: ${f.seed}/${f.id}`);
 }
 return {captures:required.length,fixtures:CREST_FIXTURES.length,phases:96};
}
