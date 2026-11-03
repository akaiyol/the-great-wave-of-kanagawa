// Continuous water geometry. Tiled material and RGB quilting were removed:
// minimum-color seams crossed wave contours even when adjacent colors matched.
export const WATER_SCALE=.85;
export const WATER_SOURCE_WIDTH=2172;
export const WATER_SOURCE_HEIGHT=724;
export const WATER_TILE_WIDTH=WATER_SOURCE_WIDTH*WATER_SCALE;
export const WATER_SOURCE_OVERLAP=430;
export const WATER_SOURCE_STEP=WATER_SOURCE_WIDTH-WATER_SOURCE_OVERLAP;
export const WATER_STEP=WATER_SOURCE_STEP*WATER_SCALE;
// Upper exterior of the first complete ivory ridge in quiet-water-v2.png.
// Source-space anchors: left root (0,224), crown (429,130), trough (1060,240).
// The path stays with the ivory/indigo boundary rather than a horizontal image crop.
export const WATER_RIDGE=[
  [0,224],[76,210,220,170,340,140],[405,121,461,126,518,140],
  [647,174,794,225,955,238],[1060,247,1165,222,1280,198],
  [1385,176,1465,165,1550,174],[1670,184,1770,204,1880,198],
  [1990,191,2090,239.1052631579,2172,224]
];
export function waterHorizon(worldX){
  return 490+265*Math.exp(-(((worldX-940)/1050)**2));
}
const cubic=(a,b,c,d,t)=>((1-t)**3)*a+3*((1-t)**2)*t*b+3*(1-t)*t*t*c+t*t*t*d;
function sourceRidge(sourceX){
  let start=WATER_RIDGE[0],ridgeY=start[1];
  for(const segment of WATER_RIDGE.slice(1)){
    if(sourceX<=segment[4]){
      let lo=0,hi=1;
      for(let i=0;i<22;i++){const t=(lo+hi)/2;if(cubic(start[0],segment[0],segment[2],segment[4],t)<sourceX)lo=t;else hi=t;}
      ridgeY=cubic(start[1],segment[1],segment[3],segment[5],(lo+hi)/2);break;
    }
    start=segment.slice(4);
  }
  return ridgeY;
}
export function waterBoundary(worldX){
  const id=Math.floor(worldX/WATER_STEP),sourceX=(worldX-id*WATER_STEP)/WATER_SCALE;
  let ridgeY=sourceRidge(sourceX);
  if(sourceX<WATER_SOURCE_OVERLAP){
    const t=sourceX/WATER_SOURCE_OVERLAP,blend=t*t*(3-2*t);
    ridgeY=sourceRidge(WATER_SOURCE_STEP+sourceX)*(1-blend)+ridgeY*blend;
  }
  // The opening hollow is an authored low-water silhouette, not a source trace.
  const hollow=Math.exp(-(((worldX-940)/1050)**2));
  return waterHorizon(worldX)+(390+ridgeY*WATER_SCALE-490)*(1-hollow);
}


// Broad, unequal flow ribbons derive their proportions from quiet-water-v2's
// long ivory saddles and wide blue faces. These are authored geometry, not tracing.
export const WATER_RIBBONS=[
  {offset:0,amplitude:0,length:630,phase:0,width:42,spread:20,color:'#eee5c9'},
  {offset:24,amplitude:12,length:470,phase:.7,width:35,spread:17,color:'#a8c7c6'},
  {offset:138,amplitude:43,length:590,phase:2.2,width:74,spread:34,color:'#2d6b85'},
  {offset:163,amplitude:49,length:590,phase:2.2,width:24,spread:18,color:'#eee5c9'},
  {offset:311,amplitude:61,length:780,phase:4.1,width:96,spread:42,color:'#2b6680'},
  {offset:338,amplitude:57,length:780,phase:4.1,width:38,spread:26,color:'#b3d0ca'},
  {offset:505,amplitude:73,length:540,phase:.5,width:66,spread:28,color:'#eee5c9'}
];
export function waterRibbon(worldX,ribbon){
  const flow=Math.sin(worldX/ribbon.length+ribbon.phase);
  const top=waterBoundary(worldX)+ribbon.offset+ribbon.amplitude*flow;
  const width=ribbon.width+ribbon.spread*Math.sin(worldX/(ribbon.length*.73)+ribbon.phase+1.3);
  return [top,top+width];
}
