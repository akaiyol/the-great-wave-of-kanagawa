# P128 — Junction-facing paired-contour primitive

Initial independent review deferred unconditioned affine resizing as low-value. Revised rule: preserve the retained model’s hood-mouth direction relative to its actual lower fork J. This angular offset is a P098 model constant, NOT a museum measurement or physical law. Local dependency/appearance diagnostic only; no scene integration. P127 virtual quad remains rejected and unused.

Reference=generateInkParent(hash(721,106)). P fixed[60,60]. Cases reference(sx1,sy1,dJ[0,0]); A(.85,1.1,dJ[0,18]); B(1.15,.9,dJ[26,-14]). Generate V=P-upper end and W=A-inner end by P+diag(sx,sy)*(oldVertex-P). J-left end gets same shouldertransform plusdJ. All endpointfeatures A-J-cove throughC-inner getdJ; other endpoints unchanged. For each cubic start/c1 followstartdelta,c2/end followenddelta. P/A fixed; J/B/C movebydJ.

Iθ=P+diag(sx,sy)*(I0-P). E0=normalize(M0-I0), M0=midpointofhoodcenterlineendpoints. δ=arg(E0)-arg(J0-I0). Eθ=rotate(normalize(Jθ-Iθ),δ), N=perp(E). For every hood/counter/accent point p: Iθ+sx*Nθ*dot(p-I0,N0)+sy*Eθ*dot(p-I0,E0). This keeps the pair’s mouth offset relative to actual moving J, preserves a positive affine pair map, and changes shoulder anatomy jointly. Still one motif family; stretching/eye appearance remains contrary evidence.

Support paths: P→A unchanged; P→J vertex k gets dJ*k/(n-1); J→B/C allpoints getdJ. Check actual simpleclosedparent, complete radius3 supports, fullmark-boundarycontainment, positivepairdeterminant, angularinvariant, deterministicreference and frame-onlycontrol. Stopanyfailedcase withouttarget/width/cornerrescue. If allpass, exactly3 localparents with matched uniform outlines and rootpose, no wavecomposition. Similarityresidual only distinguishes deformation, not artquality. Independentreview compares anatomy/counterarticulation with canonical roles.

Totaltestcap10000estimatedwork includes bothpreflights1100, workerstartup/implementation~4000, leadchecks/capture~2000, independentreview~2500 plusremainingheadroom. Plannedphase14000 incl700processreserve, noautomaticexpansion.
