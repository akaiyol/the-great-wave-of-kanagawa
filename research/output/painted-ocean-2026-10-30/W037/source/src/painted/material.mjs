// Quiet-water material keeps its native aspect. Reflected neighbors meet on
// identical source pixels, so no alpha overlap or rectangular repeat edge is exposed.
export const WATER_SCALE=.85;
export const WATER_SOURCE_WIDTH=2172;
export const WATER_SOURCE_HEIGHT=724;
export const WATER_TILE_WIDTH=WATER_SOURCE_WIDTH*WATER_SCALE;
export const WATER_STEP=WATER_TILE_WIDTH;
// Upper exterior of the first complete ivory ridge in quiet-water-v2.png.
// Source-space anchors: left root (0,224), crown (429,130), trough (1060,240).
// The path stays with the ivory/indigo boundary rather than a horizontal image crop.
export const WATER_RIDGE=[
  [0,224],[76,210,220,170,340,140],[405,121,461,126,518,140],
  [647,174,794,225,955,238],[1060,247,1165,222,1280,198],
  [1385,176,1465,165,1550,174],[1670,184,1770,204,1880,198],
  [1990,191,2090,203,2172,224]
];
export function waterTiles(left,right){
  const result=[];
  for(let i=Math.floor(left/WATER_STEP);i<=Math.floor(right/WATER_STEP);i++)result.push({id:i,x:i*WATER_STEP,width:WATER_TILE_WIDTH,reflected:Math.abs(i%2)===1});
  return result;
}

export function waterHorizon(worldX){
  return 490+265*Math.exp(-(((worldX-940)/1050)**2));
}
const cubic=(a,b,c,d,t)=>((1-t)**3)*a+3*((1-t)**2)*t*b+3*(1-t)*t*t*c+t*t*t*d;
export function waterBoundary(worldX){
  const id=Math.floor(worldX/WATER_STEP),local=(worldX-id*WATER_STEP)/WATER_SCALE;
  const sourceX=Math.abs(id%2)===1?WATER_SOURCE_WIDTH-local:local;
  let start=WATER_RIDGE[0],ridgeY=start[1];
  for(const segment of WATER_RIDGE.slice(1)){
    if(sourceX<=segment[4]){
      let lo=0,hi=1;
      for(let i=0;i<22;i++){const t=(lo+hi)/2;if(cubic(start[0],segment[0],segment[2],segment[4],t)<sourceX)lo=t;else hi=t;}
      ridgeY=cubic(start[1],segment[1],segment[3],segment[5],(lo+hi)/2);break;
    }
    start=segment.slice(4);
  }
  // The opening hollow is an authored low-water silhouette, not a source trace.
  const hollow=Math.exp(-(((worldX-940)/1050)**2));
  return waterHorizon(worldX)+(390+ridgeY*WATER_SCALE-490)*(1-hollow);
}
