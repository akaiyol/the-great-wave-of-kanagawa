// Original feasibility code. No Shan Shui implementation is copied here.
export const DOT_BITS = [[0, 3], [1, 4], [2, 5], [6, 7]];
export function pack(mask, width, height) {
  if (width % 2 || height % 4 || mask.length !== width * height)
    throw new Error('Mask dimensions must be multiples of 2 × 4');
  const cols = width / 2, rows = height / 4;
  const cells = new Uint8Array(cols * rows);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++)
    if (mask[y * width + x]) cells[(y >> 2) * cols + (x >> 1)] |= 1 << DOT_BITS[y % 4][x % 2];
  return {cells, cols, rows};
}
export function textOf({cells, cols, rows}) {
  const lines = [];
  for (let y = 0; y < rows; y++) {
    let line = '';
    for (let x = 0; x < cols; x++) line += String.fromCharCode(0x2800 + cells[y * cols + x]);
    lines.push(line);
  }
  return lines.join('\n');
}
export function hash(seed, index) {
  let h = (seed ^ Math.imul(index, 0x9e3779b9)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x21f0aaad);
  h = Math.imul(h ^ (h >>> 15), 0x735a2d97);
  return (h ^ (h >>> 15)) >>> 0;
}
export function rng(seed) {
  let n = 0;
  return () => hash(seed, ++n) / 4294967296;
}
export function waveParams(seed, id) {
  const r = rng(hash(seed, id));
  return {height: 0.75 + r() * 0.2, reach: 0.9 + r() * 0.18,
    fingers: 7 + Math.floor(r() * 5), seed: hash(seed, id)};
}
export class TileCache {
  constructor(make) { this.make = make; this.tiles = new Map(); this.peak = 0; }
  visit(first, last) {
    // Evict BEFORE allocating to bound peak retained tiles during large jumps.
    for (const key of this.tiles.keys()) if (key < first || key > last) this.tiles.delete(key);
    for (let key = first; key <= last; key++) if (!this.tiles.has(key)) this.tiles.set(key, this.make(key));
    this.peak = Math.max(this.peak, this.tiles.size);
    return this.tiles;
  }
}
