import React, { useEffect, useRef, useState } from 'react';
import { PLANETS } from '../data/planets';
import { Language } from '../types/game';
import { drawCrayonCircle, drawCrayonPaperBackdrop } from '../utils/crayonCanvas';
import { UI_TEXT } from '../utils/i18n';
import { loadNormalizedShipSprites, NormalizedShipSprites } from '../utils/shipSprites';

interface EarthReturnTransitionProps {
  lang: Language;
  onComplete: () => void;
}

interface StarParticle {
  x: number;
  y: number;
  size: number;
  speed: number;
  alpha: number;
  color: string;
}

interface ExhaustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
}

const STAR_COLORS = ['#F8FAFC', '#BAE6FD', '#FEF08A', '#FDE68A', '#A7F3D0'];

function drawCrayonEarth(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  now: number
) {
  ctx.save();

  // Outer crayon atmosphere halo
  const halo = ctx.createRadialGradient(cx, cy, radius * 0.88, cx, cy, radius * 1.48);
  halo.addColorStop(0, 'rgba(56, 189, 248, 0.36)');
  halo.addColorStop(0.6, 'rgba(34, 211, 238, 0.14)');
  halo.addColorStop(1, 'rgba(14, 165, 233, 0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.48, 0, Math.PI * 2);
  ctx.fill();

  // Clip inside Earth sphere
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();

  // Ocean wax base gradient
  const oceanGrad = ctx.createRadialGradient(
    cx - radius * 0.28,
    cy - radius * 0.28,
    radius * 0.1,
    cx,
    cy,
    radius
  );
  oceanGrad.addColorStop(0, '#38BDF8');
  oceanGrad.addColorStop(0.55, '#0284C7');
  oceanGrad.addColorStop(1, '#0C4A6E');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

  // Subtle slow continent drift
  const drift = Math.sin(now * 0.0005) * radius * 0.06;

  // Wax-crayon green continents (Americas / Africa-Eurasia style sketchy shapes)
  ctx.fillStyle = '#34D399';
  ctx.strokeStyle = '#065F46';
  ctx.lineWidth = Math.max(1.5, radius * 0.028);
  ctx.lineJoin = 'round';

  // Left-upper continent
  ctx.beginPath();
  ctx.ellipse(
    cx - radius * 0.32 + drift,
    cy - radius * 0.24,
    radius * 0.28,
    radius * 0.2,
    -0.35,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.stroke();

  // Left-lower continent
  ctx.beginPath();
  ctx.ellipse(
    cx - radius * 0.18 + drift,
    cy + radius * 0.24,
    radius * 0.18,
    radius * 0.26,
    0.25,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.stroke();

  // Right continent
  ctx.beginPath();
  ctx.ellipse(
    cx + radius * 0.36 + drift,
    cy - radius * 0.04,
    radius * 0.25,
    radius * 0.3,
    0.18,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.stroke();

  // Polar snow cap
  ctx.fillStyle = 'rgba(248, 250, 252, 0.88)';
  ctx.beginPath();
  ctx.ellipse(cx, cy - radius * 0.86, radius * 0.48, radius * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Crayon swirling white cloud wisps
  ctx.strokeStyle = 'rgba(248, 250, 252, 0.72)';
  ctx.lineWidth = Math.max(2, radius * 0.042);
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(cx - radius * 0.56, cy - radius * 0.42);
  ctx.quadraticCurveTo(cx - radius * 0.12, cy - radius * 0.52, cx + radius * 0.24, cy - radius * 0.38);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - radius * 0.38, cy + radius * 0.06);
  ctx.quadraticCurveTo(cx + radius * 0.04, cy - radius * 0.02, cx + radius * 0.52, cy + radius * 0.12);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - radius * 0.44, cy + radius * 0.48);
  ctx.quadraticCurveTo(cx - radius * 0.05, cy + radius * 0.56, cx + radius * 0.34, cy + radius * 0.44);
  ctx.stroke();

  ctx.restore();

  // Outer crayon outline ring
  drawCrayonCircle(ctx, cx, cy, radius, '#BAE6FD', Math.max(2, radius * 0.04), 4.2, 1.3);

  ctx.restore();
}

export const EarthReturnTransition: React.FC<EarthReturnTransitionProps> = ({
  lang,
  onComplete,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const spritesRef = useRef<NormalizedShipSprites>({ idle: null, moving: null });
  const marsSpriteRef = useRef<HTMLCanvasElement | null>(null);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const t = UI_TEXT[lang];
  const [progress, setProgress] = useState(0);
  const [stageIdx, setStageIdx] = useState(0);

  useEffect(() => {
    let active = true;
    loadNormalizedShipSprites().then((sprites) => {
      if (active) spritesRef.current = sprites;
    });

    // Load & strip black exterior background on Mars crayon artwork for departure view
    const marsUrl = PLANETS.mars.surfaceImageUrl;
    if (marsUrl) {
      const img = new Image();
      img.src = marsUrl;
      img.onload = () => {
        if (!active) return;
        const size = 280;
        const off = document.createElement('canvas');
        off.width = size;
        off.height = size;
        const oCtx = off.getContext('2d');
        if (!oCtx) return;
        oCtx.drawImage(img, 0, 0, size, size);
        try {
          const imgData = oCtx.getImageData(0, 0, size, size);
          const data = imgData.data;
          const half = size / 2;
          const maxR = half * 0.92;
          for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
              const dist = Math.hypot(x - half, y - half);
              const p = (y * size + x) * 4;
              if (dist > maxR) {
                data[p + 3] = 0;
              } else if (dist > maxR - 4) {
                data[p + 3] = Math.round(data[p + 3] * ((maxR - dist) / 4));
              }
            }
          }
          oCtx.putImageData(imgData, 0, 0);
        } catch {
          // ignore
        }
        marsSpriteRef.current = off;
      };
    }

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = container.clientWidth;
    let height = container.clientHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const updateSize = () => {
      width = Math.max(320, container.clientWidth);
      height = Math.max(320, container.clientHeight);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };
    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(container);

    const stars: StarParticle[] = Array.from({ length: 130 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: 1.2 + Math.random() * 2.4,
      speed: 0.04 + Math.random() * 0.14,
      alpha: 0.35 + Math.random() * 0.65,
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
    }));
    const particles: ExhaustParticle[] = [];

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const durationSec = prefersReducedMotion ? 0.65 : 3.7;

    const startTime = performance.now();
    let lastTime = startTime;
    let animId = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      const elapsed = (now - startTime) / 1000;
      const p = Math.min(1, elapsed / durationSec);

      setProgress(p);
      setStageIdx(p < 0.28 ? 0 : p < 0.72 ? 1 : 2);

      ctx.save();
      ctx.scale(dpr, dpr);

      // Deep sketchbook space canvas
      ctx.fillStyle = '#050811';
      ctx.fillRect(0, 0, width, height);
      drawCrayonPaperBackdrop(ctx, width, height, '#38BDF8');

      // Diagonal warp direction (rocket flies from lower-left Mars toward upper-right Earth)
      const warpIntensity =
        p < 0.18
          ? p / 0.18
          : p < 0.76
          ? 1
          : Math.max(0.15, 1 - (p - 0.76) / 0.24);
      const flightAngle = -Math.PI * 0.22; // upward-right
      const dirX = Math.cos(flightAngle);
      const dirY = Math.sin(flightAngle);

      // Streaking stars opposite to rocket travel
      stars.forEach((star) => {
        star.x -= dirX * star.speed * (1 + warpIntensity * 3.8) * dt;
        star.y -= dirY * star.speed * (1 + warpIntensity * 3.8) * dt;
        if (star.x < -0.05) star.x += 1.1;
        if (star.x > 1.05) star.x -= 1.1;
        if (star.y < -0.05) star.y += 1.1;
        if (star.y > 1.05) star.y -= 1.1;

        const sx = star.x * width;
        const sy = star.y * height;
        const streak = 3 + warpIntensity * 42 * (star.speed * 8);

        ctx.save();
        ctx.globalAlpha = star.alpha;
        ctx.strokeStyle = star.color;
        ctx.lineWidth = star.size;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx - dirX * streak, sy - dirY * streak);
        ctx.stroke();
        ctx.restore();
      });

      // Mars receding in lower-left (0.0 -> 0.55)
      if (p < 0.55) {
        const recede = p / 0.55;
        const eased = recede * recede;
        const marsRadius = Math.max(28, Math.min(width, height) * 0.24 * (1 - eased * 0.82));
        const marsX = width * 0.16 - eased * width * 0.18;
        const marsY = height * 0.76 + eased * height * 0.22;

        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - recede * 1.1);
        ctx.shadowColor = '#FB923C';
        ctx.shadowBlur = 24;
        if (marsSpriteRef.current) {
          ctx.drawImage(
            marsSpriteRef.current,
            marsX - marsRadius,
            marsY - marsRadius,
            marsRadius * 2,
            marsRadius * 2
          );
        } else {
          drawCrayonCircle(ctx, marsX, marsY, marsRadius, '#FB923C', 3, 2.5, 1.4);
        }
        ctx.restore();
      }

      // Earth emerging and growing ahead in upper-right / center-right (0.18 -> 1.0)
      if (p > 0.18) {
        const approach = (p - 0.18) / 0.82;
        const eased = approach * approach * (3 - 2 * approach);
        const minDim = Math.min(width, height);
        const earthRadius = 20 + eased * (minDim * 0.26);
        const earthX = width * 0.82 - eased * (width * 0.14);
        const earthY = height * 0.22 + eased * (height * 0.16);

        drawCrayonEarth(ctx, earthX, earthY, earthRadius, now);
      }

      // Rocket trajectory from lower-left (Mars) smoothly arcing toward Earth!
      const smoothP = p * p * (3 - 2 * p);
      const startX = width * 0.22;
      const startY = height * 0.70;
      const endX = width * 0.64;
      const endY = height * 0.40;
      const arcLift = Math.sin(smoothP * Math.PI) * (height * 0.08);
      const shake = p < 0.2 ? (Math.random() - 0.5) * 3.5 : 0;

      const shipX = startX + (endX - startX) * smoothP + shake;
      const shipY = startY + (endY - startY) * smoothP - arcLift + shake;
      const shipScale = (width < 640 ? 1.15 : 1.55) * (1 - smoothP * 0.34);

      // Emit fiery crayon exhaust particles behind rocket
      for (let i = 0; i < 2; i++) {
        const backDist = 44 * shipScale;
        particles.push({
          x: shipX - dirX * backDist + (Math.random() - 0.5) * 9,
          y: shipY - dirY * backDist + (Math.random() - 0.5) * 9,
          vx: -dirX * (220 + Math.random() * 110) + (Math.random() - 0.5) * 40,
          vy: -dirY * (220 + Math.random() * 110) + (Math.random() - 0.5) * 40,
          size: 4.5 + Math.random() * 4.5,
          life: 0.45,
          maxLife: 0.45,
          color:
            Math.random() < 0.33
              ? '#38BDF8'
              : Math.random() < 0.66
              ? '#FBBF24'
              : '#FB7185',
        });
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        pt.life -= dt;
        if (pt.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        const a = Math.max(0, pt.life / pt.maxLife);
        ctx.save();
        ctx.globalAlpha = a * 0.85;
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size * (0.45 + a * 0.65), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw Rocket Sprite
      ctx.save();
      ctx.translate(shipX, shipY);
      ctx.rotate(flightAngle);
      ctx.scale(shipScale, shipScale);

      const flicker = 0.85 + Math.random() * 0.35;
      const halo = ctx.createRadialGradient(-44, 0, 4, -48, 0, 46 * flicker);
      halo.addColorStop(0, 'rgba(253, 224, 71, 0.9)');
      halo.addColorStop(0.5, 'rgba(56, 189, 248, 0.45)');
      halo.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(-46, 0, 46 * flicker, 0, Math.PI * 2);
      ctx.fill();

      const activeSprite = spritesRef.current.moving ?? spritesRef.current.idle;
      if (activeSprite) {
        const drawScale = 0.84;
        ctx.drawImage(
          activeSprite,
          -132 * drawScale,
          -70 * drawScale,
          220 * drawScale,
          140 * drawScale
        );
      } else {
        ctx.fillStyle = '#BAE6FD';
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(28, 0);
        ctx.lineTo(-18, -14);
        ctx.lineTo(-22, 0);
        ctx.lineTo(-18, 14);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();

      ctx.restore();

      if (p >= 1 && !completedRef.current) {
        completedRef.current = true;
        onCompleteRef.current();
        return;
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-screen overflow-hidden bg-[#050811] select-none"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      />

      {/* Bottom Crayon Telemetry Flight Progress Card */}
      <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center px-4">
        <div className="crayon-box crayon-box-emerald w-full max-w-md p-4 shadow-2xl">
          <div className="flex items-center justify-between text-sm mb-2 gap-3">
            <span className="font-crayon text-lg font-bold text-slate-50">
              {t.earthReturnStages[stageIdx]}
            </span>
            <span className="font-mono-tabular text-xs font-bold text-emerald-300 shrink-0">
              {Math.round(progress * 100)}%
            </span>
          </div>
          <div className="crayon-bar-track w-full h-3">
            <div
              className="crayon-bar-fill bg-gradient-to-r from-amber-400 via-cyan-400 to-emerald-400"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-300 mt-2 font-mono-tabular">
            <span>
              {t.origin}: {t.earthReturnOrigin}
            </span>
            <span>
              {t.destination}: {t.earthReturnDest}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
