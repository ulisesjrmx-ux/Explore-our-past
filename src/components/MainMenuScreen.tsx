import React, { useEffect, useRef, useState } from 'react';
import { Languages, Rocket, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { Language } from '../types/game';
import { soundEngine } from '../utils/audio';
import { drawCrayonCircle, drawCrayonPaperBackdrop } from '../utils/crayonCanvas';
import { UI_TEXT } from '../utils/i18n';
import { loadNormalizedShipSprites, NormalizedShipSprites } from '../utils/shipSprites';

interface MainMenuScreenProps {
  lang: Language;
  muted: boolean;
  onToggleLanguage: () => void;
  onToggleMute: () => void;
  onLaunchComplete: () => void;
}

interface MenuStar {
  x: number;
  y: number;
  size: number;
  speed: number;
  alpha: number;
  color: string;
  isCross: boolean;
  phase: number;
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

const STAR_COLORS = ['#F8FAFC', '#BAE6FD', '#FEF08A', '#FDE68A', '#CBD5E1'];

export const MainMenuScreen: React.FC<MainMenuScreenProps> = ({
  lang,
  muted,
  onToggleLanguage,
  onToggleMute,
  onLaunchComplete,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const spritesRef = useRef<NormalizedShipSprites>({ idle: null, moving: null });
  const launchingRef = useRef(false);
  const launchStartRef = useRef(0);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onLaunchComplete);
  onCompleteRef.current = onLaunchComplete;

  const [isLaunching, setIsLaunching] = useState(false);
  const t = UI_TEXT[lang];

  useEffect(() => {
    let active = true;
    loadNormalizedShipSprites().then((sprites) => {
      if (active) {
        spritesRef.current = sprites;
      }
    });
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

    const stars: MenuStar[] = Array.from({ length: 135 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: 1.1 + Math.random() * 2.4,
      speed: 0.025 + Math.random() * 0.09,
      alpha: 0.35 + Math.random() * 0.65,
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      isCross: Math.random() < 0.22,
      phase: Math.random() * Math.PI * 2,
    }));

    const particles: ExhaustParticle[] = [];
    let lastTime = performance.now();
    let animId = 0;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      let launchProgress = 0;
      if (launchingRef.current) {
        const launchDur = prefersReducedMotion ? 0.25 : 1.08;
        launchProgress = Math.min(1, (now - launchStartRef.current) / (launchDur * 1000));
        if (launchProgress >= 1 && !completedRef.current) {
          completedRef.current = true;
          onCompleteRef.current();
        }
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Dark wax-crayon sketchbook space backdrop
      ctx.fillStyle = '#060912';
      ctx.fillRect(0, 0, width, height);
      drawCrayonPaperBackdrop(ctx, width, height, '#38BDF8');

      // Soft distant crayon nebula smudges
      const neb1 = ctx.createRadialGradient(
        width * 0.78,
        height * 0.36,
        20,
        width * 0.78,
        height * 0.36,
        Math.max(width, height) * 0.42
      );
      neb1.addColorStop(0, 'rgba(56, 189, 248, 0.10)');
      neb1.addColorStop(0.55, 'rgba(99, 102, 241, 0.05)');
      neb1.addColorStop(1, 'rgba(6, 9, 18, 0)');
      ctx.fillStyle = neb1;
      ctx.fillRect(0, 0, width, height);

      const neb2 = ctx.createRadialGradient(
        width * 0.24,
        height * 0.78,
        15,
        width * 0.24,
        height * 0.78,
        Math.max(width, height) * 0.35
      );
      neb2.addColorStop(0, 'rgba(251, 191, 36, 0.065)');
      neb2.addColorStop(1, 'rgba(6, 9, 18, 0)');
      ctx.fillStyle = neb2;
      ctx.fillRect(0, 0, width, height);

      // Speed multiplier surges forward during ship launch
      const warpFactor = launchingRef.current
        ? 1 + Math.pow(launchProgress, 1.4) * 14
        : 1;

      // Drifting wax-crayon starfield (moves leftward/down-left so ship on right feels flying forward)
      const dirAngle = -0.18; // ship heads gently upward-right (+X, -Y)
      const moveCos = Math.cos(dirAngle);
      const moveSin = Math.sin(dirAngle);

      stars.forEach((star) => {
        star.x -= star.speed * warpFactor * dt * moveCos;
        star.y -= star.speed * warpFactor * dt * moveSin;
        if (star.x < -0.05) star.x += 1.1;
        if (star.x > 1.05) star.x -= 1.1;
        if (star.y < -0.05) star.y += 1.1;
        if (star.y > 1.05) star.y -= 1.1;

        const sx = star.x * width;
        const sy = star.y * height;
        const twinkle = 0.7 + 0.3 * Math.sin(now * 0.003 + star.phase);
        const alpha = star.alpha * twinkle;

        ctx.save();
        ctx.globalAlpha = alpha;
        if (launchingRef.current && launchProgress > 0.08) {
          const streak = 6 + launchProgress * 58 * (star.speed * 10);
          ctx.strokeStyle = star.color;
          ctx.lineWidth = star.size * 0.85;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx - moveCos * streak, sy - moveSin * streak);
          ctx.stroke();
        } else if (star.isCross) {
          ctx.strokeStyle = star.color;
          ctx.lineWidth = 1.4;
          ctx.lineCap = 'round';
          const r = star.size * 1.9;
          ctx.beginPath();
          ctx.moveTo(sx - r, sy);
          ctx.lineTo(sx + r, sy);
          ctx.moveTo(sx, sy - r);
          ctx.lineTo(sx, sy + r);
          ctx.stroke();
        } else {
          ctx.fillStyle = star.color;
          ctx.beginPath();
          ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // Distant sketchy crayon Moon & Mars doodles in cosmic background
      const moonBgX = width * 0.62;
      const moonBgY = height * 0.18;
      ctx.save();
      ctx.globalAlpha = Math.max(0.15, 0.45 * (1 - launchProgress * 0.8));
      drawCrayonCircle(ctx, moonBgX, moonBgY, 22, '#CBD5E1', 1.8, 3.2, 1.3);
      drawCrayonCircle(ctx, moonBgX - 6, moonBgY - 5, 5, '#94A3B8', 1.2, 1.7, 0.8);
      drawCrayonCircle(ctx, moonBgX + 7, moonBgY + 6, 3.5, '#94A3B8', 1.2, 2.1, 0.8);
      ctx.restore();

      const marsBgX = width * 0.88;
      const marsBgY = height * 0.80;
      ctx.save();
      ctx.globalAlpha = Math.max(0.15, 0.42 * (1 - launchProgress * 0.8));
      drawCrayonCircle(ctx, marsBgX, marsBgY, 16, '#FB923C', 1.8, 5.1, 1.2);
      drawCrayonCircle(ctx, marsBgX + 3, marsBgY - 3, 4, '#EA580C', 1.2, 4.4, 0.7);
      ctx.restore();

      // Ship position on the RIGHT side of screen (mobile places it cleanly in upper-right/center-right)
      const isNarrow = width < 768;
      const baseShipX = isNarrow ? width * 0.72 : width * 0.73;
      const baseShipY = isNarrow ? height * 0.24 : height * 0.50;
      const hoverX = Math.sin(now * 0.0018) * 10;
      const hoverY = Math.sin(now * 0.0026) * 13;
      const baseAngle = -0.18 + Math.sin(now * 0.002) * 0.04;

      let shipX = baseShipX + hoverX;
      let shipY = baseShipY + hoverY;
      let shipAngle = baseAngle;
      let shipScale = isNarrow ? 1.45 : Math.min(2.35, Math.max(1.65, width / 560));

      if (launchingRef.current) {
        if (launchProgress < 0.16) {
          // Anticipation pull-back before rocketing forward
          const pull = launchProgress / 0.16;
          const easedPull = Math.sin(pull * Math.PI * 0.5);
          shipX = baseShipX - moveCos * 26 * easedPull + (Math.random() - 0.5) * 3;
          shipY = baseShipY - moveSin * 26 * easedPull + (Math.random() - 0.5) * 3;
          shipAngle = -0.18;
        } else {
          // Rocket forward off-screen along heading!
          const fly = (launchProgress - 0.16) / 0.84;
          const accel = fly * fly * fly;
          const travelDist = accel * (width * 0.95 + 360);
          shipX = baseShipX - moveCos * 26 + moveCos * travelDist;
          shipY = baseShipY - moveSin * 26 + moveSin * travelDist;
          shipAngle = -0.18;
          shipScale = shipScale * (1 - fly * 0.16);
        }
      }

      // Emit continuous crayon exhaust particles behind the ship as it travels
      const exhaustSpawnChance = launchingRef.current ? 1 : 0.65;
      if (Math.random() < exhaustSpawnChance) {
        const count = launchingRef.current ? 3 : 1;
        for (let i = 0; i < count; i++) {
          const backDist = 42 * shipScale;
          const bx = shipX - Math.cos(shipAngle) * backDist + (Math.random() - 0.5) * 10;
          const by = shipY - Math.sin(shipAngle) * backDist + (Math.random() - 0.5) * 10;
          const speed = (launchingRef.current ? 340 : 140) + Math.random() * 120;
          particles.push({
            x: bx,
            y: by,
            vx: -Math.cos(shipAngle) * speed + (Math.random() - 0.5) * 45,
            vy: -Math.sin(shipAngle) * speed + (Math.random() - 0.5) * 45,
            size: (launchingRef.current ? 6.5 : 4.2) + Math.random() * 4,
            life: launchingRef.current ? 0.55 : 0.45,
            maxLife: launchingRef.current ? 0.55 : 0.45,
            color:
              Math.random() < 0.35
                ? '#38BDF8'
                : Math.random() < 0.65
                ? '#FBBF24'
                : '#FB7185',
          });
        }
      }

      // Update & draw crayon exhaust particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= dt;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        const a = Math.max(0, p.life / p.maxLife);
        ctx.save();
        ctx.globalAlpha = a * 0.85;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (0.45 + a * 0.65), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Launch shockwave ring when user clicks Iniciar
      if (launchingRef.current && launchProgress < 0.42) {
        const ringP = launchProgress / 0.42;
        ctx.save();
        ctx.globalAlpha = (1 - ringP) * 0.75;
        ctx.strokeStyle = '#67E8F9';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(baseShipX, baseShipY, 32 + ringP * 145, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Draw the cruising/launching Spaceship on the right!
      ctx.save();
      ctx.translate(shipX, shipY);
      ctx.rotate(shipAngle);
      ctx.scale(shipScale, shipScale);

      // Glowing crayon thruster aura behind nozzle
      const flicker = 0.85 + Math.random() * 0.35;
      const auraLen = (launchingRef.current ? 68 : 34) * flicker;
      const halo = ctx.createRadialGradient(-42, 0, 4, -46, 0, auraLen);
      halo.addColorStop(0, 'rgba(253, 224, 71, 0.85)');
      halo.addColorStop(0.45, 'rgba(56, 189, 248, 0.45)');
      halo.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(-44, 0, auraLen, 0, Math.PI * 2);
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
        // Quick hand-drawn fallback rocket if image hasn't finished decoding
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
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, []);

  const handleStartClick = () => {
    if (isLaunching) return;
    soundEngine.ensureMusicPlaying();
    soundEngine.playLaunchSequence();
    launchingRef.current = true;
    launchStartRef.current = performance.now();
    completedRef.current = false;
    setIsLaunching(true);
  };

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-screen overflow-hidden bg-[#060912] select-none flex items-center"
    >
      {/* Full-screen Animated Space Canvas (Ship cruising on the right) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      />

      {/* Top-Right Compact Language & Audio Crayon Controls */}
      <div
        className={`absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center gap-2.5 transition-opacity duration-300 ${
          isLaunching ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <button
          type="button"
          onClick={onToggleLanguage}
          className="crayon-btn crayon-btn-dark inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-bold whitespace-nowrap cursor-pointer"
          aria-label={t.langSwitchTitle}
          title={t.langSwitchTitle}
        >
          <Languages className="w-4 h-4" />
          <span>{t.langSwitchLabel}</span>
        </button>

        <button
          type="button"
          onClick={onToggleMute}
          className="crayon-btn crayon-btn-dark inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-bold whitespace-nowrap cursor-pointer"
          aria-label={muted ? t.unmuteAria : t.muteAria}
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span className="hidden sm:inline">{muted ? t.muted : t.audio}</span>
        </button>
      </div>

      {/* Left-Side Title & Start CTA Panel */}
      <div
        className={`relative z-10 w-full max-w-xl px-6 sm:px-10 lg:pl-16 xl:pl-24 mt-28 md:mt-0 transition-all duration-500 ${
          isLaunching
            ? 'opacity-0 -translate-x-10 pointer-events-none'
            : 'opacity-100 translate-x-0'
        }`}
      >
        <div className="crayon-box crayon-box-moon p-6 sm:p-8 flex flex-col gap-5 shadow-2xl">
          <div className="inline-flex items-center gap-2 text-sm sm:text-base font-crayon font-bold text-cyan-300">
            <Sparkles className="w-4 h-4 shrink-0 text-amber-300" />
            <span>{t.titleTagline}</span>
          </div>

          <div>
            <h1 className="font-crayon text-5xl sm:text-6xl font-bold text-slate-50 leading-[0.98] tracking-wide drop-shadow-[3px_3px_0_rgba(3,5,10,0.9)]">
              {t.brandTitle}
            </h1>
            {/* Hand-drawn wax crayon underline */}
            <svg
              viewBox="0 0 280 18"
              className="w-56 sm:w-64 h-4 mt-2 text-amber-400"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 11 C 58 4, 130 15, 205 7 C 235 4, 260 9, 276 6"
                stroke="currentColor"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeDasharray="1 0"
              />
              <path
                d="M14 15 C 88 9, 170 16, 258 11"
                stroke="#38BDF8"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.85"
              />
            </svg>
          </div>

          <p className="font-crayon text-lg sm:text-xl text-slate-200 leading-snug">
            {t.titleSubtitle}
          </p>

          <div className="pt-1 flex items-center gap-3">
            <button
              type="button"
              onClick={handleStartClick}
              disabled={isLaunching}
              className="crayon-btn crayon-btn-amber inline-flex items-center justify-center gap-3 px-9 py-3.5 text-2xl font-bold whitespace-nowrap cursor-pointer"
            >
              <Rocket className="w-6 h-6 shrink-0" />
              <span>{isLaunching ? t.titleLaunchingBtn : t.titleStartBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
