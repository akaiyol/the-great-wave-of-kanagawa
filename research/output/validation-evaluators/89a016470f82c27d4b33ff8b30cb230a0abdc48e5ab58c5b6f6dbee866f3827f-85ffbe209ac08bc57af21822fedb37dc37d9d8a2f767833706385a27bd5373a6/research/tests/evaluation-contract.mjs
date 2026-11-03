export const CREST_FIXTURES = [
 {seed:721,layer:2,id:'2:0:0',channels:4},
 {seed:721,layer:1,id:'1:1:2',channels:4},
 {seed:13891,layer:2,id:'2:2:0',channels:4},
 {seed:13891,layer:1,id:'1:2:0',channels:4},
 {seed:0,layer:2,id:'2:4:0',channels:4},
 {seed:0,layer:1,id:'1:5:1',channels:4}
];
export function reviewIdentity(source,reference,evaluation){
 if([source,reference,evaluation].some(v=>typeof v!=='string'||!/^[a-f0-9]{64}$/.test(v)))throw Error('Incomplete evaluation identity');
 return `${source}:${reference}:${evaluation}`;
}
export function requireCrestFixture(features,fixture){
 const matches=features.filter(f=>f.id===fixture.id&&f.family==='curl'&&f.layer===fixture.layer&&f.x>=0);
 if(matches.length!==1)throw Error(`Missing or duplicate fixed curl fixture: ${fixture.seed}/${fixture.id}`);
 return matches[0];
}
export function requireChannels(channels,fixture){
 if(!Array.isArray(channels)||channels.length!==fixture.channels)throw Error(`Channel coverage changed for ${fixture.seed}/${fixture.id}; revise the coverage contract separately`);
 if(channels.some(c=>['head','mouth'].some(k=>!Array.isArray(c?.[k])||c[k].length!==2||!c[k].every(Number.isFinite))))throw Error('Invalid channel probe coordinates');
}
export function requirePhaseCoverage(records,dotStep){
 if(dotStep!==4||records.length!==CREST_FIXTURES.length)throw Error('Incomplete fixed sampling coverage');
 for(const fixture of CREST_FIXTURES){
  const matches=records.filter(r=>r.seed===fixture.seed&&r.layer===fixture.layer&&r.id===fixture.id);
  if(matches.length!==1)throw Error('Missing or duplicate phase fixture record');
  const phases=matches[0].phases;
  if(phases.length!==16||new Set(phases.map(p=>`${p.dx}:${p.dy}`)).size!==16||phases.some(p=>![p.dx,p.dy].every(v=>Number.isInteger(v)&&v>=0&&v<4)||p.channels.length!==fixture.channels))throw Error('Incomplete phase or channel coverage');
 }
 return {fixtures:records.length,phases:96,headProbes:384,mouthProbes:384};
}
