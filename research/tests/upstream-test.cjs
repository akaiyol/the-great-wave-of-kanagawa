// Execute the reviewed generation functions in an isolated VM, without its UI.
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const {performance}=require('node:perf_hooks');
const html=fs.readFileSync('research/vendor/shan-shui-inf/index.html','utf8');
const scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]);
const source=scripts.slice(0,7).join('\n').split('document.addEventListener')[0];
function context(){
  const s={console:{log(){}},window:{location:{href:'http://local/?seed=721'},btoa:s=>Buffer.from(s,'binary').toString('base64')}};
  vm.createContext(s);vm.runInContext(source,s,{timeout:20000});return s;
}
function snapshot(s,x){
  const start=performance.now();vm.runInContext(`chunkloader(${x},${x+1200});chunkrender(${x},${x+1200})`,s,{timeout:30000});
  return {x,ms:performance.now()-start,retainedObjects:s.MEM.chunks.length,
    retainedSVGCharacters:s.MEM.chunks.reduce((a,c)=>a+c.canv.length,0),visibleSVGCharacters:s.MEM.canv.length,
    digest:crypto.createHash('sha256').update(s.MEM.canv).digest('hex')};
}
const a=context(),samples=[];
for(let x=0;x<=8192;x+=1024)samples.push(snapshot(a,x));
const firstB=snapshot(context(),0);
const result={sourceSHA256:crypto.createHash('sha256').update(html).digest('hex'),
  identicalInitialSeed:samples[0].digest===firstB.digest,samples,
  externalScriptImports:[...html.matchAll(/<script[^>]+src\s*=/gi)].length,
  note:'VM test of original generation functions; excludes SVG DOM parse, browser layout and paint.'};
fs.writeFileSync('research/output/upstream-results.json',JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
