import {hash, random, field} from './random.mjs';
export const WORLD_HEIGHT = 896;
export const REGION_WIDTH = 960;
export const MAX_EXTENT = 1600;
export const FAMILIES = ['curl', 'breaker', 'band'];
const snap = n => Math.round(n / 4) * 4;

function candidates(seed, region) {
  const energy = field(hash(seed, 190), region / 2.7);
  const result = [];
  for (let layer = 0; layer < 3; layer++) {
    const r = random(hash(hash(seed, region), layer + 501));
    const count = layer === 0 ? 4 + Math.floor(r() * 4) : layer === 1 ? 2 + Math.floor(energy * 3 + r()) : Math.floor(energy * 2 + r() * 1.3);
    const groupCenter = .2 + r() * .6;
    for (let slot = 0; slot < count; slot++) {
      const id = `${layer}:${region}:${slot}`, featureSeed = hash(hash(hash(seed, region), layer + 1), slot + 1);
      const fr = random(featureSeed), choice = fr();
      const family = layer === 0 ? (choice < .76 ? 'band' : 'breaker') : layer === 1 ? (choice < .22 ? 'curl' : choice < .72 ? 'breaker' : 'band') : choice < .55 ? 'curl' : choice < .84 ? 'breaker' : 'band';
      const width = layer === 0 ? 100 + fr() * 210 : layer === 1 ? 260 + fr() * 290 : 520 + fr() * 330;
      const height = family === 'band' ? width * (.065 + fr() * .045) : family === 'breaker' ? width * (.22 + fr() * .12) : width * (.44 + fr() * .12);
      // A shared group location plus feature jitter creates uneven intervals.
      const location = (slot / Math.max(1, count) * .55 + groupCenter * .35 + fr() * .3) % 1;
      const baseline = layer === 0 ? 245 + fr() * 170 : layer === 1 ? 490 + fr() * 220 : 855 + fr() * 115;
      result.push({id, region, layer, seed:featureSeed, family, x:snap(region * REGION_WIDTH + location * REGION_WIDTH), y:snap(baseline - height), width, height, depth:baseline, priority:fr(), energy});
    }
  }
  return result;
}

export function regionFeatures(seed, region) {
  const own = candidates(seed, region);
  const neighbors = [...candidates(seed, region - 1), ...own, ...candidates(seed, region + 1)];
  return own.filter(a => !neighbors.some(b => a.id !== b.id && a.layer === b.layer && Math.abs(a.depth - b.depth) < 70 && Math.abs((a.x + a.width * .55) - (b.x + b.width * .55)) < (a.width + b.width) * .26 && (b.priority > a.priority || (b.priority === a.priority && b.id < a.id))));
}

export function featureBounds(f) {
  return {left:f.x - 96, right:f.x + f.width * 1.2 + 96, top:f.y - 100, bottom:f.y + f.height + 170};
}
export function sceneFeatures(seed, left, right) {
  if (!Number.isFinite(left) || !Number.isFinite(right) || right < left) throw new RangeError('Invalid world interval');
  const result = [];
  for (let region = Math.floor((left - MAX_EXTENT) / REGION_WIDTH); region <= Math.floor((right + MAX_EXTENT) / REGION_WIDTH); region++) {
    for (const f of regionFeatures(seed, region)) {
      const b = featureBounds(f);
      if (b.right >= left && b.left <= right) result.push(f);
    }
  }
  return result.sort((a,b) => a.layer - b.layer || a.depth - b.depth || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}
