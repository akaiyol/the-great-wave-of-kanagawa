// W019: fixed registered crest integrated into an authored complete still.
// This is source-derived appearance plus interpreted body continuation, not procedural geometry.
const canvas=document.querySelector('canvas'),g=canvas.getContext('2d');
window.registeredStill={ready:false,iteration:'W019'};
const [domain,colors]=await Promise.all([
 fetch('./annotation/crest/annotation.json').then(r=>{if(!r.ok)throw Error('Missing crest domain');return r.json()}),
 fetch('./crest-contours.json').then(r=>{if(!r.ok)throw Error('Missing registered crest colors');return r.json()})
]);
if(domain.iteration!=='W017'||domain.reference.sha256!==colors.sourceSHA256)throw Error('Registered crest provenance mismatch');
const p={paper:'#f1dfbf',foam:'#faf6e2',ink:'#213e5f',blue:'#295e86',wash:'#bec9c3',light:'#e9eddd'};
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
const body='M-30 255 C55 268 110 206 185 180 L250 203 L275 209 L300 218 L325 228 L350 248 L375 273 L426 308 C404 339 390 372 407 404 C423 431 450 451 482 467 C581 519 742 531 848 482 C915 451 951 345 1030 253 L1030 780 L-30 780 Z';
const upstream='M-30 228 C28 251 69 247 111 208 C143 176 163 151 185 136 L206 144 L211 182 L185 200 C153 221 137 249 113 270 C77 302 29 324 -30 321 Z';
const broadRibbons=[
'M-30 331 C58 316 113 282 157 241 C180 219 198 205 215 202 C200 223 184 253 179 281 C163 336 112 389 43 424 L-30 444 Z',
'M83 449 C164 402 196 350 205 290 C210 253 221 223 240 207 L253 207 C225 240 225 274 229 308 C235 371 202 427 151 466 Z',
'M192 470 C246 429 263 376 257 324 C251 283 252 240 275 210 L285 214 C270 252 279 289 284 323 C297 388 277 435 248 474 Z',
'M286 469 C320 424 319 381 307 337 C296 293 298 251 312 225 L325 231 C310 268 327 302 339 333 C357 379 357 425 338 466 Z',
'M379 459 C391 426 379 388 360 350 C343 316 339 277 350 250 L361 261 C355 300 381 331 394 359 C410 392 417 414 443 437 C453 449 469 458 482 467 L462 476 C425 461 400 451 379 459 Z',
'M430 466 C561 542 736 564 870 500 C929 470 979 395 1030 337 L1030 359 C973 433 944 482 880 518 C751 593 562 564 430 486 Z'
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
 const visibleBottom=h/scale,sky=g.createLinearGradient(0,0,0,672);sky.addColorStop(0,'#eed9ad');sky.addColorStop(.45,'#f5e6c8');sky.addColorStop(.72,'#e6ddc5');sky.addColorStop(1,'#b3b5a4');g.fillStyle=sky;g.fillRect(-100,0,1200,Math.max(780,visibleBottom));
 // Quiet irregular cloud masses, behind the crest; no outlines or added paper noise.
 shape('M555 101 C570 77 588 88 605 85 C624 84 629 66 644 65 C663 61 672 77 690 75 C709 69 724 45 742 54 C754 59 754 76 772 82 C791 88 806 91 807 105 C807 118 783 120 769 122 C740 127 723 142 694 142 C667 141 651 128 629 131 C598 136 581 127 564 127 C549 125 546 113 555 101 Z','#f9f0db');
 shape('M65 126 C82 116 96 121 110 115 C125 108 131 98 147 100 C165 103 172 116 189 117 C204 119 216 123 216 131 C213 142 191 143 177 142 C152 141 143 150 126 149 C107 149 97 141 80 144 C64 146 56 136 65 126 Z','#f6eed8');
 shape('M680 456 C778 454 869 425 936 377 C965 356 989 331 1030 302 L1030 559 L660 559 Z','#8d9994');
 shape(body,p.ink,p.ink,1.2);
 g.save();g.clip(path(body));for(const d of broadRibbons)shape(d,p.blue);
 // A few long unequal flow contours; their spacing opens down the face.
 line('M-20 391 C110 345 140 292 175 226',p.wash,1.5);
 line('M57 441 C175 376 174 299 215 222',p.wash,1);
 line('M162 462 C220 410 235 360 229 309 C223 264 241 233 255 213',p.wash,1.1);
 line('M273 466 C305 418 292 368 285 329 C278 282 287 246 297 222',p.wash,1.1);
 line('M363 465 C383 427 369 383 351 343 C337 311 333 276 342 244',p.wash,1.1);
 g.restore();shape(upstream,p.foam,p.ink,1.1);
 // Authored pale wash joins the cap root without concealing it with texture.
 shape('M-30 305 C56 291 117 242 157 200 C167 189 176 178 185 170 L185 199 C151 222 135 253 111 272 C69 307 23 324 -30 332 Z',p.wash);
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
 window.registeredStill={ready:true,iteration:'W019',scope:'Complete fixed colored still experiment; registered crest with authored water continuation and clouds. No boats or Fuji. No production migration or procedural claim.',provenance:{reference:domain.reference,crestColors:'research/woodblock/crest-contours.json',crestDomain:'research/woodblock/annotation/crest/annotation.json',domainIteration:domain.iteration,colorKind:colors.kind,originalScanDrawn:false},uncertainty:[...domain.uncertainty,'Artificial left/lower crest cuts remain provenance boundaries; adjoining authored water is interpreted and requires visual seam review.','Principal-water mask is unused and unverified; original registered color layers retain source appearance.','Foreground and right swell are authored interpretations, not source reconstructions.'],viewport:{width:w,height:h,dpr,scale,offsetX,offsetY:0,visibleSource:[-offsetX/scale,0,w/scale,h/scale],fit:'uniform cover, top aligned'},stats:{registeredLayers:colors.layers.length,registeredDomainVertices:domain.foam.vertices.length,explicitSkyCuts:domain.skyExclusions.length,clouds:2,authoredBands:broadRibbons.length+foregroundBands.length+paleRibbons.length},render};
}
addEventListener('resize',render);render();
