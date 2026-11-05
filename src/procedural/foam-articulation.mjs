import {generateComposition, compositionSvg} from './composition.mjs';
import {random, hash} from '../random.mjs';
import {cubicBezier, pointInPolygon, pointSegmentDistance, segmentsCross} from './geometry.mjs';

const pt = p => p.map(n => n.toFixed(4)).join(',');
const pathData = curves => `M${pt(curves[0][0])}` + curves.map(c => ` C${c.slice(1).map(pt).join(' ')}`).join('');
const distance = (p, poly) => poly.reduce((d, a, i) => Math.min(d, pointSegmentDistance(p, a, poly[(i + 1) % poly.length])), Infinity);

// A shrinking elliptical turn is integrated as three Hermite cubic arcs.
// Sweep, contraction, eccentricity and frame are generated, not glyph choices.
function returningCurve(center, angle, scale, sweep, eccentricity, contraction) {
  const transform = ([x, y]) => [center[0] + scale * (x * Math.cos(angle) - y * Math.sin(angle)),
    center[1] + scale * (x * Math.sin(angle) + y * Math.cos(angle))];
  const at = t => {
    const a = -.65 + sweep * t, r = 1 - contraction * t;
    return [r * Math.cos(a), eccentricity * r * Math.sin(a)];
  };
  const tangent = t => {
    const a = -.65 + sweep * t, r = 1 - contraction * t;
    return [-contraction * Math.cos(a) - r * sweep * Math.sin(a),
      eccentricity * (-contraction * Math.sin(a) + r * sweep * Math.cos(a))];
  };
  return Array.from({length: 3}, (_, i) => {
    const a = at(i / 3), b = at((i + 1) / 3), ta = tangent(i / 3), tb = tangent((i + 1) / 3);
    return [a, a.map((v, k) => v + ta[k] / 9), b.map((v, k) => v - tb[k] / 9), b].map(transform);
  });
}

function conflicts(points, width, other) {
  const gap = (width + other.strokeWidth) / 2 + .3;
  for (let i = 1; i < points.length; i++) for (let j = 1; j < other.points.length; j++) {
    const [a, b, c, d] = [points[i - 1], points[i], other.points[j - 1], other.points[j]];
    if (segmentsCross(a, b, c, d) || Math.min(pointSegmentDistance(a, c, d),
      pointSegmentDistance(b, c, d), pointSegmentDistance(c, a, b), pointSegmentDistance(d, a, b)) < gap) return true;
  }
  return false;
}

export function generateArticulation(seed = 721) {
  const baseline = generateComposition(seed), primary = baseline.primary;
  const map = primary.wave.surfaceChart.map, r = random(hash(seed, 0x50303931));
  const marks = [], rejected = [], groups = [];
  const retained = primary.inkSeams.map(s => ({points: s.points, strokeWidth: s.strokeWidth}));
  // Unequal correlated groups follow the turn; lower incursions receive fewer marks.
  const count = 6 + Math.floor(r() * 3);
  for (let g = 0; g < count; g++) {
    const u = .43 + g / (count - 1) * 1.55 + (r() - .5) * .12;
    const radius = g % 3 === 1 ? 168 + r() * 30 : 235 + r() * 19;
    const center = map(u, radius), next = map(u + .005, radius);
    const angle = Math.atan2(next[1] - center[1], next[0] - center[0]) + .3 + (r() - .5) * .4;
    const parentScale = 10 + r() * 4, children = 2 + Math.floor(r() * 4);
    groups.push({id: g, u, radius, center, angle, parentScale, children});
    for (let child = 0; child <= children; child++) {
      const s = child === 0 ? parentScale : 6 + r() * (parentScale - 6);
      const side = child % 2 === 0 ? 1 : -1;
      const du = child === 0 ? 0 : side * (.035 + r() * .06) * (1 + child * .24);
      const dr = child === 0 ? 0 : (child - 2) * (7 + r() * 5);
      const anchor = map(u + du, radius + dr), strokeWidth = 1.2 + r() * .8;
      const curves = returningCurve(anchor, angle + (r() - .5) * .7, s,
        3.9 + r() * 1.2, .6 + r() * .35, .15 + r() * .24);
      const points = curves.flatMap((c, i) => Array.from({length: 25}, (_, j) => cubicBezier(...c, j / 24)).slice(i ? 1 : 0));
      const mark = {group: g, child, anchor, scale: s, strokeWidth, curves, points, d: pathData(curves)};
      let reason = null;
      if (!(anchor[0] >= 430 && anchor[0] <= 780 && anchor[1] >= 250 && anchor[1] <= 450)) reason = 'outside-turn-region';
      else if (!points.every(p => primary.foamPolygons.some(poly => pointInPolygon(p, poly)
        && distance(p, poly) >= strokeWidth / 2 + 1))) reason = 'foam-clearance';
      else if (retained.some(other => conflicts(points, strokeWidth, other))) reason = 'retained-mark-conflict';
      if (reason) rejected.push({group: g, child, anchor, reason});
      else {marks.push(mark); retained.push(mark);}
    }
  }
  const paths = marks.map(m => `<path d="${m.d}" fill="none" stroke="#23485f" stroke-width="${m.strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
  const original = compositionSvg(baseline);
  const insertion = original.indexOf('</g><g><defs><clipPath id="front-');
  if (insertion < 0) throw new Error('Primary composition layer boundary missing');
  const svg = original.slice(0, insertion) + paths + original.slice(insertion);
  const finite = marks.every(m => Number.isFinite(m.strokeWidth) && m.curves.flat(2).every(Number.isFinite));
  return {seed, baseline, composition: baseline, marks, paths: marks.map(m => m.d), groups, rejected, svg,
    diagnostics: {finite, accepted: marks.length, rejected: rejected.length,
      attempted: marks.length + rejected.length, scope: 'sampled containment and retained-mark exclusion; visual gain unreviewed'}};
}
