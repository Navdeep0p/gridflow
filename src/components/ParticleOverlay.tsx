import { useRef, useEffect } from 'react';
import { Particle } from '../types';

interface ParticleOverlayProps {
  burstTrigger: { x: number; y: number; count: number; timestamp: number } | null;
}

export default function ParticleOverlay({ burstTrigger }: ParticleOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Add new particles when trigger updates
  useEffect(() => {
    if (!burstTrigger) return;

    const { x, y, count } = burstTrigger;
    const colors = [
      '#10B981', // emerald
      '#34D399', // bright emerald
      '#3B82F6', // blue
      '#60A5FA', // light blue
      '#F59E0B', // amber
      '#FCD34D', // gold
      '#EC4899', // pink
      '#A78BFA', // violet
    ];

    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8; // Burst speed
      const maxLife = 40 + Math.floor(Math.random() * 40);
      newParticles.push({
        id: Math.random() + i,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (1 + Math.random() * 3), // upward drift bias
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 2 + Math.random() * 5,
        alpha: 1,
        life: maxLife,
        maxLife,
      });
    }

    particlesRef.current = [...particlesRef.current, ...newParticles];
  }, [burstTrigger]);

  // Canvas drawing and physics loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;

      const activeParticles: Particle[] = [];
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // Gravity acceleration
        p.vx *= 0.98; // Friction / damping
        p.life--;
        p.alpha = Math.max(0, p.life / p.maxLife);

        if (p.life > 0) {
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.shadowBlur = p.size * 2;
          ctx.shadowColor = p.color;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          activeParticles.push(p);
        }
      }
      particlesRef.current = activeParticles;

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', updateSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="particle-overlay-canvas"
      className="absolute inset-0 w-full h-full pointer-events-none z-50"
    />
  );
}
