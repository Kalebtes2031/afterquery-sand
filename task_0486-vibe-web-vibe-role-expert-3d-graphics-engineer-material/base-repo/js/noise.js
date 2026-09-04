// ═══════════════════════════════════════════════════
// NOISE & MATH UTILITIES
// ═══════════════════════════════════════════════════
export function hash2d(ix, iy) {
  let h = Math.imul(ix | 0, 374761393) + Math.imul(iy | 0, 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h = h ^ (h >>> 16);
  return ((h & 0x7fff) / 32767);
}
export function noise2d(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash2d(ix, iy), b = hash2d(ix+1, iy);
  const c = hash2d(ix, iy+1), d = hash2d(ix+1, iy+1);
  return a + (b-a)*ux + (c-a)*uy + (a-b-c+d)*ux*uy;
}
export function fbm(x, y, oct) {
  oct = oct || 6;
  let v = 0, amp = 0.5, freq = 1;
  for (let i = 0; i < oct; i++) {
    v += amp * noise2d(x * freq, y * freq);
    amp *= 0.5; freq *= 2.0;
  }
  return v;
}
export function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
export function lerp(a, b, t) { return a + (b - a) * t; }
export function rgb(r, g, b) { return [clamp(r,0,255)|0, clamp(g,0,255)|0, clamp(b,0,255)|0]; }

export function heightToNormal(hData, size, strength) {
  const nCanvas = document.createElement('canvas');
  nCanvas.width = nCanvas.height = size;
  const ctx = nCanvas.getContext('2d');
  const nd = ctx.createImageData(size, size);
  const s = strength || 2.5;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const gH = (px, py) => {
        px = ((px % size) + size) % size;
        py = ((py % size) + size) % size;
        return hData[py * size + px];
      };
      const dx = (gH(x-1, y) - gH(x+1, y)) * s;
      const dy = (gH(x, y-1) - gH(x, y+1)) * s;
      const dz = 1.0;
      const len = Math.sqrt(dx*dx + dy*dy + dz*dz);
      const idx = (y * size + x) * 4;
      nd.data[idx]   = ((dx / len) * 0.5 + 0.5) * 255 | 0;
      nd.data[idx+1] = ((dy / len) * 0.5 + 0.5) * 255 | 0;
      nd.data[idx+2] = ((dz / len) * 0.5 + 0.5) * 255 | 0;
      nd.data[idx+3] = 255;
    }
  }
  ctx.putImageData(nd, 0, 0);
  return nCanvas;
}

export const TEX_SIZE = 512;

export function genHeightMap(fn, size) {
  const data = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      data[y * size + x] = fn(x / size, y / size);
    }
  }
  return data;
}

export function canvasFromFn(size, fn) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const id = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const [r, g, b] = fn(x / size, y / size);
      const i = (y * size + x) * 4;
      id.data[i] = r; id.data[i+1] = g; id.data[i+2] = b; id.data[i+3] = 255;
    }
  }
  ctx.putImageData(id, 0, 0);
  return c;
}

export function roughnessCanvas(hData, size, baseR, variation) {
  return canvasFromFn(size, (nx, ny) => {
    const h = hData[(ny * size | 0) * size + (nx * size | 0)];
    const v = clamp(baseR + (h - 0.5) * variation, 0, 1);
    const g = (v * 255) | 0;
    return [g, g, g];
  });
}
