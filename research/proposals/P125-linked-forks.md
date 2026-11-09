# P125 — Extend exact parent-linked contours to existing forks

Preserve P124 child0 and every scene material/geometry. Add exact P098 hood/counter/accent from generateInkParent(hash(721,106+i)) to existing child i=1,2,3 through its own component-field root/scale transform T(p)=root[i]+(p-[40,67])*scale[i]. No new placement/density/rotation/scale tuning; no extra marks in blank cap or weighted outer contours.

Full polygons and every edge must remain inside their actual clipped child, including boundary-contact checks, before scene dispatch. Stop on any failure, no correction. If pass, one whole-view P124-versus-four-parent comparison against canonical. Reject repeated C/eye/comb effect, clutter or no clear contribution; no nearby rescue or broadchecks after rejection. Exactidentity differs from P108 independentfield but does not establish anatomicalvariety.

Budget10000estimated incl500processreserve. Max9000testwork including observed full workerstartup~3000, checks/capture~2000, strategy/review~1200 and headroom. Reuse bounded existing worker context; no measured efficiencyclaim.
