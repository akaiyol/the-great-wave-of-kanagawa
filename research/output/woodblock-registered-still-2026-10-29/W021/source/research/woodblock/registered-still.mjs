// W020: fixed registered crest integrated into an authored complete still.
// This is source-derived appearance plus interpreted body continuation, not procedural geometry.
const canvas=document.querySelector('canvas'),g=canvas.getContext('2d');
window.registeredStill={ready:false,iteration:'W021'};
const [domain,colors]=await Promise.all([
 fetch('./annotation/crest/annotation.json').then(r=>{if(!r.ok)throw Error('Missing crest domain');return r.json()}),
 fetch('./crest-contours.json').then(r=>{if(!r.ok)throw Error('Missing registered crest colors');return r.json()})
]);
if(domain.iteration!=='W017'||domain.reference.sha256!==colors.sourceSHA256)throw Error('Registered crest provenance mismatch');
const p={paper:'#f1dfbf',foam:'#f6eed8',ink:'#213e5f',blue:'#295e86',wash:'#bec9c3',light:'#e9eddd'};
const cache=document.createElement('canvas');cache.width=colors.width*colors.samplingPerReferenceUnit;cache.height=colors.height*colors.samplingPerReferenceUnit;
const cg=cache.getContext('2d');cg.scale(colors.samplingPerReferenceUnit,colors.samplingPerReferenceUnit);
for(const layer of colors.layers){cg.fillStyle=layer.color;cg.fill(new Path2D(layer.path))}
function polygon(points){const q=new Path2D();points.forEach(([x,y],i)=>i?q.lineTo(x,y):q.moveTo(x,y));q.closePath();return q}
// Remove explicit sky bays on the cache itself, preserving the actual sky beneath.
const crestSurface=document.createElement('canvas');crestSurface.width=850;crestSurface.height=620;
const sg=crestSurface.getContext('2d');sg.scale(2,2);sg.translate(-185,0);sg.clip(polygon(domain.foam.vertices));sg.drawImage(cache,185,50,colors.width,colors.height);
sg.globalCompositeOperation='destination-out';for(const cut of domain.skyExclusions||[])sg.fill(polygon(cut.vertices));
const paths=new Map();function path(d){if(!paths.has(d))paths.set(d,new Path2D(d));return paths.get(d)}
function shape(d,fill,stroke=null,width=1){const q=path(d);if(fill){g.fillStyle=fill;g.fill(q)}if(stroke){g.strokeStyle=stroke;g.lineWidth=width;g.stroke(q)}}
function line(d,color=p.ink,width=1){shape(d,null,color,width)}
// Body geometry is authored in the canonical 1000 × 672 frame. The crest stays registered.
const body='M-30 255 C55 268 156 247 225 203 L250 205 L275 210 L300 220 L325 230 L350 250 L375 275 L399 291 C387 329 387 370 407 404 C423 431 450 451 482 467 C581 519 742 531 848 482 C915 451 951 345 1030 253 L1030 780 L-30 780 Z';
// The paper-colored parent continues across x185 and the pale lower-root portion x185–225.
const upstream='M-30 228 C28 251 69 247 111 208 C143 176 163 151 185 136 L185 200 L225 203 C222 216 219 229 212 241 C194 268 164 284 132 292 C75 308 20 312 -30 324 Z';
// Ribbons begin at fixed-cache diagnostics along the declared root polyline:
// blue intervals x241–247,267–270,289–295,323–329,350–354,380–398.
// Unequal widths and directions continue those registered bands, not evenly spaced new stripes.
const broadRibbons=[
'M241 204.3 L247 204.8 C237 237 236 267 221 304 C203 348 166 393 104 427 L76 438 C151 392 187 343 208 296 C226 257 230 229 241 204.3 Z',
'M267 208.4 L270 209 C265 243 264 277 266 310 C269 364 250 411 217 451 L197 461 C237 412 251 361 248 311 C247 273 254 237 267 208.4 Z',
'M289 215.6 L295 218 C286 252 286 286 295 322 C307 370 305 414 290 457 L270 468 C288 418 292 373 281 326 C271 287 277 248 289 215.6 Z',
'M323 229.2 L329 233.2 C316 263 317 299 331 334 C348 377 356 421 350 461 L334 463 C339 416 334 381 319 342 C305 302 307 260 323 229.2 Z',
'M350 250 L354 254 C344 280 350 306 366 332 C389 370 391 403 413 430 C431 452 451 464 480 476 L463 480 C433 466 411 453 395 432 C375 405 372 373 352 340 C332 306 334 277 350 250 Z',
'M380 278.4 L398 290.8 C385 326 387 362 405 393 C427 432 446 451 482 467 C581 519 742 531 848 482 C915 451 951 345 1030 253 L1030 279 C961 362 930 456 857 496 C739 556 575 542 475 489 C432 467 410 441 388 401 C367 365 363 321 380 278.4 Z'
];
const front='M-30 510 C58 503 121 507 189 470 C244 440 279 395 319 383 C334 378 344 385 353 399 C386 453 426 477 494 496 C660 543 845 512 1030 413 L1030 780 L-30 780 Z';
const frontFoam='M-30 510 C58 503 121 507 189 470 C244 440 279 395 319 383 C334 378 344 385 353 399 C386 453 426 477 494 496 C660 543 845 512 1030 413 L1030 432 C858 531 664 561 492 517 C426 499 390 475 359 438 C346 423 340 408 331 408 C321 410 320 423 313 426 C309 428 308 420 303 422 C298 426 300 434 294 437 C288 437 289 432 286 434 C257 468 230 490 197 505 C126 538 40 548 -30 544 Z';
const foregroundBands=[
'M-30 582 C116 562 228 527 287 465 C302 448 309 430 320 420 C311 452 322 473 352 492 C417 535 520 561 634 561 C784 562 915 516 1030 463 L1030 481 C914 544 779 586 629 581 C503 578 406 553 344 511 C329 501 318 488 313 476 C241 548 133 586 -30 609 Z',
'M-30 634 C146 608 262 574 347 523 C378 505 399 512 420 530 C474 575 570 598 704 596 C830 596 940 557 1030 518 L1030 538 C933 581 831 618 703 620 C568 622 471 596 414 550 C394 535 379 531 361 542 C269 599 149 629 -30 659 Z',
'M203 690 C291 636 370 598 449 599 C528 601 569 637 674 645 C790 652 917 615 1030 571 L1030 591 C913 641 799 674 674 670 C568 666 523 628 448 624 C366 620 298 664 260 690 Z'
];
const paleRibbons=[
'M-30 554 C129 547 222 510 280 459 C267 482 245 504 212 524 C143 566 54 576 -30 582 Z',
'M343 441 C371 486 415 512 473 532 C612 578 782 579 936 517 C968 503 999 487 1030 469 L1030 479 C1000 498 970 515 938 529 C782 597 606 590 469 543 C408 522 363 489 343 441 Z',
'M432 552 C494 602 584 625 690 626 C830 626 940 585 1030 545 L1030 556 C938 598 826 644 688 642 C577 641 492 610 432 552 Z',
'M735 696 C848 686 952 651 1030 621 L1030 638 C952 669 848 706 735 713 Z'
];
function render(){
 const w=innerWidth,h=innerHeight,dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
 const scale=Math.max(w/1000,h/672),offsetX=(w-1000*scale)/2;
 g.setTransform(dpr*scale,0,0,dpr*scale,dpr*offsetX,0);g.lineCap='round';g.lineJoin='round';
 const visibleBottom=h/scale,sky=g.createLinearGradient(0,0,0,672);sky.addColorStop(0,'#eed9ad');sky.addColorStop(.35,'#f6eed8');sky.addColorStop(.70,'#f6eed8');sky.addColorStop(.90,'#d9d7c5');sky.addColorStop(1,'#b3b5a4');g.fillStyle=sky;g.fillRect(-100,0,1200,Math.max(780,visibleBottom));
 // Quiet irregular cloud masses, behind the crest; no outlines or added paper noise.
 shape('M555 101 C570 77 588 88 605 85 C624 84 629 66 644 65 C663 61 672 77 690 75 C709 69 724 45 742 54 C754 59 754 76 772 82 C791 88 806 91 807 105 C807 118 783 120 769 122 C740 127 723 142 694 142 C667 141 651 128 629 131 C598 136 581 127 564 127 C549 125 546 113 555 101 Z','#f9f0db');
 shape('M65 126 C82 116 96 121 110 115 C125 108 131 98 147 100 C165 103 172 116 189 117 C204 119 216 123 216 131 C213 142 191 143 177 142 C152 141 143 150 126 149 C107 149 97 141 80 144 C64 146 56 136 65 126 Z','#f6eed8');
 shape('M-30 514 C190 499 371 507 542 501 C728 495 849 461 938 389 C975 359 1003 330 1030 302 L1030 780 L-30 780 Z','#8d9994');
 shape(body,p.ink,p.ink,1.2);
 g.save();g.clip(path(body));for(const d of broadRibbons)shape(d,p.blue);
 // Flow contours start well below the registration boundary; no pale line bundle crosses it.
 line('M177 359 C157 391 129 414 94 435',p.wash,1);
 line('M251 337 C250 376 238 414 215 443',p.wash,1);
 line('M296 361 C301 395 298 426 286 454',p.wash,1);
 line('M365 378 C375 407 384 433 405 450',p.wash,1);
 g.restore();shape(upstream,p.foam);
 // Only the printed exterior gets ink; artificial crop/registration closures are not contours.
 line('M-30 228 C28 251 69 247 111 208 C143 176 163 151 185 136',p.ink,1.1);
 // Pale field continues around the left parent root, following its broad downward return.
 shape('M185 200 L225 203 C222 218 217 231 207 244 C179 277 141 294 92 306 C47 317 7 321 -30 327 L-30 340 C25 334 73 328 116 316 C163 303 195 286 217 257 C232 237 233 220 225 203 Z',p.foam);
 g.drawImage(crestSurface,185,0,425,310);
 // Secondary right-hand swell closes the main negative-space bowl.
 shape('M662 511 C786 515 871 474 927 412 C963 371 990 321 1030 282 L1030 320 C1001 351 978 393 947 433 C884 516 778 548 662 530 Z',p.foam,p.ink,1.1);
 shape('M735 526 C834 510 907 462 952 400 C976 367 999 334 1030 310 L1030 327 C1005 354 982 387 961 416 C909 488 839 522 735 537 Z',p.wash);
 shape(front,p.ink,p.ink,1.2);for(const d of foregroundBands)shape(d,p.blue);shape(frontFoam,p.foam,p.ink,1);for(const d of paleRibbons)shape(d,p.foam);
 // Supporting breaker has flowing wash branches and a small number of contour returns.
 shape('M179 497 C244 463 282 410 319 391 C333 385 341 399 350 412 C333 405 326 410 318 421 C300 449 275 474 244 491 C221 503 203 505 179 509 Z',p.wash);
 line('M269 449 C281 433 287 415 300 411 C309 408 312 413 309 419 M313 402 C319 395 327 396 330 402 C332 407 328 411 325 408 M335 414 C337 425 347 433 359 440',p.blue,1.2);
 line('M366 494 C446 551 561 583 692 582 C809 583 930 542 1030 497',p.wash,1.4);
 line('M468 591 C530 624 612 648 701 650 C825 652 943 613 1030 577',p.wash,1.1);
 window.registeredStill={ready:true,iteration:'W021',scope:'Complete fixed colored still experiment; registered crest with authored water continuation and clouds. No boats or Fuji. No production migration or procedural claim.',provenance:{reference:domain.reference,crestColors:'research/woodblock/crest-contours.json',crestDomain:'research/woodblock/annotation/crest/annotation.json',domainIteration:domain.iteration,colorKind:colors.kind,originalScanDrawn:false},uncertainty:[...domain.uncertainty,'W020 joins use declared root color diagnostics; pale x185–225 and x399–426 root intervals continue as paper/foam rather than water. Microtexture and interpreted band directions may still reveal registration boundaries.','Principal-water mask is unused and unverified; original registered color layers retain source appearance.','Foreground and right swell are authored interpretations, not source reconstructions.'],viewport:{width:w,height:h,dpr,scale,offsetX,offsetY:0,visibleSource:[-offsetX/scale,0,w/scale,h/scale],fit:'uniform cover, top aligned'},stats:{registeredLayers:colors.layers.length,registeredDomainVertices:domain.foam.vertices.length,explicitSkyCuts:domain.skyExclusions.length,clouds:2,authoredBands:broadRibbons.length+foregroundBands.length+paleRibbons.length},render};
}
addEventListener('resize',render);render();
