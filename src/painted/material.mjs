// Direct opaque repeats are viable here because the replacement material's
// ivory and blue forms terminate before its plain indigo side margins.
export const WATER_SCALE=.85;
export const WATER_SOURCE_WIDTH=2172;
export const WATER_SOURCE_HEIGHT=724;
export const WATER_CROP_LEFT=160;
export const WATER_CROP_WIDTH=WATER_SOURCE_WIDTH-2*WATER_CROP_LEFT;
export const WATER_TILE_WIDTH=WATER_CROP_WIDTH*WATER_SCALE;
export const WATER_STEP=WATER_TILE_WIDTH;
// Authored source-informed low-water skyline for quiet-water-closed-v1.png.
// It sits above the upper closed foam forms; it is not a traced exterior.
// Plain margin endpoints share height and tangent for a continuous skyline.
// Profile x coordinates are relative to the cropped image (source x minus160).
export const WATER_RIDGE=[
  [0,145],[60,145,100,124,120,112],
  [265,112,410,23,550,28],[660,28,760,102,900,105],
  [1010,104,1130,54,1260,53],[1400,52,1505,103,1650,112],
  [1700,120,1792,145,1852,145]
];
export function waterTiles(left,right){
  const result=[];
  for(let i=Math.floor(left/WATER_STEP);i<=Math.floor(right/WATER_STEP);i++)result.push({id:i,x:i*WATER_STEP,width:WATER_TILE_WIDTH});
  return result;
}

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
  // The opening hollow is an authored low-water silhouette, not a source trace.
  const hollow=Math.exp(-(((worldX-940)/1050)**2));
  return waterHorizon(worldX)+(390+ridgeY*WATER_SCALE-490)*(1-hollow);
}

