import {readFileSync,writeFileSync,readdirSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const files=['index.html',...readdirSync(resolve(root,'src')).filter(f=>/\.(mjs|css)$/.test(f)).map(f=>`src/${f}`)].sort();
const fingerprint=()=>createHash('sha256').update(files.map(f=>f+'\0'+readFileSync(resolve(root,f),'utf8')+'\0').join('')).digest('hex');
const evaluationFiles=[
 'scripts/validate.mjs','research/validation.html','research/validation-loop.md',
 'research/tests/validation-loader.mjs','research/tests/validation-loop.mjs',
 'research/tests/ocean-browser-checks.mjs','research/tests/validation-metrics.mjs',
 'research/tests/crest-phase-checks.mjs','research/tests/evaluation-contract.mjs',
 '.codex/agents/wave-evaluator.toml',
 ...readdirSync(resolve(root,'tests')).filter(f=>f.endsWith('.test.mjs')).map(f=>`tests/${f}`)
].sort();
const evaluationHash=()=>createHash('sha256').update(evaluationFiles.map(f=>f+'\0'+readFileSync(resolve(root,f),'utf8')+'\0').join('')).digest('hex');
const before=fingerprint(),evaluationFingerprint=evaluationHash();
const referenceManifest=JSON.parse(readFileSync(resolve(root,'references/manifest.json'),'utf8'));
const referenceSHA256=createHash('sha256').update(readFileSync(resolve(root,'references/great-wave-off-kanagawa-met-DP130155.jpg'))).digest('hex');
const tests=readdirSync(resolve(root,'tests')).filter(f=>f.endsWith('.test.mjs')).map(f=>resolve(root,'tests',f));
const result=spawnSync(process.execPath,['--test','--test-reporter=tap',...tests],{cwd:root,encoding:'utf8'});
const report={generatedAt:new Date().toISOString(),sourceFiles:files,sourceFingerprint:before,evaluationFiles,evaluationFingerprint,sourceUnchangedDuringRun:before===fingerprint()&&evaluationFingerprint===evaluationHash(),node:process.version,
  referenceSHA256,referenceMatchesPinned:referenceSHA256===referenceManifest.sha256,
  exitCode:result.status,passed:Number(result.stdout?.match(/^# pass (\d+)/m)?.[1]||0),failed:Number(result.stdout?.match(/^# fail (\d+)/m)?.[1]||0),output:result.stdout,errors:result.stderr||result.error?.message||''};
mkdirSync(resolve(root,'research/output'),{recursive:true});
if(report.sourceUnchangedDuringRun&&report.exitCode===0&&report.referenceMatchesPinned){
  report.snapshotRoot=`research/output/validation-snapshots/${before}`;
  report.evaluationSnapshotRoot=`research/output/validation-evaluators/${before}-${evaluationFingerprint}`;
  for(const file of [...files,...evaluationFiles]){const destination=resolve(root,report.evaluationSnapshotRoot,file);mkdirSync(dirname(destination),{recursive:true});writeFileSync(destination,readFileSync(resolve(root,file)));}
  for(const file of files){const destination=resolve(root,report.snapshotRoot,file);mkdirSync(dirname(destination),{recursive:true});writeFileSync(destination,readFileSync(resolve(root,file)));}
}
writeFileSync(resolve(root,'research/output/validation-model.json'),JSON.stringify(report,null,2));
console.log(`${report.passed} model tests passed; ${report.failed} failed. Source ${before.slice(0,12)}.`);
console.log('Open research/validation.html and run the browser stage, then review form and quality.');
if(report.exitCode!==0||!report.sourceUnchangedDuringRun||!report.referenceMatchesPinned||report.failed||!report.passed)process.exitCode=1;
if(!report.referenceMatchesPinned)console.error('Canonical reference integrity failed. Restore the unchanged reference; do not regenerate its pin.');
