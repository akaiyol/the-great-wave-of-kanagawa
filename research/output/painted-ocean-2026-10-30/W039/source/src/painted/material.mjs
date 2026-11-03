// Native-aspect quiet-water patches overlap through one cached opaque seam.
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
export function waterTiles(left,right){
  const result=[];
  for(let i=Math.floor(left/WATER_STEP)-1;i<=Math.floor(right/WATER_STEP);i++)result.push({id:i,x:i*WATER_STEP,width:WATER_TILE_WIDTH});
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
  if(sourceX<WATER_SOURCE_OVERLAP){
    const t=sourceX/WATER_SOURCE_OVERLAP,blend=t*t*(3-2*t);
    ridgeY=sourceRidge(WATER_SOURCE_STEP+sourceX)*(1-blend)+ridgeY*blend;
  }
  // The opening hollow is an authored low-water silhouette, not a source trace.
  const hollow=Math.exp(-(((worldX-940)/1050)**2));
  return waterHorizon(worldX)+(390+ridgeY*WATER_SCALE-490)*(1-hollow);
}

// Dynamic-programming seam crosses matching paint regions; every retained pixel
// remains opaque. This runs once per material load, never during travel.
export function waterSeam(pixels,width,height,overlap=WATER_SOURCE_OVERLAP){
  const margin=24,span=overlap-2*margin,back=new Int8Array(span*height);
  let previous=new Float64Array(span),next=new Float64Array(span);
  for(let y=0;y<height;y++){
    for(let column=0;column<span;column++){
      const x=column+margin,a=(y*width+width-overlap+x)*4,b=(y*width+x)*4;
      let cost=0;for(let channel=0;channel<3;channel++)cost+=(pixels[a+channel]-pixels[b+channel])**2;
      let parent=column;
      if(y){
        for(const candidate of [column-1,column+1])if(candidate>=0&&candidate<span&&previous[candidate]<previous[parent])parent=candidate;
        cost+=previous[parent];
      }
      next[column]=cost;back[y*span+column]=parent-column;
    }
    [previous,next]=[next,previous];
  }
  let column=0;for(let i=1;i<span;i++)if(previous[i]<previous[column])column=i;
  const seam=new Uint16Array(height);
  for(let y=height-1;y>=0;y--){seam[y]=column+margin;column+=back[y*span+column];}
  return seam;
}
