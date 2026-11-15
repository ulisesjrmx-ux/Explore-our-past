import { SHIP_IDLE_IMAGE_URL, SHIP_THRUST_IMAGE_URL } from '../data/planets';

export interface NormalizedShipSprites {
  idle: HTMLCanvasElement | null;
  moving: HTMLCanvasElement | null;
}

let cachedSprites: NormalizedShipSprites | null = null;
let loadPromise: Promise<NormalizedShipSprites> | null = null;

function normalizeShipImage(url: string): Promise<HTMLCanvasElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      const maxDim = 640;
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));

      const work = document.createElement('canvas');
      work.width = w;
      work.height = h;
      const wCtx = work.getContext('2d');
      if (!wCtx) {
        resolve(null);
        return;
      }
      wCtx.drawImage(img, 0, 0, w, h);

      let axisAngle = (78 * Math.PI) / 180;
      let anchorX = w * 0.54;
      let anchorY = h * 0.72;
      let hullLen = h * 0.34;

      try {
        const imgData = wCtx.getImageData(0, 0, w, h);
        const data = imgData.data;
        const visited = new Uint8Array(w * h);
        const queue = new Int32Array(w * h);
        let head = 0;
        let tail = 0;

        const isNearWhite = (idx: number) => {
          const p = idx * 4;
          return data[p] > 234 && data[p + 1] > 234 && data[p + 2] > 234;
        };

        const enqueue = (x: number, y: number) => {
          if (x < 0 || x >= w || y < 0 || y >= h) return;
          const idx = y * w + x;
          if (visited[idx] || !isNearWhite(idx)) return;
          visited[idx] = 1;
          queue[tail++] = idx;
        };

        for (let x = 0; x < w; x++) {
          enqueue(x, 0);
          enqueue(x, h - 1);
        }
        for (let y = 0; y < h; y++) {
          enqueue(0, y);
          enqueue(w - 1, y);
        }

        while (head < tail) {
          const idx = queue[head++];
          data[idx * 4 + 3] = 0;
          const x = idx % w;
          const y = (idx - x) / w;
          enqueue(x + 1, y);
          enqueue(x - 1, y);
          enqueue(x, y + 1);
          enqueue(x, y - 1);
        }

        wCtx.putImageData(imgData, 0, 0);

        let portX = 0,
          portY = 0,
          portN = 0;
        let nozX = 0,
          nozY = 0,
          nozN = 0;
        const redPts: Array<{ x: number; y: number }> = [];
        const hullPts: Array<{ x: number; y: number }> = [];

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const p = (y * w + x) * 4;
            if (data[p + 3] < 40) continue;
            const r = data[p];
            const g = data[p + 1];
            const b = data[p + 2];

            const maxDiff = Math.max(
              Math.abs(r - g),
              Math.abs(g - b),
              Math.abs(r - b)
            );
            if (maxDiff < 26 && r >= 120 && r <= 220) {
              nozX += x;
              nozY += y;
              nozN++;
              hullPts.push({ x, y });
            } else if (b >= 135 && b - r >= 55 && b - g >= 35) {
              portX += x;
              portY += y;
              portN++;
              hullPts.push({ x, y });
            } else if (r >= 165 && r - g >= 55 && r - b >= 55) {
              redPts.push({ x, y });
              hullPts.push({ x, y });
            } else if (b > 175 && g > 175 && r < 225) {
              hullPts.push({ x, y });
            }
          }
        }

        if (portN > 10 && nozN > 10 && redPts.length > 10) {
          const pCx = portX / portN;
          const pCy = portY / portN;
          const nCx = nozX / nozN;
          const nCy = nozY / nozN;

          const vx = pCx - nCx;
          const vy = pCy - nCy;
          const vLen = Math.hypot(vx, vy) || 1;
          const ux = vx / vLen;
          const uy = vy / vLen;

          let noseSumX = 0,
            noseSumY = 0,
            noseCount = 0;
          for (const pt of redPts) {
            const dx = pt.x - pCx;
            const dy = pt.y - pCy;
            const proj = dx * ux + dy * uy;
            const perp = Math.abs(dx * -uy + dy * ux);
            if (proj > vLen * 0.25 && perp < vLen * 0.85) {
              noseSumX += pt.x;
              noseSumY += pt.y;
              noseCount++;
            }
          }

          if (noseCount > 5) {
            const noseCx = noseSumX / noseCount;
            const noseCy = noseSumY / noseCount;
            axisAngle = Math.atan2(noseCy - nCy, noseCx - nCx);

            const ax = Math.cos(axisAngle);
            const ay = Math.sin(axisAngle);

            let minProj = Infinity;
            let maxProj = -Infinity;
            for (const pt of hullPts) {
              const proj = (pt.x - pCx) * ax + (pt.y - pCy) * ay;
              if (proj < minProj) minProj = proj;
              if (proj > maxProj) maxProj = proj;
            }

            if (maxProj > minProj + 20) {
              hullLen = maxProj - minProj;
              const midProj = (minProj + maxProj) * 0.5;
              anchorX = pCx + ax * midProj;
              anchorY = pCy + ay * midProj;
            }
          }
        }
      } catch {
        // Fallback alignment
      }

      const outW = 220;
      const outH = 140;
      const out = document.createElement('canvas');
      out.width = outW;
      out.height = outH;
      const oCtx = out.getContext('2d');
      if (oCtx) {
        const normScale = 78 / Math.max(24, hullLen);
        oCtx.translate(132, 70);
        oCtx.rotate(-axisAngle);
        oCtx.scale(normScale, normScale);
        oCtx.drawImage(work, -anchorX, -anchorY);
        resolve(out);
      } else {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
  });
}

export function loadNormalizedShipSprites(): Promise<NormalizedShipSprites> {
  if (cachedSprites) return Promise.resolve(cachedSprites);
  if (loadPromise) return loadPromise;

  loadPromise = Promise.all([
    normalizeShipImage(SHIP_IDLE_IMAGE_URL),
    normalizeShipImage(SHIP_THRUST_IMAGE_URL),
  ]).then(([idle, moving]) => {
    cachedSprites = { idle, moving };
    return cachedSprites;
  });

  return loadPromise;
}
