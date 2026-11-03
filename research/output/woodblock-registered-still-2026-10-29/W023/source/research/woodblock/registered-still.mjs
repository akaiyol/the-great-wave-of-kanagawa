// W020: fixed registered crest integrated into an authored complete still.
// This is source-derived appearance plus interpreted body continuation, not procedural geometry.
const canvas=document.querySelector('canvas'),g=canvas.getContext('2d');
window.registeredStill={ready:false,iteration:'W023'};
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
// W023 whole-water replacement. Source-aligned anatomical anchors (1000×672):
// crest roots 225,203 / 399,291; lower left bank ~125,300; forward peak 345,382;
// right rising shoulder ~940,390. All non-crest paths are authored interpretations.
// Dark channels are ink/water markings, never holes cut into the water surface.
const body='M-30 255 C55 268 156 247 225 203 L250 205 L275 210 L300 220 L325 230 L350 250 L375 275 L399 291 C387 329 387 370 407 404 C423 431 450 451 482 467 C581 519 742 531 848 482 C915 451 951 345 1030 253 L1030 780 L-30 780 Z';
const upstream='M-30 228 C28 251 69 247 111 208 C143 176 163 151 185 136 L185 200 L225 203 C222 216 219 229 212 241 C194 268 164 284 132 292 C75 308 20 312 -30 324 Z';
// Different channel scales follow individual folds, converge under the curl, and
// disappear behind the next surface. No stack of parallel full-width ribbons.
const channels=[
'M241 204 L247 205 C235 245 242 266 220 308 C204 340 179 363 146 385 C188 347 202 323 210 299 C226 257 230 229 241 204 Z',
'M267 208 L270 209 C263 251 268 277 265 307 C261 343 240 375 217 392 C246 353 249 328 249 307 C247 271 254 237 267 208 Z',
'M289 216 L295 218 C283 260 292 291 299 318 C311 368 307 406 321 425 C291 408 290 366 281 326 C272 286 276 251 289 216 Z',
'M323 229 L329 233 C315 265 317 296 331 334 C345 369 356 403 366 425 C340 402 335 374 319 342 C304 302 307 262 323 229 Z',
'M350 250 L354 254 C344 280 350 306 366 332 C389 370 391 403 413 430 C433 452 451 464 480 476 C430 463 401 439 384 404 C373 380 372 367 352 340 C332 306 334 277 350 250 Z',
'M380 278 L398 291 C385 326 387 362 405 393 C427 432 446 451 482 467 C532 494 600 509 654 514 C568 520 493 499 455 473 C424 453 401 428 388 401 C367 365 363 321 380 278 Z',
'M-20 368 C63 361 90 333 111 321 C129 310 146 315 155 327 C134 329 139 346 114 360 C79 379 27 390 -20 388 Z',
'M-20 414 C84 400 115 380 137 363 C161 347 179 352 187 366 C157 363 163 386 135 396 C77 423 18 428 -20 436 Z',
'M167 386 C204 392 210 425 250 440 C265 445 278 443 291 440 C271 459 249 464 229 455 C195 439 201 414 167 386 Z',
'M-20 469 C58 461 110 450 154 430 C172 420 186 424 194 433 C162 434 162 449 129 461 C74 481 22 485 -20 489 Z',
'M404 437 C453 477 511 500 564 510 C623 520 680 522 733 516 C683 537 612 537 558 525 C498 512 438 485 404 437 Z',
'M685 515 C799 513 873 468 916 422 C944 392 969 358 1001 334 C984 365 963 398 935 431 C876 501 789 534 685 535 Z',
'M768 547 C868 523 935 485 1030 406 L1030 432 C953 496 870 542 768 555 Z',
'M456 533 C497 566 567 584 620 588 C570 602 513 584 481 564 Z',
'M-30 609 C101 585 197 571 251 548 C218 578 170 594 115 604 C58 616 17 620 -30 632 Z',
'M542 639 C625 647 700 634 752 613 C807 592 851 566 885 551 C845 588 813 607 763 629 C689 661 616 666 542 655 Z',
'M786 662 C883 639 960 598 1030 558 L1030 577 C959 625 886 655 786 675 Z'
];
// Each foam mass owns an actual ridge. Unequal fingers are separate flowing
// channels through the ivory surface rather than a tiled hook decoration.
const ridges=[
// Mid-left bank folds across the large wave's foot; its roots overlap main body.
'M-30 335 C1 328 9 311 27 310 C37 307 36 294 47 291 C62 286 69 297 78 291 C89 285 91 271 107 269 C120 269 119 281 128 282 C139 284 147 273 157 280 C168 290 165 304 180 306 C193 306 196 298 207 304 C222 313 218 325 231 333 C245 341 249 329 258 342 C264 352 253 360 263 373 C273 386 287 385 294 400 C267 418 247 424 227 413 C206 403 195 391 176 388 C157 386 136 406 109 411 C62 425 12 421 -30 438 Z',
// Unequal central ridge with a broad pale shoulder, compressed against curl foot.
'M-30 493 C72 487 139 482 197 455 C236 437 265 410 288 391 C301 380 312 370 327 370 C340 370 345 383 354 395 C367 414 390 437 413 451 C443 471 467 479 494 487 C430 482 391 465 369 447 C354 435 344 417 334 414 C326 412 320 423 311 434 C284 466 251 486 217 503 C139 538 49 547 -30 548 Z',
// Lower-left breaker: clustered, broad backing, disappearing out of the frame.
'M-30 600 C-7 582 7 569 30 567 C38 560 32 549 43 542 C57 533 71 545 81 537 C90 529 87 519 103 516 C119 512 124 528 136 524 C149 518 149 500 165 499 C180 498 182 514 195 512 C212 507 218 493 233 498 C250 505 245 524 258 533 C270 538 278 526 290 536 C302 547 297 566 312 576 C330 591 350 589 366 611 L407 688 L-30 710 Z',
// Right bank rises into the scene; exposed ivory and blue rootlets carry its depth.
'M671 511 C760 509 822 488 863 457 C880 443 883 424 899 417 C907 413 914 421 919 411 C924 402 918 394 928 384 C937 377 942 386 950 379 C958 370 951 359 962 351 C970 345 974 356 981 346 C990 335 985 326 997 317 C1010 309 1012 297 1030 286 L1030 361 C1005 392 987 423 963 451 C897 525 783 554 671 533 Z',
// Diagonal foreground shoulder with branching cavities rather than a stripe edge.
'M305 434 C330 436 336 463 355 481 C390 512 440 535 491 551 C572 577 658 585 745 571 C855 552 942 507 1030 456 L1030 476 C943 534 862 573 756 598 C658 623 561 613 477 587 C424 571 373 543 347 513 C333 498 324 477 313 470 C308 461 305 450 305 434 Z',
'M371 627 C439 612 492 644 558 660 C664 686 779 669 874 632 C934 610 982 585 1030 559 L1030 584 C971 620 932 639 885 659 C787 700 665 720 553 690 C477 670 429 641 371 649 Z'
];
const cavities=[
'M-15 352 C19 346 25 327 42 324 C52 322 58 330 54 341 C51 349 59 356 69 349 C78 344 75 326 88 319 C102 309 112 320 107 330 C102 342 110 348 123 340 C135 331 130 309 146 310 C159 312 150 327 157 338 C168 349 178 329 189 340 C199 351 189 362 202 370 C217 380 225 369 234 382 L250 412 C229 408 216 393 199 388 C184 382 177 375 167 366 C155 356 146 362 135 371 C116 391 92 400 70 401 C44 405 13 402 -15 409 Z',
'M16 389 C47 387 67 377 79 363 C87 356 92 360 91 368 C88 381 105 377 112 363 C119 349 130 352 130 361 C127 378 106 394 81 402 C57 409 33 409 16 406 Z',
'M209 400 C224 402 236 395 237 383 C241 372 250 379 250 387 C251 400 269 403 278 399 L289 412 C265 423 250 427 236 421 Z',
'M215 480 C252 458 277 431 292 411 C304 394 315 391 321 399 C326 409 316 414 315 425 C304 417 301 431 291 440 C266 464 241 479 215 490 Z',
'M330 384 C341 390 343 407 354 420 C370 442 391 454 409 462 C386 463 369 448 358 435 C350 425 341 419 335 421 C343 406 329 402 330 384 Z',
'M-20 626 C0 607 12 599 20 583 C28 571 37 578 34 591 C31 601 45 598 50 588 C58 571 64 568 72 574 C81 580 67 591 77 599 C88 603 90 585 98 580 C109 574 119 579 114 589 C109 601 119 609 129 600 C140 590 137 562 151 558 C166 555 164 571 163 578 C161 590 173 598 181 587 C190 575 181 547 196 547 C208 548 201 565 207 574 C214 583 225 570 233 581 C239 590 235 602 248 614 C257 623 267 613 277 624 C285 636 281 656 302 673 L-20 716 Z',
'M186 533 C193 522 205 521 208 529 C213 539 204 547 207 557 C192 555 186 545 186 533 Z',
'M256 546 C270 546 269 562 276 569 C283 578 292 569 296 579 L310 606 C286 597 278 588 273 579 C269 569 260 561 256 546 Z',
'M741 529 C822 512 875 486 901 454 C913 442 916 432 925 434 C934 436 926 445 929 453 C941 454 938 433 949 425 C958 419 966 423 961 434 C956 443 966 444 973 435 C988 413 994 397 1011 386 L1030 376 L1030 413 C946 487 863 534 741 540 Z',
'M918 414 C920 401 932 395 938 399 C946 406 935 410 937 417 C929 421 923 419 918 414 Z',
'M950 381 C953 370 964 366 968 371 C973 378 964 383 966 391 C958 393 952 389 950 381 Z',
'M976 351 C979 340 986 336 992 339 C999 345 989 353 991 361 C983 361 979 358 976 351 Z',
'M351 474 C376 500 418 522 449 532 C436 533 420 529 407 524 C383 516 365 500 351 488 Z',
'M398 527 C433 546 468 555 496 562 C481 565 463 561 447 558 C428 554 412 543 398 539 Z',
'M474 574 C507 581 536 590 573 592 C557 602 526 594 509 591 Z',
'M609 595 C678 599 721 585 768 573 C744 589 718 603 687 607 C659 611 632 607 609 606 Z',
'M804 561 C851 544 897 524 930 506 C902 533 859 553 818 569 Z'
];
const inkContours=[
'M23 339 C34 330 44 331 43 340 M77 307 C87 300 98 302 97 312 M118 294 C128 291 133 295 132 303 M157 296 C161 301 154 308 160 315 M184 318 C195 315 205 324 200 333',
'M19 372 C36 373 40 360 37 353 M63 384 C79 383 81 371 78 365 M112 392 C129 390 139 382 144 375 M169 351 C178 347 185 355 181 362 M215 351 C222 352 226 357 223 364',
'M269 402 C283 395 290 382 300 382 C308 382 309 389 305 392 M311 378 C317 374 324 376 325 382 M330 403 C339 414 343 431 358 442',
'M-12 566 C9 551 25 551 27 560 M39 539 C46 532 57 534 59 541 M91 521 C102 512 113 518 112 526 M139 518 C147 526 142 539 151 542 M173 519 C181 526 178 536 184 539 M220 518 C231 518 237 529 232 538',
'M38 612 C48 611 54 606 54 598 M79 625 C89 622 93 612 89 607 M121 629 C135 630 142 618 140 609 M173 614 C182 615 189 606 186 598 M223 626 C229 638 241 642 253 644',
'M881 444 C889 436 895 438 895 445 M904 426 C912 418 918 422 917 428 M932 391 C940 387 946 389 945 395 M961 359 C967 355 974 359 973 364 M991 326 C999 322 1005 326 1003 332',
'M368 487 C401 515 438 530 464 537 M515 569 C551 578 579 581 608 580 M777 578 C835 561 868 547 900 528',
'M-25 476 C39 473 85 465 113 454 M-20 650 C39 637 79 637 108 641 M332 648 C354 631 372 625 397 628 M779 685 C861 668 924 643 971 620'
];
function render(){
 const w=innerWidth,h=innerHeight,dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
 const scale=Math.max(w/1000,h/672),offsetX=(w-1000*scale)/2;
 g.setTransform(dpr*scale,0,0,dpr*scale,dpr*offsetX,0);g.lineCap='round';g.lineJoin='round';
 const visibleBottom=h/scale,sky=g.createLinearGradient(0,0,0,672);sky.addColorStop(0,'#eed9ad');sky.addColorStop(.35,'#f6eed8');sky.addColorStop(.70,'#f6eed8');sky.addColorStop(.90,'#d9d7c5');sky.addColorStop(1,'#b3b5a4');g.fillStyle=sky;g.fillRect(-100,0,1200,Math.max(780,visibleBottom));
 shape('M555 101 C570 77 588 88 605 85 C624 84 629 66 644 65 C663 61 672 77 690 75 C709 69 724 45 742 54 C754 59 754 76 772 82 C791 88 806 91 807 105 C807 118 783 120 769 122 C740 127 723 142 694 142 C667 141 651 128 629 131 C598 136 581 127 564 127 C549 125 546 113 555 101 Z','#f9f0db');
 shape('M65 126 C82 116 96 121 110 115 C125 108 131 98 147 100 C165 103 172 116 189 117 C204 119 216 123 216 131 C213 142 191 143 177 142 C152 141 143 150 126 149 C107 149 97 141 80 144 C64 146 56 136 65 126 Z',p.foam);
 // Distant trough remains sky-depth wash, with a broken water horizon underneath.
 shape('M-30 514 C190 499 371 507 542 501 C728 495 849 461 938 389 C975 359 1003 330 1030 302 L1030 780 L-30 780 Z','#8d9994');
 shape(body,p.ink,p.ink,1.15);
 g.save();g.clip(path(body));for(const d of channels)shape(d,p.blue);g.restore();
 shape(upstream,p.foam);line('M-30 228 C28 251 69 247 111 208 C143 176 163 151 185 136',p.ink,1.1);
 shape('M185 200 L225 203 C222 218 217 231 207 244 C179 277 141 294 92 306 C47 317 7 321 -30 327 L-30 340 C25 334 73 328 116 316 C163 303 195 286 217 257 C232 237 233 220 225 203 Z',p.foam);
 // The same opaque ivory/indigo grammar is used for every bank. Wash belongs
 // inside the broad backs, while channels retain visibly distinct widths.
 for(const d of ridges)shape(d,p.foam,p.ink,.85);
 for(const d of cavities)shape(d,p.ink);
 // Pale blue underprinting follows the ridge roots, not unrelated free ornament.
 const washes=[
 'M-20 339 C21 330 25 309 46 300 C62 294 72 303 83 296 C99 286 98 279 109 278 C119 278 118 290 130 290 C141 290 149 281 155 287 C164 295 160 311 177 316 C193 320 198 310 204 315 C213 323 210 333 221 340 C202 337 192 332 179 329 C161 325 149 308 136 307 C118 307 105 320 91 321 C74 322 66 313 56 321 C30 341 12 350 -20 353 Z',
 'M181 498 C235 471 271 431 291 409 C307 392 317 383 326 380 C336 383 338 393 344 403 C328 396 324 408 314 418 C278 454 245 486 207 504 Z',
 'M-20 599 C15 574 18 563 36 562 C50 558 50 549 60 550 C76 554 83 548 95 539 C109 527 119 543 137 533 C153 522 150 510 166 511 C177 514 176 531 190 532 C205 532 220 515 232 516 C241 520 237 533 252 544 C234 544 225 536 210 542 C189 554 175 545 164 540 C153 537 148 550 135 553 C120 556 114 547 104 554 C85 575 69 571 55 577 C34 584 29 600 13 605 Z',
 'M802 511 C850 493 887 464 907 438 C915 432 918 439 917 447 C899 480 854 508 817 520 Z',
 'M389 519 C444 549 493 562 536 569 C502 570 461 560 434 549 Z'
 ];for(const d of washes)shape(d,p.wash);
 for(const d of inkContours)line(d,p.blue,1.15);
 // A few long unequal contour returns link the field's larger folds.
 line('M227 263 C219 294 208 314 190 332 M250 300 C246 325 236 346 224 359 M295 339 C302 368 302 386 310 399 M367 352 C378 387 393 414 418 435',p.wash,.85);
 // Detached flecks only track actual breaking faces; deterministic, no grain.
 let flecks=0;
 for(const [x,y,dx,dy,n] of [[51,348,37,48,27],[130,349,43,37,24],[226,365,25,38,16],[31,603,62,56,30],[140,600,70,63,34],[267,612,29,49,16],[921,457,54,-39,19]]){
  for(let i=0;i<n;i++){
   const a=((i*73+19)%101)/101,b=((i*47+31)%97)/97,fx=x+dx*a,fy=y+dy*b;
   // Keep flecks in the dark root channel, so no arbitrary sky sprinkling.
   const r=.8+(i%4)*.38;shape(`M${fx-r} ${fy} l${r} ${-r*1.4} l${r*1.2} ${r*.8} l${-r*.3} ${r*1.5} Z`,p.foam);flecks++;
  }
 }
 // Fixed source-derived crest drawn last: original raster is never a candidate layer.
 g.drawImage(crestSurface,185,0,425,310);
 window.registeredStill={ready:true,iteration:'W023',scope:'Complete fixed colored still; registered crest plus source-informed overlapping water banks, unequal channels and pale clouds. No boats or Fuji. No production or procedural claim.',provenance:{reference:domain.reference,crestColors:'research/woodblock/crest-contours.json',crestDomain:'research/woodblock/annotation/crest/annotation.json',domainIteration:domain.iteration,colorKind:colors.kind,originalScanDrawn:false,authoredWater:'Source-informed connected ridge and channel paths in canonical 1000×672 frame; no additional source pixels or extraction.'},uncertainty:[...domain.uncertainty,'Principal-water mask remains unused and unverified.','Non-crest water is interpreted vector geometry; registration, dense crest transition and anatomical coherence require desktop visual review.','Cover fit can crop lower banks in wide view; no narrow-view artistic claim.'],viewport:{width:w,height:h,dpr,scale,offsetX,offsetY:0,visibleSource:[-offsetX/scale,0,w/scale,h/scale],fit:'uniform cover, top aligned'},stats:{registeredLayers:colors.layers.length,registeredDomainVertices:domain.foam.vertices.length,explicitSkyCuts:domain.skyExclusions.length,clouds:2,waterRegions:ridges.length,flowChannels:channels.length,cavities:cavities.length,inkGroups:inkContours.length,foamFlecks:flecks,authoredBands:channels.length},render};
}
addEventListener('resize',render);render();
