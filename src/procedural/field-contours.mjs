/** Extract unsimplified zero contours from a row-major, positive-inside grid.
 * Loops omit the repeated closing point; boundary contours are openChains.
 */
export function fieldContours(values, width, height, {
  originX = 0, originY = 0, step = 1,
} = {}) {
  if (!(values instanceof Float64Array) || !Number.isInteger(width)
      || !Number.isInteger(height) || width < 2 || height < 2
      || values.length !== width * height) {
    throw new TypeError('Expected a Float64Array and matching grid dimensions >= 2');
  }
  if (![originX, originY, step].every(Number.isFinite) || step <= 0
      || !values.every(Number.isFinite)) {
    throw new RangeError('Grid values and transform must be finite; step must be positive');
  }
  const nodes = new Map();
  const segments = [];
  let ambiguousCells = 0;

  // Edge keys use integer grid coordinates, shared by neighboring cells.
  function node(axis, x, y) {
    const key = `${axis}:${x}:${y}`;
    if (!nodes.has(key)) {
      const a = values[y * width + x];
      const b = values[(y + (axis === 'v' ? 1 : 0)) * width
        + x + (axis === 'h' ? 1 : 0)];
      // Scale first to avoid overflow in a - b for large finite samples.
      const scale = Math.max(Math.abs(a), Math.abs(b));
      const t = scale === 0 ? 0.5 : (a / scale) / (a / scale - b / scale);
      nodes.set(key, {
        point: [originX + (x + (axis === 'h' ? t : 0)) * step,
          originY + (y + (axis === 'v' ? t : 0)) * step],
        edges: [],
      });
    }
    return key;
  }
  function connect(a, b) {
    const id = segments.length;
    segments.push([a, b]);
    nodes.get(a).edges.push(id);
    nodes.get(b).edges.push(id);
  }

  for (let y = 0; y < height - 1; y++) {
    for (let x = 0; x < width - 1; x++) {
      const samples = [values[y * width + x], values[y * width + x + 1],
        values[(y + 1) * width + x + 1], values[(y + 1) * width + x]];
      const inside = samples.map(value => value > 0);
      const crossed = [];
      for (let e = 0; e < 4; e++) {
        if (inside[e] !== inside[(e + 1) % 4]) crossed.push(e);
      }
      if (!crossed.length) continue;
      const edgeNodes = new Map();
      const get = e => {
        if (!edgeNodes.has(e)) {
          edgeNodes.set(e, e === 0 ? node('h', x, y)
            : e === 1 ? node('v', x + 1, y)
              : e === 2 ? node('h', x, y + 1) : node('v', x, y));
        }
        return edgeNodes.get(e);
      };
      if (crossed.length === 2) connect(get(crossed[0]), get(crossed[1]));
      else {
        ambiguousCells++;
        // Bilinear field at cell center; scaling preserves its sign.
        const scale = Math.max(...samples.map(Math.abs));
        const centerInside = samples.reduce((sum, v) => sum + v / scale, 0) > 0;
        const pairs = centerInside === inside[0]
          ? [[0, 1], [2, 3]] : [[0, 3], [1, 2]];
        for (const [a, b] of pairs) connect(get(a), get(b));
      }
    }
  }

  const loops = [];
  const openChains = [];
  const visited = new Uint8Array(segments.length);
  function trace(start) {
    const points = [];
    let current = start;
    while (true) {
      points.push(nodes.get(current).point);
      const edge = nodes.get(current).edges.find(id => !visited[id]);
      if (edge === undefined) {
        openChains.push(points);
        return;
      }
      visited[edge] = 1;
      const [a, b] = segments[edge];
      current = current === a ? b : a;
      if (current === start) {
        loops.push(points);
        return;
      }
    }
  }
  // Boundary endpoints first, so a chain cannot be split by an interior start.
  for (const [key, value] of nodes) {
    if (value.edges.length === 1 && !visited[value.edges[0]]) trace(key);
  }
  for (let id = 0; id < segments.length; id++) {
    if (!visited[id]) trace(segments[id][0]);
  }
  return { loops, openChains, ambiguousCells };
}
