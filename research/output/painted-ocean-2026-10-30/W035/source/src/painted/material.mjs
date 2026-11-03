// Uniform material scale and overlapping horizontal patches; no crest warping.
export const WATER_SCALE=.85;
export const WATER_TILE_WIDTH=2172*WATER_SCALE;
export const WATER_OVERLAP=430*WATER_SCALE;
export const WATER_STEP=WATER_TILE_WIDTH-WATER_OVERLAP;
export function waterHorizon(worldX){
  // The initial curl retains its deep sky hollow; quiet regions have nearer sea.
  return 490+265*Math.exp(-(((worldX-940)/1050)**2));
}
export function waterTiles(left,right){
  const result=[];
  for(let i=Math.floor(left/WATER_STEP)-1;i<=Math.floor(right/WATER_STEP);i++)result.push({id:i,x:i*WATER_STEP,width:WATER_TILE_WIDTH});
  return result;
}
