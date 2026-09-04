// ═══════════════════════════════════════════════════
// PROCEDURAL TEXTURE GENERATORS
// ═══════════════════════════════════════════════════
import { hash2d, noise2d, fbm, clamp, rgb, TEX_SIZE, genHeightMap, canvasFromFn, heightToNormal, roughnessCanvas } from './noise.js';

export function genOakTextures() {
  const s = TEX_SIZE;
  const hData = genHeightMap((nx, ny) => {
    const grain = Math.sin((ny * 50 + fbm(nx * 5, ny * 0.8, 4) * 4) * Math.PI * 2) * 0.5 + 0.5;
    return clamp(grain * 0.7 + fbm(nx * 12, ny * 3, 3) * 0.3, 0, 1);
  }, s);
  const color = canvasFromFn(s, (nx, ny) => {
    const h = hData[(ny * s | 0) * s + (nx * s | 0)];
    return rgb(135 + h * 60, 85 + h * 35, 40 + h * 20);
  });
  return { color, roughness: roughnessCanvas(hData, s, 0.65, 0.4), normal: heightToNormal(hData, s, 3.0) };
}

export function genSlateTextures() {
  const s = TEX_SIZE;
  const hData = genHeightMap((nx, ny) => {
    return clamp(fbm(nx * 10, ny * 10, 6) * 0.6 + fbm(nx * 25, ny * 25, 3) * 0.3 + noise2d(nx * 40, ny * 40) * 0.1, 0, 1);
  }, s);
  const color = canvasFromFn(s, (nx, ny) => {
    const h = hData[(ny * s | 0) * s + (nx * s | 0)];
    const vein = fbm(nx * 6 + 50, ny * 6 + 50, 3);
    const isVein = vein > 0.62 ? (vein - 0.62) * 5 : 0;
    return rgb(75 + h * 30 - isVein * 20, 85 + h * 25 - isVein * 15, 95 + h * 20 - isVein * 10);
  });
  return { color, roughness: roughnessCanvas(hData, s, 0.8, 0.3), normal: heightToNormal(hData, s, 4.0) };
}

export function genMarbleTextures() {
  const s = TEX_SIZE;
  const hData = genHeightMap((nx, ny) => {
    return clamp(fbm(nx * 3, ny * 3, 4) * 0.2 + 0.1, 0, 1);
  }, s);
  const color = canvasFromFn(s, (nx, ny) => {
    const warp1 = fbm(nx * 4 + 10, ny * 4 + 10, 4) * 8;
    const warp2 = fbm(nx * 4 + 20, ny * 4 + 20, 4) * 8;
    const v1 = Math.abs(Math.sin((nx * 7 + warp1) * Math.PI + (ny * 5 + warp2) * Math.PI * 0.7));
    const v2 = Math.abs(Math.sin((nx * 12 + warp2 * 0.7) * Math.PI - (ny * 3 + warp1 * 0.5) * Math.PI * 1.2));
    const vein = Math.min(v1, v2);
    const veinDark = vein < 0.06 ? (1 - vein / 0.06) * 0.85 : 0;
    const veinLight = vein < 0.12 && vein >= 0.06 ? (1 - (vein - 0.06) / 0.06) * 0.15 : 0;
    const base = 228 + fbm(nx * 2, ny * 2, 3) * 12;
    return rgb(base - veinDark * 120 + veinLight * 10, base - 5 - veinDark * 100 + veinLight * 8, base - 8 - veinDark * 90 + veinLight * 6);
  });
  return { color, roughness: roughnessCanvas(hData, s, 0.1, 0.15), normal: heightToNormal(hData, s, 0.8) };
}

export function genCarpetTextures() {
  const s = TEX_SIZE;
  const hData = genHeightMap((nx, ny) => {
    const wx = Math.sin(nx * Math.PI * 24) * 0.5 + 0.5;
    const wy = Math.sin(ny * Math.PI * 24) * 0.5 + 0.5;
    const weave = (wx > 0.5 ? wy : 1 - wy) * 0.5;
    return clamp(weave + fbm(nx * 20, ny * 20, 3) * 0.15, 0, 1);
  }, s);
  const color = canvasFromFn(s, (nx, ny) => {
    const h = hData[(ny * s | 0) * s + (nx * s | 0)];
    const wx = Math.sin(nx * Math.PI * 24) * 0.5 + 0.5;
    const wy = Math.sin(ny * Math.PI * 24) * 0.5 + 0.5;
    const pattern = wx > 0.5 ? wy : 1 - wy;
    const fiber = fbm(nx * 30, ny * 30, 2) * 15;
    return rgb(130 + pattern * 25 + fiber, 95 + pattern * 20 + fiber * 0.7, 80 + pattern * 15 + fiber * 0.5);
  });
  return { color, roughness: roughnessCanvas(hData, s, 0.7, 0.3), normal: heightToNormal(hData, s, 3.5) };
}

export function genConcreteTextures() {
  const s = TEX_SIZE;
  const hData = genHeightMap((nx, ny) => {
    const brush = Math.sin((nx * 300 + fbm(nx * 2, ny * 0.3, 3) * 15) * Math.PI) * 0.12;
    const pores = fbm(nx * 40, ny * 40, 3) > 0.55 ? 0.15 : 0;
    return clamp(fbm(nx * 12, ny * 12, 5) * 0.4 + brush + pores + 0.25, 0, 1);
  }, s);
  const color = canvasFromFn(s, (nx, ny) => {
    const h = hData[(ny * s | 0) * s + (nx * s | 0)];
    const variation = fbm(nx * 8, ny * 8, 3) * 12;
    const base = 160 + h * 25 + variation - 6;
    const temp = fbm(nx * 3 + 50, ny * 3 + 50, 2);
    return rgb(base + temp * 5, base + temp * 2, base - temp * 3);
  });
  return { color, roughness: roughnessCanvas(hData, s, 0.75, 0.25), normal: heightToNormal(hData, s, 3.0) };
}

export function genBambooTextures() {
  const s = TEX_SIZE;
  const hData = genHeightMap((nx, ny) => {
    const fiber = Math.sin(ny * Math.PI * 80) * 0.08;
    const node = Math.exp(-Math.pow((ny % 0.25) - 0.125, 2) * 800) * 0.3;
    return clamp(fiber + node + fbm(nx * 6, ny * 4, 4) * 0.25 + 0.3, 0, 1);
  }, s);
  const color = canvasFromFn(s, (nx, ny) => {
    const h = hData[(ny * s | 0) * s + (nx * s | 0)];
    const node = Math.exp(-Math.pow((ny % 0.25) - 0.125, 2) * 800);
    return rgb(185 + h * 35 - node * 30, 155 + h * 25 - node * 20, 80 + h * 15 - node * 10);
  });
  return { color, roughness: roughnessCanvas(hData, s, 0.45, 0.3), normal: heightToNormal(hData, s, 2.0) };
}

export function genCorkTextures() {
  const s = TEX_SIZE;
  const hData = genHeightMap((nx, ny) => {
    let v = fbm(nx * 12, ny * 12, 5);
    const dots = fbm(nx * 30 + 100, ny * 30 + 100, 3);
    v += (dots > 0.6 ? (dots - 0.6) * 2 : 0) * 0.3;
    return clamp(v * 0.8 + 0.1, 0, 1);
  }, s);
  const color = canvasFromFn(s, (nx, ny) => {
    const h = hData[(ny * s | 0) * s + (nx * s | 0)];
    const dots = fbm(nx * 30 + 100, ny * 30 + 100, 3);
    const dark = dots > 0.62 ? (dots - 0.62) * 8 : 0;
    return rgb(175 + h * 25 - dark * 40, 135 + h * 20 - dark * 30, 90 + h * 15 - dark * 20);
  });
  return { color, roughness: roughnessCanvas(hData, s, 0.55, 0.35), normal: heightToNormal(hData, s, 2.8) };
}

export function genCeramicTextures() {
  const s = TEX_SIZE;
  const hData = genHeightMap((nx, ny) => {
    const crackle = Math.abs(Math.sin(nx * 60 + fbm(nx * 8, ny * 8, 3) * 5));
    const glaze = fbm(nx * 4, ny * 4, 3) * 0.15;
    return clamp((crackle < 0.03 ? 0.3 : 0) + glaze + 0.08, 0, 1);
  }, s);
  const color = canvasFromFn(s, (nx, ny) => {
    const h = hData[(ny * s | 0) * s + (nx * s | 0)];
    const crackle = Math.abs(Math.sin(nx * 60 + fbm(nx * 8, ny * 8, 3) * 5));
    const isCrack = crackle < 0.03 ? 0.85 : 0;
    return rgb(210 + h * 15 - isCrack * 40, 200 + h * 12 - isCrack * 35, 185 + h * 10 - isCrack * 30);
  });
  return { color, roughness: roughnessCanvas(hData, s, 0.2, 0.2), normal: heightToNormal(hData, s, 1.2) };
}

export function genWalnutTextures() {
  const s = TEX_SIZE;
  const hData = genHeightMap((nx, ny) => {
    const tileH = 0.04;
    const row = Math.floor(ny / tileH);
    const grain = Math.sin(((ny % tileH) / tileH) * Math.PI * 12) * 0.5 + 0.5;
    return clamp(grain * 0.6 + fbm(nx * 10, ny * 10, 4) * 0.3 + 0.15, 0, 1);
  }, s);
  const color = canvasFromFn(s, (nx, ny) => {
    const h = hData[(ny * s | 0) * s + (nx * s | 0)];
    const tileH = 0.04;
    const edge = Math.min((ny % tileH) / tileH, 1 - (ny % tileH) / tileH);
    const isEdge = edge < 0.08 ? 1 : 0;
    return rgb(80 + h * 45 - isEdge * 20, 50 + h * 30 - isEdge * 15, 30 + h * 20 - isEdge * 10);
  });
  return { color, roughness: roughnessCanvas(hData, s, 0.5, 0.3), normal: heightToNormal(hData, s, 3.2) };
}

export function genTerrazzoTextures() {
  const s = TEX_SIZE;
  const chips = [];
  for (let i = 0; i < 80; i++) {
    chips.push({
      cx: hash2d(i * 7 + 1, i * 3 + 2),
      cy: hash2d(i * 11 + 5, i * 9 + 7),
      sz: 0.02 + hash2d(i, i) * 0.04,
      tint: hash2d(i * 3, i * 5),
    });
  }
  const hData = genHeightMap((nx, ny) => {
    let base = fbm(nx * 5, ny * 5, 4) * 0.12;
    for (const c of chips) {
      const dx = nx - c.cx, dy = ny - c.cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < c.sz) base += (1 - dist / c.sz) * 0.4;
    }
    return clamp(base + 0.12, 0, 1);
  }, s);
  const color = canvasFromFn(s, (nx, ny) => {
    const h = hData[(ny * s | 0) * s + (nx * s | 0)];
    for (const c of chips) {
      const dx = nx - c.cx, dy = ny - c.cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < c.sz) {
        const edge = dist / c.sz;
        let cr, cg, cb;
        if (c.tint < 0.2) { cr = 190; cg = 55; cb = 45; }
        else if (c.tint < 0.38) { cr = 50; cg = 70; cb = 110; }
        else if (c.tint < 0.55) { cr = 110; cg = 145; cb = 75; }
        else if (c.tint < 0.72) { cr = 195; cg = 170; cb = 130; }
        else { cr = 140; cg = 90; cb = 80; }
        const shade = 0.85 + edge * 0.15;
        return rgb(cr * shade + h * 10, cg * shade + h * 8, cb * shade + h * 8);
      }
    }
    return rgb(205 + h * 15, 198 + h * 12, 188 + h * 10);
  });
  return { color, roughness: roughnessCanvas(hData, s, 0.45, 0.35), normal: heightToNormal(hData, s, 2.5) };
}
