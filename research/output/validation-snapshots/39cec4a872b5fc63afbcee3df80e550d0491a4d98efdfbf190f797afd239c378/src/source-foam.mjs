// UNACCEPTED local source-interface geometry pilot; no whole-crest claim.
// Canonical Met DP130155 SHA256: cbb9988f2f18b9180a1cc0cf5dbb0e3bbf8f2e85d17930cf6ca9ab36fac36303
// Primitive: research/geometry/source-interface-primitive-v1.json
// Primitive SHA256: 4e948e29a4e25f403a0b6d2b71282f393bd2e70bfbc2ad3384a38ec19ed1bb14
// Source control SHA256: 6ce1f22e93259a2ce8ace0f087ccd4e6bf892fb47e8a988e2b318d6a1bed36ff
// Outer44/hole8 vertices; source-space RDP tolerance0.5referenceunit.
// Top/left crop closures are procedural attachments, not printed foam edges.
const OUTER=[["M",325.0,145.0],["L",330.75,145.0],["L",331.75,147.0],["L",332.5,145.0],["L",335.0,145.0],["L",335.0,146.25],["L",336.75,145.0],["L",341.75,145.0],["L",343.25,149.25],["L",345.0,151.0],["L",347.5,151.5],["L",349.0,152.75],["L",352.25,160.75],["L",355.75,163.25],["L",356.25,165.5],["L",355.25,172.0],["L",353.75,173.5],["L",352.25,173.75],["L",351.75,172.25],["L",353.25,171.5],["L",353.25,168.75],["L",351.75,164.25],["L",350.75,162.25],["L",346.0,159.0],["L",344.75,157.25],["L",339.75,156.25],["L",338.0,157.75],["L",336.75,157.5],["L",336.75,154.25],["L",338.0,154.0],["L",338.25,153.0],["L",340.0,153.0],["L",338.75,151.5],["L",336.5,152.0],["L",334.75,155.0],["L",334.75,160.75],["L",331.75,166.0],["L",329.25,168.0],["L",326.5,168.5],["L",326.25,166.0],["L",328.25,166.5],["L",330.25,163.0],["L",330.5,156.0],["L",325.25,148.25],["Z"]];
const HOLE=[["M",329.25,148.0],["L",329.75,151.5],["L",331.5,152.75],["L",334.0,150.5],["L",335.25,146.5],["L",334.5,146.5],["L",332.0,149.75],["L",331.0,149.75],["Z"]];
// Uniform world scale is set by the actual root span; one affine downward
// lean x'=x-.4*y preserves every horizontal artificial top/root cut.
export function sourceInterfaceFoam(leftWorld,rightWorld){
 const scale=Math.hypot(rightWorld[0]-leftWorld[0],rightWorld[1]-leftWorld[1])/16.75;
 const map=path=>path.map(([op,x,y])=>{
  if(op==='Z')return ['Z'];
  const localX=x-325,localY=y-145;
  return [op,leftWorld[0]+scale*(localX-.4*localY),leftWorld[1]+scale*localY];
 });
 return {foam:[map(OUTER)],holes:[map(HOLE)]};
}
