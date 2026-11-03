// Load evaluator dependencies from the same immutable snapshot as its receipt.
try{
 const response=await fetch('output/validation-model.json',{cache:'no-store'});
 if(!response.ok)throw Error('Run node scripts/validate.mjs first.');
 const model=await response.json();
 const expected=`research/output/validation-evaluators/${model.sourceFingerprint}-${model.evaluationFingerprint}`;
 if(!/^[a-f0-9]{64}$/.test(model.evaluationFingerprint)||model.evaluationSnapshotRoot!==expected)throw Error('Rerun node scripts/validate.mjs to snapshot the evaluator.');
 const url=new URL(`../${expected}/research/tests/validation-loop.mjs`,location.href);
 url.searchParams.set('evaluation',model.evaluationFingerprint);
 await import(url);
}catch(error){document.getElementById('run-status').textContent=error.message;document.getElementById('validate').disabled=true;}
