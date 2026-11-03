// Independent 32-bit generators; no upstream implementation is copied.
export function hash(seed, index) {
  let h = (seed ^ Math.imul(index, 0x9e3779b9)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x21f0aaad);
  h = Math.imul(h ^ (h >>> 15), 0x735a2d97);
  return (h ^ (h >>> 15)) >>> 0;
}
export function random(seed) { let n = 0; return () => hash(seed, ++n) / 4294967296; }
export function field(seed, x) {
  const i = Math.floor(x), t = x - i, ease = t * t * (3 - 2 * t);
  return (hash(seed, i) * (1 - ease) + hash(seed, i + 1) * ease) / 4294967296;
}
