# Woodblock action log

Purpose: record meaningful assignments, observed results and improvements. Keep one entry per iteration; update the outcome when review returns. Do not log every tool call. Historical Braille actions are archived in archive/braille-2026-10-28/agent-iteration-log.md.

## Entry contract

- ID/date and milestone.
- Failure signature/method family, hypothesis, predicted gain and rejection criterion.
- Assignment: agent, owned files, first executable artifact/handoff and stopping condition.
- Result: checks actually run, observed failure/gain and evidence links.
- Review: technical result, visual verdict and inspected scope separately.
- Decision: retain/reject, one improvement with owner/status, next action.
- Usage: measured timing/tokens only if available; otherwise unknown.

At each milestone inspect unresolved improvements. Fix an issue only when evidence supports it and it affects the next decision. After two attempts repeat a failure without gain, revisit the hypothesis. No separate improvement dashboard or duplicate backlog.

## W001 — 2026-10-28 — Agent workflow smoke test

- Milestone: workflow operation; not artistic acceptance of the first still.
- Problem: rewritten role files have not been exercised; the old log mixes obsolete Braille experiments with current work.
- Hypothesis/predicted gain: a bounded worker → lead checks → independent reviewer → checkpoint cycle can produce and assess a small woodblock study without sampled-dot criteria.
- Reject if: role instructions are ignored, reference changes, edits escape ownership, evidence is missing, or technical success is reported as artistic acceptance.
- Assignment: wave_worker owns research/output/woodblock-smoke-2026-10-28/ only; produce one simple colored SVG still with water, foam, sky and clouds plus a compact handoff. Stop after one candidate. Lead owns active log/checkpoint; evaluator is read-only.
- Result: worker produced study.svg and handoff.md within ownership; lead verified XML, no external references, canonical pin, unchanged production/tests, and raster output at 1280 × 720 / 1920 × 1080. Chromium 151 loaded the SVG without page errors at 1280 × 720 DPR1 and 1920 × 1080 DPR2. Initial restricted browser launch failed; approved local retry succeeded.
- Role adoption: worker and evaluator explicitly read current disk role files and reported no conflict. Researcher not exercised.
- Independent review: complete colored layers/clouds present; visual milestone fails because smooth cap and regular scallops lack connected unequal foam branching. Review used Sharp captures; browser checks were later lead evidence.
- Decision: retain as workflow evidence only; do not promote artwork. Worker → checks → reviewer → checkpoint cycle passed within this bounded scope.
- Improvement I001: lead to assign worker a source-led joint outer-boundary/branch/hollow revision; Attempted in W003/W004; unresolved form work superseded by I006. No texture or generator expansion yet.
- Improvement I002: require explicit disk-role read on delegation; DONE in lead workflow, exercised by both agents.
- Evidence: [receipt](output/woodblock-smoke-2026-10-28/receipt.json), [review](output/woodblock-smoke-2026-10-28/review.md), [study](output/woodblock-smoke-2026-10-28/study.svg).
- Unverified: researcher behavior, Canvas implementation, responsive app integration, controls, generation, seams and travel.
- Usage: unknown.

## W002 — 2026-10-28 — Recognition criterion clarified

- User requirement: viewers should immediately recognize the Great Wave reference from the aesthetic appearance.
- Decision: make whole-image reference recognition without explanatory copy a primary artistic gate in project instructions, plan, review protocol and checkpoint. Generic woodblock styling does not pass.
- Evidence: requirement update only; W001 was not reviewed under this explicit gate. No measured user recognition claim.
- Next action: apply recognition-first review to the next still, then compare anatomy and palette directly with the canonical scan. Lead owns enforcement; exercised by W004 review, ONGOING at milestones.

## W003 — 2026-10-28 — Reference-led Canvas still

- Milestone: recognizable complete still at desktop display scale.
- Failure: W001 broad smooth cap and regular scallops read as generic graphic waves.
- Hypothesis: jointly author the asymmetric parent boundary, unequal branch networks and dark water hollows, with source-like proportions and supporting breakers, to establish immediate reference recognition.
- Prediction: branching claw-like crest and open cavity read together as The Great Wave without a title; colored water and clouds remain coherent.
- Reject if: regular hook/scallop repetition remains dominant, cap stays generic, source reference must be displayed to establish recognition, or technical output fails.
- Assignment: wave_worker owns research/woodblock-still.html and research/woodblock/ only; one complete Canvas2D candidate, then lead triage. Lead owns evidence/log/checkpoint. No production modification.
- Outcome: completed, rejected as visual baseline; see W003/W004 independent return and candidate-1 evidence.
- Usage: unknown.

## W004 — 2026-10-28 — Unequal crest openings

- Failure: W003 cove heads repeat rounded clusters; detached foreground marks and pointed water-band joins weaken source resemblance.
- Hypothesis/prediction: unequal dominant cove turns, larger attached edge groups and removal of detached ornaments improve foam hierarchy while preserving reference proportions.
- Assignment: same worker/files; exactly one follow-up revision, no texture or generator work.
- Result: browser loaded without errors at 1280 × 720 DPR1, 1920 × 1080 DPR2 and 960 × 720 DPR1; resize exercised. Parent silhouette retained, detached foreground curls removed. Source/reference hashes saved in candidate-2/receipt.json.
- Lead triage: source-specific overall silhouette is clearer than W001; enlarged edge groups still read as repeated outlined curls rather than the source network. Independent return below rejects form while supporting informed recognition.
- Decision: no promotion; preserve candidate-1 and candidate-2 evidence. If independent review confirms persistent branching failure, change representation rather than another nearby curve edit.
- Usage: unknown.

### W003/W004 independent return

- Recognition: supported by informed reviewer; no blind user test. Still milestone rejected: blank parent cap plus curled ornaments persists, water stripes remain schematic.
- Decision: do not promote either candidate. Two shape edits repeated the failure; reset only with materially different source-contour representation.
- Improvement I003: receipt had stale self-hash and W003 label on W004 evidence. Lead corrected labels and excluded receipt from its own hashes; source/capture hashes unchanged. DONE; rechecked below.
- Review evidence: output/woodblock-still-2026-10-28/candidate-2/review.md.

## W005 — 2026-10-28 — Source-derived full crest control

- Failure: invented hook paths preserve generic parent/ornament vocabulary.
- Hypothesis: source-color contours inside an authored semantic boundary preserve jointly aligned foam branches, water openings and ink that invented local curves lose.
- Prediction: complete group visibly follows source at intended display scale without raster scan hidden as candidate.
- Reject if: paper leaks into foam, source branches merge/disappear, boundaries require invented joins, or a small crop is mislabeled as complete crest. Root cuts must be declared.
- Assignment: same worker owns research/woodblock/crest-control.html and its assets/script only; hold scene unchanged. One fixed positive control, not procedural generation.
- Research: read-only researcher supports bounded source-color contour method; old interior/interface fragments do not certify whole crest.
- Outcome: criterion not met; source grids only, no semantic artifact. See W005 bounded outcome. Usage unknown.

### Additional desktop finding

- I004 — OPEN, lead/integration: at 960 × 720 the still uses contain-fit, leaving a paper-colored strip below the ocean. Browser resize is mechanically correct, but full-viewport artwork composition is not resolved. Fix by extending scene bounds or selecting an explicit focal crop after crest form is established; do not stretch geometry. Evidence: candidate-2/view-960.png.

### W005 bounded outcome — 2026-10-29

- Worker produced three source/grid crops only; no semantic mask or contour control. Stopped before extending untested boundary reasoning. W005 semantic-control criterion NOT met.
- Blocker: exterior pale gaps among fingers versus connected pale foam; untested ink-barrier closure can leak. No segmentation success claimed.
- I005 — previous DONE label was premature: require a first executable diagnostic before further tracing or threshold exploration. Lead took source ownership after worker stopped; rule formalized in W009, behavioral trial exercised in W010/W011; see W009 follow-through.

## W006 — 2026-10-29 — Fixed color reconstruction diagnostic

- Distinct question: can a small palette of source-derived vector paths preserve the reference branching that invented curves lost, without asserting semantic segmentation? This does not replace or pass W005.
- Hypothesis/prediction: fixed source-color layers retain source-specific interlocking foam/water contours; scan-hidden vector candidate visibly matches source.
- Assignment: lead, one deterministic color reconstruction of source ROI [185,50,610,310] in normalized 1000 × 672 coordinates, with explicit left/bottom root cuts and paper retained as a color layer.
- Implementation: canonical pin checked; 2× source sampling, one median filter, 12-color quantization, 110384 horizontal vector runs. Candidate renders cached vector paths; original scan drawn only in explicit source/overlay modes. No semantic mask claimed.
- Checks: module syntax; browser vector/source/overlay buttons at 1280 × 720 DPR1 and 1920 × 1080 DPR2, no page/console errors. Initial script syntax error corrected before successful run.
- Lead triage: contour hierarchy visibly follows reference much more faithfully. Fixed diagnostic only; no procedural or still-milestone promotion. Independent return below passes the fixed visual control only.
- Evidence: output/woodblock-crest-control-2026-10-28/receipt.json. Directory date reflects session start; diagnostic completed 2026-10-29.
- Usage: unknown.

### W006 independent return

- Fixed visual control PASS only: reference branching preserved; all supplied source/capture/reference hashes verified. Not an editable semantic crest, procedural wave or full still pass.
- Evidence: output/woodblock-crest-control-2026-10-28/review.md.

## W007 — 2026-10-29 — One fixed color-separation diagnostic

- Hypothesis: retain five pale/blue/dark color groups while excluding three paper-colored clusters to obtain an initial transparent source crest.
- Lead implemented and captured once at 1280 × 720; browser had no errors.
- REJECT: pale sky/cloud areas remain as ivory outside foam; color class is not semantic identity. No threshold search or scene integration.
- Evidence/source snapshot: output/woodblock-crest-separation-2026-10-29/. Rejected code removed from active study folder.

## W008 — 2026-10-29 — One ink-barrier boundary diagnostic

- Hypothesis: one 3px source-ink closure and exterior flood from manually selected boundary segments protect real foam while removing exterior paper. Artificial left/bottom root cuts explicit.
- Lead implemented and captured once at1280 ×720, no browser errors.
- REJECT: exterior flood crosses printed ink gaps and removes most real pale foam. Exterior fraction0.7518 is diagnostic, not an artistic score. No closure-size search or invented bridge corrections.
- Evidence/source snapshot: output/woodblock-crest-boundary-2026-10-29/. Rejected code removed from active study folder.
- Decision: stop color/ink inference as semantic authority. Next requires explicit source-aligned outer foam and sky-gap annotation using W006 as visual control. No promotion of W004 or extraction diagnostics.
- I006 — OPEN, geometry implementation: annotate complete connected outer boundary and sky gaps, then validate source overlay and scan-hidden result.
- Usage unknown.

## W009 — 2026-10-29 — Log audit and flow correction

| Negative pattern | Evidence | Correction / next observable check |
|---|---|---|
| Symptom edits preserve weak representation | W001→W003→W004 smooth parent plus ornaments | Count failure signatures across IDs; stop invented hook variants. Next source-aligned polygon must visibly follow a real group. |
| Analysis without executable output | W005 produced only three source crops | First handoff is one executable annotated slice and capture, or an explicit missing decision. No larger editor or research substitute. |
| Re-entry into known weak extraction methods | W007 paper leakage; W008 foam loss; earlier research warned of these | No automatic color/ink semantics retry without a new boundary premise. Current continuation uses explicit source-coordinate annotation. |
| Evidence bookkeeping drifts | W003/W005 pending after closeout; W004 mislabeled receipt/self-hash | Original entries reconciled; after every verdict update entry/checkpoint together and validate iteration/hash identity. |
| Diagnostic success consumes scope without integrating accepted form | W006 good fixed reconstruction, no editable geometry | Label control-only; next result must address boundary semantics, not generate another reconstruction. |

- Changes: lead workflow replaced with an artifact-first decision path covering first artifact, failed-method re-entry, capture triage and reconciled closeout. Existing three roles/models retained; role responsibilities revised. No new dashboard or roles.
- Efficiency evidence: qualitative patterns only; no reliable per-agent timings/tokens exist, so no speed/cost improvement claimed. Changes require a live trial.
- Record correction: researcher was exercised in source-representation task, despite stale checkpoint wording.
- Next trial W010: one explicit source-coordinate boundary group with source overlay and scan-hidden mask; partial scope must remain labeled.

## W010 — 2026-10-29 — Explicit annotated branch slice

- Failure signature/method family: source semantics unresolved; automatic appearance-based masks rejected in W007/W008.
- Hypothesis: explicit vertices along a real source branch, with exterior sky gaps and root cut declared, establish a usable local boundary without inference from color/ink closure.
- Predicted gain: scan-hidden filled group follows source fingers and excludes its exterior sky; overlay exposes errors.
- Reject if: invented hooks replace traced boundaries, sky gaps are filled, root cuts are hidden, or no executable slice is produced.
- Assignment: fresh wave_worker, research/woodblock/annotation/ only; one group in right fringe, first executable annotation.json + minimal comparison page, then STOP. No whole-crest claim or automatic extraction.
- First artifact: annotation.json + renderer/page delivered before expansion; updated worker role read without conflict. First-artifact rule exercised once, not a measured efficiency trend.
- Result: 1280 ×720 DPR1 browser loaded without errors; JSON has22vertices (worker prose said24). Overlay shows outer edge/tip inside original printed finger by roughly2–3reference units. Geometry NOT accepted; no broad captures/reviewer call warranted yet.
- Decision: retain evidence at output/woodblock-annotation-2026-10-29/W010/; one source-point correction W011 before any expansion. I005 implemented/exercised in this bounded trial; no time/token savings claim.
- Usage unknown.

## W011 — 2026-10-29 — Overlay-directed boundary correction

- Failure signature/method: W010 explicit polygon undershoots real outer finger/tip.
- Hypothesis: correcting vertices against actual source overlay resolves measured alignment without automatic semantic inference or invented hooks.
- Assignment: same worker/directory, one revised polygon only; keep root cut and sky probe explicit, then stop for first capture. No scope expansion.
- Reject if: same offset persists, tip/sky notch remains mismatched, or uncertainty is disguised as fidelity.
- First artifact: source-corrected44-vertex polygon; browser1280×720 DPR1 has no errors. Finite vertices/no proper edge intersections and reference pin checked.
- Independent result: retain as provisional LOCAL slice; outer alignment/sky probe supported, terminal inward return still interpretation-dependent. No whole-network/still claim.
- Evidence: output/woodblock-annotation-2026-10-29/W011/review.md and receipt.json; reviewer verified all supplied source/capture/reference hashes.
- Decision: extend shared root + one adjacent finger in W012. Do not refine isolated hook further. Usage unknown.

## W012 — 2026-10-29 — Shared-root branching

- Failure/method: accepted provisional single-finger control does not establish connected unequal branching. Explicit source-coordinate annotation continues; no automatic extraction.
- Hypothesis: annotating a source-supported shared root and one adjacent finger produces a connected unequal group with genuine exterior gap, overcoming isolated-hook representation.
- Reject if: connection is invented, interior ink is mislabeled as sky, root cut hidden, or scope grows without first render.
- Assignment: same worker/annotation directory, one executable group first then stop; W011 evidence frozen.
- First-inspection result: worker returned exact source ambiguity before edits: nearby upper dark loop cannot be safely classified as exterior gap/shared finger. No files changed. This satisfies blocker-reporting rule, not the geometry criterion.
- Decision: do not invent connection; lead inspected wider source grid and selected a different visible lower terminal fork in W013. W012 group criterion remains unmet; no semantic pass. Usage unknown.

## W013 — 2026-10-29 — Clearer exterior terminal fork

- Failure/method: W012 selected neighbor has ambiguous ink/exterior semantics.
- Changed premise: choose a different visibly exterior lower fork rather than infer dark-loop identity; annotate outer foam silhouette only, leaving internal ink unmodeled.
- Assignment: same worker, annotation/group/ and minimal shared renderer; two terminal fingers/commonroot aroundx540–580,y273–295, exact source bounds to verify. One executable artifact first then stop. No new extraction/editor/tooling.
- Reject if: attachment invented, visible paper notch filled, or silhouette-only scope misrepresented as complete ink/water semantics.
- First artifact: executable40-vertex two-terminal fork. Browser1280×720 DPR1 no errors, but overlay REJECTED: polygon materiallyoffset fromsource, skyprobe touches printedtip.
- Technical finding: renderer kept40/45CSSaspectwhile drawing50×37context, stretching source/overlay. No promotion based on distortedcomparison.
- Decision: W014 fixes aspect and source-checks root/extreme-tipanchors before one vertex correction. Evidence frozen in output/woodblock-fork-2026-10-29/W013/. First-artifact behavior alone doesnot establish useful geometry or measured efficiency. Usageunknown.

## W014 — 2026-10-29 — Coordinate and aspect correction

- Failure/method: W013 hand-placed coarse fork has poor source correspondence; wider source crop is stretched by fixed CSSratio.
- Hypothesis: restoring exact source aspect and checking root/outertips against source anchors corrects annotation input error before further shape work.
- Assignment: sameworker/files, fix data-driven aspect and correct one polygon/probe, record sourceanchors, then stop. No expansion.
- Reject if: offsets persist, true commonroot unsupported, or probe labels derive from candidate instead of source.
- Result: corrected61-vertex silhouette with six sourceanchors; browser1280×720 DPR1 zeroerrors,38:33canvasaspect assertion passes.
- Independent review: provisional LOCALfork supported; source-backed attachment, unequal terminals and genuine exterior paper probe. Artificialcut/partlyuninkedreturns/internalinklimits remain. No wholecrest/still promotion.
- Evidence: output/woodblock-fork-2026-10-29/W014/receipt.json and review.md; reviewer verified archived source/capture/reference identities.
- Decision: retain localcontrol; extend upstream toward parent boundary rather than refine isolatedtips. Usageunknown.

### W009 audit follow-through — 2026-10-29

- Observed: W010 executable-first handoff; W012 exact ambiguity returned before edits; W013 renderer reuse and first-view stop; W014 source anchors/aspect correction followed by provisional local review. Revised worker/evaluator roles exercised without conflicts; revised researcher not re-exercised.
- New negative pattern: coarse first drafts W010/W013 had visible source offsets; W011/W014 anchor corrections improved alignment. First artifact alone is not useful geometry. Source-anchor checks now required before next firstdraft.
- I007 DONE: dynamic contextaspect fixes W013 distortion; browser ratio asserted.
- I008 IMPLEMENTED, futurefirstdraft effectiveness unproven: root/extreme-tip source anchors added to firstartifact floor.
- Stale pending records reconciled with checkpoint. Rejected candidate evidence retained, not promoted. No reliable time/token baseline; no measured speed/cost gain claimed. No new roles/dashboard/extractionretry.
- Next: source-annotate upstream parent attachment and exteriorgaps. Wholecrest/still remain unaccepted.

## W015 — 2026-10-29 — Parent attachment extension

- Failure/method: W014 has an explicit artificial rootcut; parent attachment is not yet geometry. Continue explicit source-coordinate annotation, not extraction or hook invention.
- Hypothesis: tracing upstream to a parent boundary preserves the reviewed unequal terminals while establishing a larger connected group and genuine exterior gap.
- Assignment: wave_worker owns annotation/parent/annotation.json and minimal shared-renderer changes only; verify source root/extreme anchors, use existing comparison page/aspect, first executable candidate then stop.
- Reject if: attachment invented, paper gap filled, rootcut hidden, or coverage does not grow beyond W014.
- First-inspection result: exact blocker returned with no edits. Immediate upstream region contains uninked pale parent interior; no source-backed local outerboundary. Geometrycriterion notmet, no inventedattachment.
- Lead decision: widen to maincrest context in W016 so actual exterior silhouette is in view. Existing artificialcut need not be a printed outeredge. Approximate uninked boundary segments must be explicitly interpreted, not promoted as unique semantictruth. Usageunknown.

## W016 — 2026-10-29 — Whole crest-group boundary context

- Failure/method: tiny parent-extension crop omits the real outerboundary; repeated local ambiguity prevents geometrygrowth.
- Changed premise: larger sourcecontext[185,50,425,260] exposes top silhouette/right fringe while allowing explicit left/bottom artificialrootcuts. Explicit annotation remains; no extractionretry.
- Hypothesis: fullcontext makes parent continuity/source-specific branching inspectable together and avoids mistaking uninked parentinterior for absentattachment.
- Assignment: sameworker/annotation/crest/annotation.json, reusedoverlayrenderer; source root/tipanchorsfirst, one wholecrestgroup preview thenstop. Mark genuineuninkedsegment interpretations explicitly.
- Reject if: loose envelope fills obvious exteriorgaps, inventedcross-skyconnections, unsupportedtips or partialcontrol mislabeled wholewave.
- Scope clarification: include manually authored principal-water exclusion so the whole-group mask does not become a blank filled cap; thin internal ink remains unmodeled. Minimal existing renderer support only.
- First artifact:286-vertex broad outline,175-vertex principalwaterexclusion, nine sourceanchors; browser1280×720 DPR1 noerrors and425:260aspect assertion passes.
- Lead triage REJECT: outerfringe closes large visible paperbays into an ivoryplate; lowerleft closure also covers sourcepaper. Thinink omission doesnot explain these exterior errors. No independentpromotionreview yet.
- Decision: one explicit exterior-gap/rootclosure correction W017; no extra interior detail or parametersearch. Evidence frozen output/woodblock-crest-mask-2026-10-29/W016/. Usageunknown.

## W017 — 2026-10-29 — Explicit exterior bays

- Failure/method: W016 larger outline fills actual paper between fringe fingers and belowcroppedparent.
- Hypothesis: explicit source-anchored exteriorbay cuts and better upstreamrootclosure remove falsefoam without changing validatedtips or principalwaterrepresentation.
- Assignment: sameworker/crestdata and minimal existingrenderer support for skyexclusions ifneeded; one correctedbroadoverlay thenstop.
- Reject if: rightfringe remains blankplate, paperbays are called interiorink, or artificialcuts conceal falsefoam.
- Result: corrected292-vertex domain,175-vertex waterexclusion,two explicit skybaycutouts, tighterlowerrootcut. Browser1280×720 DPR1noerrors,aspectpasses.
- Targeted gain: four source-paper points thatW016filled areexcluded byW017; predeclaredoutsideguard remainsoutside. No fullsemantic/fidelitypass inferred.
- Source-pale/cyanfoam retained even if plainmasklooksflat; interiorink notmodeled and willbejudged separately incolorcontrol.
- Evidence frozen output/woodblock-crest-mask-2026-10-29/W017/ including source/probes/checks. Independent return with W018 supports targetedgain/provisionallargerdomain only. Usageunknown.

## W018 — 2026-10-29 — Color through annotated crest domain

- Question: how much plain-mask appearance is omittedinteriorink rather than exteriorboundaryerror?
- Lead reused existing comparisonrenderer with color=1: fixedW006 source-derived vectorcolorlayers drawn through W017outerdomain andskycuts. Originalscan drawn only in reference/overlaypanels. No neweditor/tooling.
- Sourcegeometryiteration remainsW017; diagnosticreceipt explicitlyW018. Principalwatercolors are originalreconstruction and cannot certify separatewatermask. No procedural/stillpromotion.
- Result: source-specific colorednetwork appears; artificialroot/domaincuts remainvisible. Browser1280×720 DPR1noerrors/aspectpasses.
- Evidence: output/woodblock-crest-color-2026-10-29/receipt.json and comparison-1280.png. Independent return supports fixedcoloredappearance/provisionaldomain only; principalwatermask remainsunverified. Next completecoloredstill, not more isolatedsemanticrefinement. Evidence: output/woodblock-crest-color-2026-10-29/review.md. Usageunknown.

### Delegation context correction

- The bounded geometry/review prompts already point to all current files and evidence, but earlier calls inherited the entire long chat. Future bounded calls must use fork_turns=none with self-contained assignments and the same configured role/model. This removes unnecessary inherited context by construction; actual time/token savings remain unmeasured. No new roles or model upgrade.

## W019 — 2026-10-29 — Complete registered-color still

- Independent W017/W018 return recommends fullcoloredcomposition before more uniqueink/watersemanticrefinement. Existing rawmask remainsprovisional; sourcecolors do not certify it.
- Hypothesis: registeredsourcecrest plus continuous authoredwater/supportwaves/clouds establishes coherent source-specific wholeimage, exposes cropseams/compositionissues at actualtargetsizes.
- Assignment: fresh-context wave_worker owns registered-still.html/.mjs and optional scenegeometry only. Same configuredrole/model; paths/evidence self-contained, no inheritedlongchat. One completecandidate thenstop for first1280view.
- Reject if: crestfloats orhasvisiblecropseams, skybaysfilled, genericoldcap returns, watercontours become triangles/uniformstripes, maincrestcropped orviewportletterboxes. No boats/Fuji/proceduralclaim.
- First candidate: complete source-coloredcrest + authoredwater/clouds rendered at1280×720 DPR1withzeroerrors and nooverflow.
- Lead triage REJECT: hard vertical/diagonal sourcecrop edges remain; sourcebranch colors/contours do not continue into authored bands. Horizon has obvious angularpatch. No fullsizes or independentpromotionreview yet.
- Evidence frozen output/woodblock-registered-still-2026-10-29/W019/. One continuity correctionW020 authorized; no seamblur or textureconcealment. Usageunknown.

## W020 — 2026-10-29 — Root-to-body continuity

- Failure/method: registeredcrest ends abruptly against mismatched authoredbody/bands.
- Hypothesis: matching band roots/colors to sourcecut intersections and extending continuous contours removes hardpatchjoin; smooth horizon removes unrelated polygonartifact.
- Assignment: sameworker/files, one correction focused on actualbodycontinuation (no blur/smear), thenfirstcapturestop.
- Reject if: cropedge remainsconspicuous or detail/stylejunction stillreads pastedpatch; no repeated smalltweaks aftertwo sceneattempts.
- Result: fixed-cache rootcolor intervals aligned to six blueband roots; paleparent continued, distantwater smoothed. Browser1280×720 DPR1noerrors.
- Lead triage: root/horizoncontinuity improves, but artificialupstreamclosure is wronglystroked and registeredtexture/ink still contrasts with simplified authoredbody. Fullstill notaccepted.
- Decision: W021 small renderingbugfix removes artificialclosureink; no more nearby seamvariants without scene-leveldiagnosis. Evidence frozen output/woodblock-registered-still-2026-10-29/W020/. Usageunknown.

## W021 — 2026-10-29 — Artificial closure ink bugfix / reserve checkpoint

- Failure: upstreamfill polygon was stroked along artificialregistrationclosure, creating a false vertical/diagonal contour.
- Lead smallserialfix: fill closedupstreamsurface withoutstroking artificialcut; draw only open printedexteriorline. No newgeometryfamily, blur or textureconcealment.
- Checks: modulesyntax; browser1280×720 DPR1,1920×1080 DPR2,960×720 DPR1 and1000×800resize, zeroerrors/nooverflow. Uniformcover keepscrestvisible and eliminates the earlier below-ocean paperstrip in this newstudy. Source/capturehashes and canonicalpin verified, snapshot W021/.
- Lead visiblegain: falsecutline removed; sourcecrest recognizability/contours far richer than W004; body/rootcontinuation and horizon improved. Residualfailure: registered textured/detailedcrest and simplified authoredbody still differ in visual language; lower/secondaryjoins need independentfullframe review. No artistic/readinesspromotion.
- I004: resolved for registeredstill by coverfit/fullcanvaswater; legacyW004 unchanged.
- Allowance: lastfresh sharedfivehour observation9%remaining, weekly74%. Projectreserve rule stops newdelegation; no paidfallback/reset/scheduledrestart. IndependentW021artreview NOTRUN; no releaseclaim.
- Next: whenallowance permits, fresh full-frameW021review at fixedtargets; diagnose coherentwhole-surface representation before another seamnudge or moreisolatedfoamcontrols.
- Evidence: output/woodblock-registered-still-2026-10-29/W021/receipt.json. Usageunknown.

## W022 — 2026-10-29 — Resumed full-frame review

- Fresh allowance: sharedfivehour100%remaining,weekly73%remaining atlaunch; priorreserve no longerblocks work. No resetpurchased/consumed.
- Independent W021review: informedrecognitionPASS; wholewavecoherence/compositionFAIL. Dense sourcecrest + smoothvectorribbons persists acrossW019–W021. Supportingfoam/depth sparse; foregroundbandsdominate narrowerframe.
- Evidence: output/woodblock-registered-still-2026-10-29/W021/review.md; reviewerverifiedsource/capture/referenceidentities.
- Decision: scene-levelwaterrepresentation replacement, notanother seam tweak orisolatedfingerstudy.

## W023 — 2026-10-29 — Unified complete water surface

- Failure/method: detailedcrest reads asinsert against smoothposter-like body/right/foreground.
- Hypothesis: replace allwatercontinuation together with reference-informed irregularfoammasses, overlaps and multiscale flowingcontours, matchingcrest palette/inklanguage.
- Assignment: boundedworker owns registered-still module and optionalscenegeometry only; preserve sourcecrest assets and existingcamera-fit. One completecandidate then first1280capture; no newmaskresearch/editor/UI.
- Reject if: smoothparallelribbons remaindominant, supportingfoam is floatinghookornament, sourcecrest stilllooks pasted, or texture isused tohidebadgeometry.
- First completecandidate: overlaps/cavities replace oldribbons, but first1280view still has smoothteardropteeth and broadcurvedbands below detailedsourcecrest. Source-anatomy/stylecoherence notmet. No independentpromotionreview yet.
- Decision: reject; switch complete surface to provenance-bound boat-free sourcecolorfields with samepalette, not another genericlobevariation. W023snapshot preserved. Usageunknown.

## W024 — 2026-10-29 — Reference-derived water-field atlas

- Failure: hand-authored continuation remains visuallysimplified despite morepaths/regions. Counts do notestablish sourceanatomy.
- Changedrepresentation: allbody/foreground/right surfaces use coherent fixed source-color vectorfields from conservatively boat/Fuji/text-free sourcewaterareas, placed through continuouswatergeometry. No brightness/inksemanticextraction.
- Readonlyresearch selected normalizedboxes: main[285,235,380,360],lowerleft[25,510,330,650],right[940,470,1000,610],foreground[850,610,1000,672]. Contactsheet checks objects/sky beforeuse; not artisticapproval.
- Assignment: sameworker, registeredrenderer + water-surface-atlas.mjs, one sourcecontactsheet + onefullcandidate thenfirstcapturestop. Preserve canonicalasset, samepalette, no source-rastercandidate or clonedrectangles withhardseams. No proceduralclaim.
- Reject if: objects/sky leak, rectangle/scale/palettejoins visible, ink/contours distorted, or field stillreads smoothposter.
- Atlas/sourcecontact checked: four sourcewaterfields,55,400vectorruns,exact12crestcolors; no visible excludedobjects or dominantsky.
- First1280candidate REJECT: coarse sourcefeature magnification, clippedpatches and meshtriangle seams make collageappearance. Source-derivedtexturealone doesnot establish coherentwatergeometry. No more parameter-onlymeshvariants.
- Evidence/source snapshotW024/; atlascontact at output/water-atlas-2026-10-29/source-contact-sheet.png.
- Decision: fixedpainted-surface prototype W025 using builtinimagegen, canonicalscan unchanged/authoritative. Not a semantic/proceduralpass. Usageunknown.

### Evidence correction

- First-view capture receipts previously hashed oldother-size PNGs left in sharedoutputdirectory despite onlycurrent1280result. W023snapshot nowhashesonlyitsactual1280capture. Captureprocedure nowenumerates framesactuallyrenderedinthisinvocation; no stale sizecoverage implied. Earlier technicalfullreceipts remainscoped to their recordedresults.

## W025 — 2026-10-29 — Unified painted-surface prototype

- Failure: repeated mixedrepresentations (detailedsourcecrest +authoredribbons; thenwarpedsourcefields) do not yield one coherent print.
- Different representation: builtinimagegen edits a DERIVEDcopy of canonicalreference into completeboat/Fuji/text-free oceanwithclouds; originalreferencefile/pin remainunchanged. This tests whole-imageaesthetic feasibility, not deterministicgeometry/assetbank/proceduralcomposition. No paidAPI/CLI fallback or newreferenceauthority.
- Preserve originalwave/foam/contour/palette/printlanguage andfullwatercontinuity; remove excludedobjects without blankholes;wideviewport,paleclouds.
- Result: builtinimagegen returned coherent1672×941derivedpaintedstill; copiedtoassets/woodblock/painted-still-v1.png, prompt/receiptstored. Originalsourcepinunchanged. Completed2026-10-30; folderdateisexperimentstart.
- IndependentfixedvisualfeasibilityPASS (informedrecognition/form/coherence/palette, depthqualified), noexcludedobjects/obviousrepairseams. Notuseracceptance/proceduralgeometry/readiness.
- Leadbrowser1280DPR1,1920DPR2,960DPR1zeroerrors/nooverflow;960composition inspected. BrowsertargetsnotindependentlyinspectednativeDPR2. Evidence:output/painted-surface-2026-10-29/{receipt,review,browser}.json/md.
- Decision: retain provisionalvisualbaseline; testpaintedcutoutfamilies anddeterministiccompositor underProposedADR001. No singlepanoramaasendlesssolution. Usageunknown.

## W026 — 2026-10-30 — Transparent main-wave primitive

- Goal: validate asset-basedrepresentation independently of fixedpanorama.
- Hypothesis: a completeopaque-coloredwavebody with truealphaskygaps can retainoriginalprintanatomy andcomposewithoutrectangularpatches.
- Builtinimagegen references: unchangedcanonicalscan(styleauthority), W025generatedderivative(edittarget). Preserveopaqueivoryfoam/indigowater; removeonlyscene/background/otherwaves; fullprimitivewithmargin.
- Reject if: fake/transparency, foamremoved, skyretained, cuttips/bodyrectangles, collage/badstyle. Doesnotproveworldvarietyorcontrols.
- W026result: builtinimagegen1536×1024RGBA, alpha0..254,46.46%fullytransparent. Ivoryfoam visuallyretained, but softgray/bluehalo and tight/touchingside margins failassetreadycriterion. Strict255opaquecount isnotsemanticproof; max254 isnearopaque.
- Asset:assets/woodblock/hero-wave-v1.png; alphaJSON/promptunderoutput/painted-assets-2026-10-30/. No productionuse.
- Decision: ONE targetedW027matte/margin edit preservingartwork; no codecolor-thresholdbackgroundremoval. Usageunknown.

## W027 — 2026-10-30 — Main-wave matte correction

- Failure: W026softbackgroundhalo and crampedmargins undermine true cutoutcompositing.
- Builtinimagegen edit: preservewaveart, remove onlyoutsideglow, keepfoam/bodyopaque, addtransparentmargins uniformly.
- Reject if: halo/backgroundretained, foamdeleted, shapechanged or sidesclipped. Onecandidate theninspect onlight/dark. No alpha/postprocesshacks or proceduralclaim.
- Firstedit transportfailed (noimage); one identicalbuiltinretry returned1536×1024RGBAhero-v2, alpha0..254,47.67%fullytransparent,50.14%nearopaque.
- Actualbrowsercompositing onwarm/navy looks clean; rawimagepreview displayedRGB hiddenunderalpha0. InitialhalojudgmentW026waspremature; no claimofconfirmedvisiblehaloremoval fromrawpreviewalone. Bothcandidateart/alpha preserved, no postprocesscolor-thresholdhack.
- Marginsremain tight, completebody/cutoutbankprovisional; not a fullassetbank/wholeworldpass. Evidence:hero-v2-backgrounds.png,hero-v2-receipt.json underoutput/painted-assets-2026-10-30/.
- I009: inspect actualcomposite onatleasttwobackgrounds before rejecting alphapreviews. DONEinW027, futureassetchecksrequireit. Usageunknown.

## W028 — 2026-10-30 — Distinct painted families

- Goal: lowerbreakerbank and quietlongswell mustdifferstructurally fromlargecurl, not justscaleit.
- Twoindependentbuiltinimagegenedits fromcanonicalstyleauthority +transparentheroedittarget. Onecallperasset, inparallel; no paidAPI/CLI fallback. Prompts storedseparately.
- Expected: opaqueprintedfoam/coloredwater,truealphaskygaps,completefootprints,noshadow/backdrop; lateractualcompositeQArequired.
- Result: breaker1774×887RGBA andswell2172×724RGBA savedasassets/woodblock/{breaker-bank-v1,long-swell-v1}.png. All3familiesmanifestedwithSHA/alpha/corebounds/provenance; opaquefoam andskytransparency visuallyretained on warm/navyactualbrowsercomposites.
- Profilesdistinct: hero tallcurl, breakermultiplelowerfronts, swelllonglowridge. No worldvariety/occlusion/readinessclaim yet; tightassetmargins/footprints need compositionreview.
- Evidence:assets/woodblock/manifest.json; output/painted-assets-2026-10-30/*-backgrounds.png + prompts. No codealpha cleanup orsourceediting. Usageunknown.

## W029 — 2026-10-30 — Seeded painted-ocean prototype

- Goal: varied compositions from three painted wave families, preserving the recognizable Great Wave opening.
- Worker ownership: `src/painted/` and `research/woodblock/ocean.html`; legacy production remains unchanged.
- Result: four model tests passed. Opening frame loaded without browser errors and showed coherent printed water; no rectangular patches were visible. This did not prove world variety.
- Inspection found keyboard focus, seed URL, and unnecessary paused redraw defects. Correct these before broader checks.
- Evidence: `output/painted-ocean-2026-10-30/W029/`. Usage unknown.

## W030 — 2026-10-30 — Interaction and pause efficiency

- Corrected global navigation after button focus, native button Space handling, canvas focus, loading guards, seed URLs, and paused rendering.
- Browser result: nine check groups passed, with zero errors. Reduced motion starts paused; pause stops redraws; controls work; 80 distant seeks return identical pixels. Desktop sizes 1280, 1920 at DPR2, 960, and resize passed.
- Loading guards, default automatic travel, and modeled visibility events passed. Actual OS-hidden-tab behavior remains untested.
- Independent visual review rejected quiet scenery: flat striped water, excessive empty sky, low clipped banks, and adjacent duplicate breakers. Opening recognition passes only as an informed review.
- Evidence: `output/painted-ocean-2026-10-30/W030/`, including source snapshot, receipts and review. Launch allowance: 80% five-hour / 59% weekly remaining.
- Efficiency change: review quiet intervals and boundaries before promotion; a strong landing and family counts are insufficient.

## W031 — 2026-10-30 — Continuous painted-water trial

- Hypothesis: overlapping low swells could cover the smooth water and raise the distant sea.
- Worker owned scene, renderer and model tests. Three discriminating views were captured before broader testing.
- Result: tests and loading passed; lead and independent review rejected repeated foam rows and a weakened opening hollow. Coverage improved, composition failed.
- Decision: discard the added foam carpet. Further stamp-density adjustments would preserve the failure; use a distinct low-relief water material.
- Evidence: `output/painted-ocean-2026-10-30/W031/`. Usage unknown.

## W032 — 2026-10-30 — Quiet painted-water material

- Missing primitive: broad connected blue bodies, flowing contours, restrained ivory bands and minimal foam.
- Built-in image generation used the canonical scan as reference and produced `assets/woodblock/quiet-water-v1.png`, 2172×724. Original reference unchanged; prompt and provenance are recorded in `output/painted-water-2026-10-30/` and the asset manifest.
- Worker assignment: replace W031's repeated foam background with world-anchored water material beneath selected crests; preserve the opening hollow. Check actual seams rather than assuming the generated strip tiles.
- Result: independent review retains the water-field method; quiet coverage and opening hollow improve. Remaining material grain mismatch and repeated foreground profiles prevent world acceptance. Nine browser groups, 80-seek pixel return and desktop layouts pass again with zero errors. A resize assertion initially ran before the resize event; waiting for the actual backing size resolves the test timing issue.
- Evidence: `output/painted-ocean-2026-10-30/W032/` and `W032-full/`. Launch allowance: 70% five-hour / 58% weekly remaining. No paid fallback or reset used.

## W033 — 2026-10-30 — Water-style compatibility revision

- One built-in edit of the quiet-water material, guided by the canonical scan: broader flat ink contours, finer grain, restrained foam. No runtime or placement changes.
- Asset: `assets/woodblock/quiet-water-v2.png`; prompt: `output/painted-water-2026-10-30/prompt-v2.md`. V1 preserved for comparison.
- Three source-bound captures load without errors. Lead and independent comparison retain V2: broader clearer bands, reduced mottling, preserved hero hollow; no hard seam apparent in these stills. Horizon softness remains lower priority. Foreground profile repetition remains unresolved.
- Evidence: `output/painted-ocean-2026-10-30/W033/`. Usage unknown.

## W034 — 2026-10-30 — Distinct low-bank construction

- Diagnosis: the conspicuous x7200 duplicates are all `swell` features, not the separate `breaker` family. Checked feature IDs before changing assets.
- New built-in reference edit: `assets/woodblock/low-bank-v1.png`, two unequal lower ridges and broad saddle, distinct from the original right-heavy swell. Prompt and alpha metadata recorded; canonical unchanged.
- Assignment: deterministic low/swell variation with fewer identical adjacent constructions; retain the opening and W033 water. One source writer, read-only independent review.
- Result: eight model tests and nine browser groups pass. Actual alpha composite is clean on paper/indigo. Independent review passes sampled composition: ten consecutive views, two held-out scenes, two desktop layouts. Opening identity, varied banks/depth, quiet water and cloud presence pass; no conspicuous hard joins in reviewed stills. Native DPR2 fine detail, unrestricted world quality and user acceptance remain unverified.
- Decision: freeze visual assets and integrate. Evidence: W034/, W034-full/.

## W035 — 2026-10-30 — Main-entry integration

- Replaced root Braille entry with the reviewed painted ocean. Archived unused Braille renderer, geometry, style and scene tests outside active source; retained shared camera/random. Updated historical fixture imports and current documentation.
- Archived superseded hero/water candidates outside active assets; evidence and original generated outputs preserved.
- Result: ten model tests and nine root-entry browser groups pass. Zero browser errors. All fourteen integrated captures exactly match W034's reviewed prototype. Source snapshot and integration receipt frozen under `output/painted-ocean-2026-10-30/W035/`.
- Reference scan and all active manifest asset hashes verified. Six fixed images; no region cache. This does not measure process memory.
- Scope: first local desktop iteration complete. Not deployed; no commit/push. Actual OS-hidden-tab behavior and user artistic acceptance remain unverified. Reopen visual work for a concrete failing fixture rather than another speculative polish round.
- Efficiency outcome: one writer plus one independent reviewer, small failing-view checks before broad suites, and a representation change stopped repeated foam-density tuning. Exact resource savings unmeasured. Usage unknown.

## W036 — 2026-10-30 — User-directed style correction

- User: shape works, art style feels weird. Reopens aesthetic fidelity despite W034 sampled review; keep shapes and behavior.
- Diagnosis: enlarged yellow paper, high-contrast clean outlines and bright saturated wave ink read as a modern illustration.
- Small trial: runtime crop of unchanged canonical sky plus restrained wave-layer saturation/contrast; no image editing, shape or placement changes.
- Reject if washed out, clouds disappear, source objects leak into crop or style mismatch persists. First opening/quiet view before expansion. Independent diagnosis confirms paper scale, ink contrast and excessive detail as primary mismatches.
- Launch allowance: 55% five-hour / 56% weekly remaining.
- Result: lead and independent review retain the correction. Finer sky, muted cyan/contrast, visible restrained clouds and no source-object leakage in three native1280 views. Shapes/placements unchanged. Residual cleaner/uniform foam outlines require a different asset-level correction rather than more palette tuning.
- Ten model tests and nine root browser groups pass with zero errors; 80-seek pixels reproduce, desktop sizes/resize pass. Fourteen captures and source snapshot: `output/painted-ocean-2026-10-30/W036-full/`. Canonical hash verified unchanged. Larger native artistic review and user acceptance remain unverified.
- Workflow finding: prior recognition/composition review did not establish material fidelity. Future style review must compare paper scale, ink saturation/contrast and line finish explicitly.

## W037 — 2026-10-30 — Defined water boundaries, no fading

- User rejects misty/faded wave tops and asks for boundaries defined like the canonical print. Prior sampled passes missed a visible material defect.
- Exact causes: 120-world-unit vertical alpha ramp over the water; 430-source-pixel horizontal feather between water tiles. Both make opaque printed forms translucent.
- Worker ownership: renderer, material geometry and existing model tests only. Replace fades with opaque contour-based joins and a defined skyline; do not expose horizontal crop edges or rectangular tiles. Preserve wave shapes and controls.
- First test: failing quiet view and tile boundaries at actual display scale. Result: opacity/defined ridge improves, but mirrored tiles introduce symmetric chevrons at screen x395 in the x3200 fixture and x150 in x7200. Lead and independent review reject this join; do not restore fades.
- W037 source and captures frozen. Next W038: asymmetric opaque continuation, first nonmirrored compatibility test.

## W038 — 2026-10-30 — Opaque asymmetric water joins

- Failure: W037 reflected texture creates folded/chevron motifs. Retain defined opaque water and remove reflection. Test native nonmirrored edge compatibility first; use contour overlap only if needed. No alpha feathering.
- Same worker ownership; first quiet view before broader testing. Result: defined skyline preserved but native tile edges do not match; hard vertical join visible at screen x395 in x3200. Reject.
- Two simple tiling approaches fail the same join criterion. Change join representation to an asymmetric opaque overlap; no more reflection/direct-repeat tuning.

## W039 — 2026-10-30 — Opaque contour overlap

- Preserve defined skyline, opacity and approved foreground shapes. Replace hard tile join with a source-compatible asymmetric cut through overlapping water; never blend translucent images.
- Result: opacity and skyline pass, but independent review finds a diagonal contour cut in x3200 (x1040–1100,y490–550) and x7200 (x190–250,y175–240). Reject opaque quilting: color matching does not establish contour continuity. No further seam-cost tuning. Technical checks pass separately.

## W040 — 2026-10-30 — Continuous quiet-water contours

- Three texture join controls demonstrate the source material does not tile continuously. Do not hide this with fading.
- Replace tiled quiet foundation with continuous world-space colored water and broad unequal flowing ribbons, preserving defined skyline, opening hollow and existing wave assets. This changes the join representation entirely. Earlier W029 code water failed as a flat low strip with uniform thin lines; the changed premise is a full low-swell body with broad unequal contour ribbons, directly reviewed beside retained painted banks. Reject uniform thin stripes, smooth empty poster water or lost reference style.
- Result: reject first quiet view as flat parallel ribbons beside textured banks; no broad tests. This repeats W029's material mismatch, so stop this vector-foundation branch rather than add superficial texture.

## W041 — 2026-10-30 — Closed-contour painted water

- Changed tiling premise: earlier quiet asset has contours crossing its sides; no join trick can guarantee continuation. A new built-in canonical-reference edit places complete flowing bands inside opaque indigo side margins. Joins no longer sever wave forms.
- Asset: `assets/woodblock/quiet-water-closed-v1.png`; prompt/provenance recorded. Original unchanged.
- Integrate simple opaque repeats with defined curved skyline; discard reflection, feathering and quilting code. First quiet view fixes opacity and avoids severed contour joins, but plain margins create an oversized blue gap and flat skyline segment. One refinement W042 crops only plain side margins and curves their skyline into a trough; no fades or seam tricks reintroduced. W041 superseded; evidence frozen.

## W042 — 2026-10-30 — Defined opaque water retained

- Crop 160 plain source pixels at each side, retaining whole ivory forms and native aspect. Curved margin troughs remove the long ruler-flat boundary. No vertical/horizontal alpha ramps, reflection, quilting or artificial horizon wash remain in active rendering.
- Independent review of x0/x3200/x7200 retains the requested correction: solid water to its defined ivory/indigo boundary, opening hollow intact, no obvious ghosting, folded motifs or severed-form joins. Skyline is authored and source-informed, not a traced exterior. User artistic acceptance remains open.
- Twelve model tests and nine root browser groups pass; zero browser errors. Eighty distant seeks return identical pixels. Desktop1280/1920DPR2/960 and resize pass. Fourteen captures plus source snapshot/review: `output/painted-ocean-2026-10-30/W042-full/`. Active assets and canonical reference hashes verified.
- Discarded approaches: mirror/direct joins of crossing contours, pixel-cost quilting, and flat ribbon substitute. Changed the asset premise instead: closed contours inside opaque side margins. Removed failed implementation from active renderer; retained compact evidence.
- Final scope: fixes user-rejected fading. Not global artistic acceptance or deployment. Last observed allowance31%fivehour/52%weekly; no paid fallback/reset. Exact resource savings unknown.

## W043 — 2026-10-30 — Restore procedural construction requirement

- User: return to source GitHub; no standard template or duplicate waves. Audited original Shan Shui repository/readme and local pinned mountain/planner source against current scene.
- Finding: current scene randomizes placement/scale of four completed sprites and forces region0 composition; quiet material repeats periodically. This does not meet the original generation requirement. Prior appearance/model passes were insufficient and must not be called procedural acceptance.
- Supersede ADR-001 with ADR-002. Stop expanding/tuning finished sprite catalogue. Retain visual/interaction checkpoint and canonical reference; replace wave anatomy and continuous water construction.
- Success: generated topology and contour networks, no reused finished shapes, exact geometry and perceptual repetition checks over declared fixtures, deterministic revisits. No claim of an untested infinite uniqueness guarantee.
- Source audit/direction complete; procedural replacement not implemented or verified.

## W044 — 2026-10-30 — Procedural whole-wave first slice

- User authorized ADR-002 implementation: Shan Shui construction hierarchy with canonical Hokusai appearance; no completed-wave sprites or repeating water templates.
- Worker owns new src/procedural/ and research/woodblock/generated-gallery.html only. Root painted checkpoint remains unchanged until replacement passes.
- Hypothesis: a shared generated water surface, boundary-integrated attached foam branches and surface-following bands produce coherent complete waves with different topology across seeds. Prior separate-cap ornaments and parallel-ribbon substitutes are rejected controls, not reusable foundations.
- First handoff: one executable whole-wave view and render; triage before gallery expansion. Finite/deterministic geometry and topology descriptors follow visible gain.
- First source/render delivered, syntax passes, browser0errors. Lead rejects seed721 as comb/organpipes with crossing spike tips. Root domain and child-turn ordering identified in source; generator claim alone is not visual success.
- Evidence: `output/procedural-wave-2026-10-30/W044/`, including exact source snapshot and reference pin. No gallery expansion.

## W045 — 2026-10-30 — Connected curling branch correction

- Correct crossing fork walks; place thick unequal recurved branches on curlingfront rather than back/upwardspikes; couple irregular indigochannels toactualrootgroups.
- Preserve sharedsurface, body/hollow and noassetconstruction. Same worker ownership; seed721 first render before expansion.
- Result: syntax/finite coordinates/no proper crossings reported for seed721; browser0errors. W045source/render frozen. Crossed tips improve, but same broadcap +uprightteeth +verticalorganpipe failure persists. Reject visual form; no gallery expansion or texture polishing.
- Two edits preserve failure; stop this representation and obtain one bounded independent structural diagnosis before another implementation.

## W046 — 2026-10-30 — Rolled-front surface patch

- Independent diagnosis of W044/W045: all base-to-crest trajectories produce parallel pipes; exterior-normal branches grow above crown; separately serrated seam forms a decorated arch. Width/root tweaks preserve failure.
- New test: retain smooth back but add a separate rolled-front patch turning crown through overhang to descending lip. Three connected unequal foam branches, open water channels and ink bands must share this curved coordinate system. One opaque texture-free seed before expansion.
- Fingerprint audit: earlier hashes include seed/metadata and cannot establish geometry uniqueness. Future duplicate checks must hash normalized actual geometry only. No uniqueness pass claimed.
- Result: new rolled-front module and rendered whole context delivered. Browser0errors; source/capture frozen under `output/procedural-wave-2026-10-30/W046/`. Lead sees bands/channels turn around a principal hollow, a representation gain. Still fails full visual acceptance: schematic three-prong cap and crossing back/front contour transition. No world or gallery promotion.
- Six sample seeds produce finite deterministic geometry with six distinct normalized geometry hashes excluding seed/metadata. This proves neither perceptual uniqueness nor topology diversity. Evidence: geometry-check.json.
- Checkpoint at shared five-hour allowance10%remaining (weekly49%). Project workflow requires stopping new delegation at this reserve; W046 independent review deferred. Rootapp/referenceunchanged. Next: coherent back/front coordinate transition and multi-level attached foam hierarchy, then seedgallery only after visual gain.

## W047 — 2026-10-30 — Shared back/front flow continuity

- Allowance refreshed to100%fivehour/48%weekly; resumed user-authorized work without reset.
- Worker replaced separate lower/front ribbons with one matched C1 chart, preserving body/cap. Seed721 reported join position0, derivative mismatch6.36e-14, consistent orientation at8,385samples and no intersections among16 band boundaries.
- Lead rendered exact source: no browser errors; crossing contour fan at patch join is removed. This is a technical/visible continuity gain, not full artistic acceptance. Three schematic foam prongs remain the next isolated failure.
- Evidence: output/procedural-wave-2026-10-30/W047/. Researcher independently examines source foam hierarchy; no gallery/world expansion yet.

## W048 — 2026-10-30 — Carved foam hierarchy

- Bounded source study recommends one connected foam mass with two unequal branching root groups and open rounded coves; not additional concentric prongs.
- Constraints: primary roots wider than children; children<=70%parent width and recurved toward hollow; unequal coves remain open to principal hollow. Preserve W047 shared flow chart.
- Source context maincrest x900–2400,y250–1300 in canonical3859×2594 scan; whole image remains composition authority. One seed721 executable before gallery expansion.
- W048 source/render delivered; reported positive parent overlap, finite/simple component polygons and open radial cove probes. Lead and independent review reject art: branches sit on water-facing cap interior while smooth independent water lip remains. These checks do not prove external crest anatomy. Palette/flow retained; no expansion.
- Exact diagnosis: branch radii127–247 inside waterannulus; body closes independently through innerLip map(-16,102). Next W049 replaces boundary domain instead of adding ornaments.

## W049 — 2026-10-30 — Shared exposed-front boundary

- One generated boundary graph must terminate both water and foam. Unequal branches/coves become exterior foam–sky silhouette around the principal hollow; no independent smooth lip underneath. Internal indigochannels remain distinct from exterior skycoves.
- Preserve W047 C1 flow and clip it to new body. One seed721 wholecontext, no texture/gallery.
- Result: one identical337-point front graph terminates body/cap; reported0proper crossings, finite geometry and open sampled sky paths. Lead capture has0browsererrors and shows exposedhooked silhouette instead of interior ornaments.
- Visible remaining failure: excessive blank ivory cap with little internal indigo/foamweb hierarchy. Preserve externalboundary fix; independent next-step review requested. Evidence: W049 source/render snapshot.

## W050 — 2026-10-30 — First bifurcated water bay

- Single open two-lobe bay replaces simple cap return seam. Reported finite/simple boundaries, connected sampled water routes and attached ivory tongue; exterior paths and C1flow preserved.
- Lead render: bay sits on remote left back (x281–432), not under active rolled-front root groups (cx+60–260). Topological connection alone misses intended anatomical relationship. Reject placement; no texture/gallery polish. Evidence W050/source/render.

## W051 — 2026-10-30 — Bay/root domain coupling

- Derive unequal bay heads from rolled-front/root positions, with broad mouth following existing flow. Replace misplaced left fork, preserve external graph and positive foam web.
- Result: W051 moves unequal bay heads under rolled-front roots using retained flow chart; reported open water/tongue routes and simple boundaries preserved. Browser0errors; source/render frozen.
- Independent review passes this as construction control: externalhooks+sky cove, internal waterbay/tongue and continuousflow coherentlylinked. It remains schematic with sparse/oversizedtips; no releaseartacceptance. This permits a6-seed topology research test, not world integration.
- Efficiency finding: one fixed control is useful for boundary construction but repeated poster tuning postpones the user's core generative requirement. Once parts are coherently linked, a small seed gallery is a research test of topology/style, not an artistic promotion or endless-world acceptance. No fixed-control jitter may be presented as structural generation.

## W052 — 2026-10-30 — Seeded topology grammar and gallery

- Replace fixed four-tip/front and two-head/bay control with seeded rooted graph generation, variable root/child counts and unequal relationships. No completed silhouettes or preset finished polygon bank.
- Preserve shared external boundary, connected foam/water paths and C1 flow. Six seeds, structural descriptors and normalized actual-geometry duplicate checks; IDs/seed/debug metadata excluded.
- Existing single-seed view retained; small research gallery only. No style/release/infinite-uniqueness claim from finite tests.
- Delivered actual seeded root/child grammar and small gallery. Lead reran6modeltests: finite/simple/sharedboundary/openroutes, C1order, deterministicreturn, normalizedgeometry/topologydistinctness and invalidseedrejection allpass. Browser0errors; all6detailviews and defaultgallery render,1280/1920DPR2 aspect/nohorizontaloverflow pass.
- Lead visual rejects perceptual variety/form: commonbodyframe dominatesall6, childhooks flatten into nearhorizontalteeth (reach68–90 vs step10–25). Genuine topological differences do not satisfy perceptual uniqueness or canonical anatomy.
- Evidence W052/gallery,6nativeindividuals,2layouts,receipt/source. Independent visual review requested. No rootapp promotion.
- Allowance at dispatch77%fivehour/45%weekly. One source writer; read-only reviewer; lead captures avoid known child-browser permission failure.

## W053 — 2026-10-30 — Parent-frame child anatomy and held-out constraints

- Children grow in parent tangent/normal frames with length/neck tied to available fan space. Two contrasting first renders remove horizontal teeth but remain schematic/scalloped; no artistic pass.
- First cove probes falsely crossed neighboring groups. Boundary-derived routes correct the test; stress seeds3/9/16/25 additionally reveal real fan encroachment, fixed by reserving space for inward curls. Seed11's narrow water route now descends before angular movement rather than crossing a tongue.
- Final six+heldouts5/11 pass6modeltests; 0..31 reported all valid (roots2:18,3:10,4:4). Minimum model sky-route clearance .04893sourcepx alone does not prove rendered openness.
- Lead browser6detail/defaultgallery/2layouts pass with0errors. Raster connectivity at1440DPR1: one foam component and no isolated sky component>=9pixels for each6sample; smaller antialias regions excluded. Evidence W053-first2 in W053/, final source/captures/raster report in W053-final/.
- Retain construction gain, not source artistic acceptance. Shared body profile still dominates repetition.

## W054 — 2026-10-30 — Independent profile field

- Generate relative height/back-front slope/lean/hollow breadth using an independent seed stream, compose one invertible field with all procedural geometry/flow/probes/tangents. No raster or global SVG scaling.
- First0/1847 renders show visibly different height, lean and hollow proportions; both transformed diagnostics pass, bounds fitframe. Source/captures frozen W054/.
- Fullmatrix complete: lead10tests pass; browser6views/defaultgallery/2layouts0errors; rasterbasechecks retainonefoamcomponent/noisolatedsky>=9pixels in6. Actualcrownpositions span127.96pxheight/107.95pxwidth. Independent review confirms realprofilevariationwithinonecurlfamily, notwholeworld/nonrepetitionguarantee. Sourcefinishstillinsufficient. Evidence W054-final/.
- Separate source zoom study identifies inset ink contours attached to foam nodes as structural linework, distinct from texture. Future test: one node-derived C-shaped seam, wholly inside ivory, no external-outline/water-inlet bridge; do not scatter decorative curls.

## W055–W056 — 2026-10-30 — Structural ink rule

- W055: contained node-positioned C glyph passes numeric containment but lead/independent review reject it as an isolated eye. No distribution or enlargement of this motif.
- W056 changes premise: preserve the actual child’s paired outer/return sides, derive its medial spine, map through shared profile, retain a readable throat→bend→curl span. Seed1847 crease25.44px long,1.35px stroke,1.44px edgeclearance; unchanged basefingerprint. Lead/independent review retain this anatomical-path method for six-seed testing, not whole-crest acceptance. Context/source/captures frozen by iteration.

## W057 — 2026-10-30 — Qualified branch creases

- Readable spine creases generated per child, rejected candidates retain reasons; no path shrinkage or forced coverage. Six sample accepted counts4/6/5/6/3/6; dense1847 rejects3, uintmax rejects1.
- Lead12tests pass: allW054 base geometry/fingerprints unchanged across primary6, heldouts5/11 and0..31; anatomical ownership, open inset paths and pair spacing, actualink fingerprints separatefrombaseuniqueness. Browser6views/gallery/2layouts0errors. Evidence W057/.
- Visible branch articulation improves; overall cap/silhouette/bands still schematic. No source artistic or world acceptance.

## W058 — 2026-10-30 — Slender-width trial rejected

- Attempt to decouple length/transverse width removes protrusion instead of making actual fingers. First0/1847 renders show nearly smooth cap edge, no qualified ink and failing current sky routes. Raw diagnostic capture explicitly bypasses preview guard for inspection, never a functional pass.
- Reject without further constraint tuning; restore W057 source/tests. Do not keep tightening an outline-waveform parameterization that lacks true growing branch geometry. Evidence W058/.
- Next representation: centerline-grown tapered fork at exposed frontier, not an inset ornament or another contour scallop.

## W059 — 2026-10-30 — Interactive generated collections

- Lead added New waves, nontechnical labels, reproducible set URLs, detail/All waves and Back restoration. Fixed fixtures and direct seed links never silently resample. Random candidate rejection records its seed/reason; normalized base geometry is checked against current/new collection before display. Session seed schedule avoids reused IDs without growing generation history; fixed initial exclusions remain bounded.
- Lead browser7checkgroups pass,0errors. Default vectors exactly match W057; three new collections plus initial fixtures yield24distinct seeds/base geometries in this run. Reload/back/detail reproduce geometry. Invalidseed is explicit link error, not a static fallback. No rejected random candidates occurred in the measured run.
- Scope is finite exact-repeat checking, not perceptual/infinite uniqueness. Evidence W059/source/receipt/generated-set.png, including reproducible generated URL.
- UI and model ownership were disjoint; captures occurred after source hold. Future code integration should serialize writes explicitly to preserve the one-writer workflow.

## W060 — 2026-10-30 — Centerline-grown exposed fork control

- New isolated branch-patch module/control page; stable W057 model and lead gallery UI preserved. Actual tapered parent centerline grows two unequal children, width decreases to tips; identical branch polygons form both water and foam termination.
- Water base ends behind child roots. Reported all finite/simple component boundaries, positive attachments (minimum4.61px), child/parent width ratios.653/.558, open cove route with4.51px minimum clearance. Browser0errors; source/render frozen.
- Lead and independent review see actual slender descending/recurved branches instead of outline bumps. Intentional left/bottom context cuts prevent whole-crest judgment. No integration, topology-matrix or source artistic acceptance for this patch.
- Next: replace exactly one crest group in stable generator, attach this parent to real cap/water and verify exposed domain/cove natively before generalizing. Do not return to a narrower contour waveform or internal branch ornament.
- Checkpoint at9%fivehour/34%weekly remaining. No new delegation after reserve; no reset/purchase/paid fallback. Main root remains painted checkpoint; procedural gallery is functional research only.
