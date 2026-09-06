import React, { useEffect, useRef } from 'react';

export type BackgroundTheme =
  | 'midnight_teal'
  | 'nordic_navy'
  | 'estate_emerald'
  | 'daylight_slate';

interface AestheticBackgroundProps {
  theme?: BackgroundTheme;
}

interface ResidenceThemeConfig {
  bgGradient: string;
  radialGradient: string;
  orb1: { color: string; r: number };
  orb2: { color: string; r: number };
  orb3: { color: string; r: number };
  primaryColor: string;
  accentGlow: string;
}

const THEME_CONFIGS: Record<BackgroundTheme, ResidenceThemeConfig> = {
  midnight_teal: {
    bgGradient: 'from-[#0F172A] via-[#111827] to-[#0A0F1D]',
    radialGradient: 'radial-gradient(ellipse 80% 55% at 50% -10%, rgba(20, 184, 166, 0.22), transparent)',
    orb1: { color: 'rgba(20, 184, 166, 0.16)', r: 450 },
    orb2: { color: 'rgba(13, 148, 136, 0.14)', r: 380 },
    orb3: { color: 'rgba(56, 189, 248, 0.10)', r: 400 },
    primaryColor: '#14B8A6',
    accentGlow: 'rgba(20, 184, 166, 0.45)',
  },
  nordic_navy: {
    bgGradient: 'from-[#0B132B] via-[#1C2541] to-[#090E1F]',
    radialGradient: 'radial-gradient(ellipse 80% 55% at 50% -10%, rgba(56, 189, 248, 0.20), transparent)',
    orb1: { color: 'rgba(56, 189, 248, 0.15)', r: 440 },
    orb2: { color: 'rgba(99, 102, 241, 0.12)', r: 360 },
    orb3: { color: 'rgba(14, 165, 233, 0.12)', r: 390 },
    primaryColor: '#38BDF8',
    accentGlow: 'rgba(56, 189, 248, 0.45)',
  },
  estate_emerald: {
    bgGradient: 'from-[#022C22] via-[#064E3B] to-[#0A1F18]',
    radialGradient: 'radial-gradient(ellipse 80% 55% at 50% -10%, rgba(16, 185, 129, 0.22), transparent)',
    orb1: { color: 'rgba(16, 185, 129, 0.16)', r: 430 },
    orb2: { color: 'rgba(5, 150, 105, 0.14)', r: 370 },
    orb3: { color: 'rgba(52, 211, 153, 0.10)', r: 390 },
    primaryColor: '#10B981',
    accentGlow: 'rgba(16, 185, 129, 0.45)',
  },
  daylight_slate: {
    bgGradient: 'from-[#0F172A] via-[#1E293B] to-[#0B1220]',
    radialGradient: 'radial-gradient(ellipse 80% 55% at 50% -10%, rgba(45, 212, 191, 0.18), transparent)',
    orb1: { color: 'rgba(45, 212, 191, 0.14)', r: 420 },
    orb2: { color: 'rgba(148, 163, 184, 0.10)', r: 350 },
    orb3: { color: 'rgba(20, 184, 166, 0.12)', r: 380 },
    primaryColor: '#2DD4BF',
    accentGlow: 'rgba(45, 212, 191, 0.40)',
  },
};

export const AestheticBackground: React.FC<AestheticBackgroundProps> = ({
  theme = 'midnight_teal',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cfg = THEME_CONFIGS[theme] || THEME_CONFIGS.midnight_teal;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const orbs = [
      { x: width * 0.25, y: height * 0.2, r: cfg.orb1.r, color: cfg.orb1.color, vx: 0.14, vy: 0.09 },
      { x: width * 0.8, y: height * 0.7, r: cfg.orb2.r, color: cfg.orb2.color, vx: -0.12, vy: -0.14 },
      { x: width * 0.5, y: height * 0.45, r: cfg.orb3.r, color: cfg.orb3.color, vx: 0.08, vy: -0.08 },
    ];

    // Subtle ambient network nodes that drift gently in the background
    const nodes = Array.from({ length: 22 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      size: Math.random() * 1.8 + 1,
      alpha: Math.random() * 0.35 + 0.15,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw glowing ambient architectural light orbs
      orbs.forEach((orb) => {
        orb.x += orb.vx;
        orb.y += orb.vy;
        if (orb.x < -100 || orb.x > width + 100) orb.vx *= -1;
        if (orb.y < -100 || orb.y > height + 100) orb.vy *= -1;

        const radialGradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
        radialGradient.addColorStop(0, orb.color);
        radialGradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = radialGradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Draw subtle network nodes with connections
      nodes.forEach((node, i) => {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0) node.x = width;
        if (node.x > width) node.x = 0;
        if (node.y < 0) node.y = height;
        if (node.y > height) node.y = 0;

        ctx.fillStyle = `rgba(20, 184, 166, ${node.alpha})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fill();

        // Connect nearby nodes with hair-thin lines
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.strokeStyle = `rgba(20, 184, 166, ${(1 - dist / 140) * 0.12})`;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, cfg]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b ${cfg.bgGradient} transition-colors duration-700`} />

      {/* Atmospheric Flare */}
      <div
        className="absolute inset-0 opacity-70 mix-blend-screen pointer-events-none transition-all duration-700"
        style={{
          backgroundImage: cfg.radialGradient,
        }}
      />

      {/* Subtle Precision Architectural Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #14B8A6 1px, transparent 1px), linear-gradient(to bottom, #14B8A6 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Ambient Canvas Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
