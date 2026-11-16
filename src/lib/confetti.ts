type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  w: number;
  h: number;
  color: string;
  life: number;
};

const COLORS = ['#ff4d9a', '#ff73b0', '#c084fc', '#2ee9d0', '#ffd0e6', '#fbbf24', '#ffffff'];

/** Full-viewport confetti burst. No deps — canvas overlay that self-removes. */
export function fireConfetti(options?: { particleCount?: number; durationMs?: number }) {
  if (typeof window === 'undefined') return;

  const particleCount = options?.particleCount ?? 160;
  const durationMs = options?.durationMs ?? 3200;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText =
    'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const resize = () => {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();

  const originX = window.innerWidth / 2;
  const originY = window.innerHeight * 0.35;
  const particles: Particle[] = Array.from({ length: particleCount }, () => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.2;
    const speed = 8 + Math.random() * 14;
    return {
      x: originX + (Math.random() - 0.5) * 80,
      y: originY + (Math.random() - 0.5) * 40,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.4,
      w: 6 + Math.random() * 8,
      h: 4 + Math.random() * 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
      life: 1,
    };
  });

  const start = performance.now();
  let frame = 0;

  const tick = (now: number) => {
    const elapsed = now - start;
    const t = Math.min(1, elapsed / durationMs);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (const p of particles) {
      p.vy += 0.28;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life = 1 - t;

      if (p.life <= 0) continue;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    if (t < 1) {
      frame = requestAnimationFrame(tick);
    } else {
      cleanup();
    }
  };

  const onResize = () => resize();
  const cleanup = () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('resize', onResize);
    canvas.remove();
  };

  window.addEventListener('resize', onResize);
  frame = requestAnimationFrame(tick);
}
