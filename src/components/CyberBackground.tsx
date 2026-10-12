import { useEffect, useRef } from 'react';

interface CyberBackgroundProps {
  glowEnabled?: boolean;
  theme?: 'crimson' | 'emerald' | 'sunset' | 'silver';
}

export function CyberBackground({ glowEnabled = true, theme = 'crimson' }: CyberBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    // Interactive click shockwave ripple rings
    const ripples: { x: number; y: number; radius: number; maxRadius: number; alpha: number }[] = [];
    const handleClick = (e: MouseEvent) => {
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 6,
        maxRadius: 160,
        alpha: 0.55,
      });
      if (ripples.length > 8) ripples.shift();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('click', handleClick);

    // Theme color palette definitions
    const palette = {
      crimson: {
        primary: 'rgba(244, 63, 94, ',     // rose / crimson
        secondary: 'rgba(251, 146, 60, ',  // blood orange
        accent: 'rgba(245, 158, 11, ',     // electric amber
        deepGlow: 'rgba(225, 29, 72, 0.05)',
        lineAlpha: 0.22,
      },
      emerald: {
        primary: 'rgba(16, 185, 129, ',    // emerald
        secondary: 'rgba(132, 204, 22, ',  // lime
        accent: 'rgba(52, 211, 153, ',     // mint
        deepGlow: 'rgba(16, 185, 129, 0.05)',
        lineAlpha: 0.22,
      },
      sunset: {
        primary: 'rgba(236, 72, 153, ',    // fuchsia
        secondary: 'rgba(249, 115, 22, ',  // orange
        accent: 'rgba(168, 85, 247, ',     // purple
        deepGlow: 'rgba(236, 72, 153, 0.05)',
        lineAlpha: 0.22,
      },
      silver: {
        primary: 'rgba(226, 232, 240, ',   // platinum
        secondary: 'rgba(148, 163, 184, ', // slate
        accent: 'rgba(255, 255, 255, ',    // white
        deepGlow: 'rgba(226, 232, 240, 0.04)',
        lineAlpha: 0.18,
      },
    }[theme] || {
      primary: 'rgba(244, 63, 94, ',
      secondary: 'rgba(251, 146, 60, ',
      accent: 'rgba(245, 158, 11, ',
      deepGlow: 'rgba(225, 29, 72, 0.05)',
      lineAlpha: 0.22,
    };

    // Holographic Quantum Floating Runes / Nodes
    const nodes: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      pulseSpeed: number;
      pulseOffset: number;
      type: 'hex' | 'circle' | 'diamond';
    }[] = [];

    const nodeCount = Math.min(28, Math.floor(width / 45));
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        size: Math.random() * 8 + 4,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseOffset: Math.random() * Math.PI * 2,
        type: i % 3 === 0 ? 'hex' : i % 3 === 1 ? 'diamond' : 'circle',
      });
    }

    let time = 0;

    // Helper to draw a glowing regular polygon (hexagon or diamond)
    const drawPolygon = (x: number, y: number, radius: number, sides: number, rotation: number) => {
      ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const angle = rotation + (i * 2 * Math.PI) / sides;
        const px = x + radius * Math.cos(angle);
        const py = y + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.012;

      // 1. Fluid Multi-Harmonic Wave Ribbons across the horizon
      if (glowEnabled) {
        const waveCount = 3;
        for (let w = 0; w < waveCount; w++) {
          const yBase = height * (0.35 + w * 0.22);
          ctx.beginPath();
          ctx.moveTo(0, height);
          ctx.lineTo(0, yBase);

          const step = 20;
          for (let x = 0; x <= width + step; x += step) {
            // Harmonic wave formula with phase shifts
            const freq1 = 0.0022;
            const freq2 = 0.0051;
            const amp1 = 38 + w * 12;
            const amp2 = 22;

            let y =
              yBase +
              Math.sin(x * freq1 + time * (0.8 + w * 0.2) + w) * amp1 +
              Math.cos(x * freq2 - time * 0.6 + w * 1.5) * amp2;

            // Interactive mouse repulsion wave
            if (mouseRef.current.active) {
              const dx = x - mouseRef.current.x;
              const dy = y - mouseRef.current.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 180) {
                const force = (1 - dist / 180) * 45;
                y += Math.sin(dist * 0.05 - time * 2) * force;
              }
            }

            ctx.lineTo(x, y);
          }

          ctx.lineTo(width, height);
          ctx.closePath();

          // Smooth glowing gradient for each ribbon
          const ribbonGrad = ctx.createLinearGradient(0, yBase - 60, 0, height);
          const colorPrefix = w === 0 ? palette.primary : w === 1 ? palette.secondary : palette.accent;
          ribbonGrad.addColorStop(0, `${colorPrefix}0.045)`);
          ribbonGrad.addColorStop(0.4, `${colorPrefix}0.015)`);
          ribbonGrad.addColorStop(1, 'rgba(8, 6, 11, 0)');

          ctx.fillStyle = ribbonGrad;
          ctx.fill();

          // Stroke the fluid crest with luminous neon line
          ctx.strokeStyle = `${colorPrefix}${palette.lineAlpha - w * 0.04})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }

      // 2. Quantum Holographic Floating Nodes (Hexagons, Diamonds, Nodes)
      nodes.forEach((node, idx) => {
        node.x += node.vx;
        node.y += node.vy;

        // Wrap around screen boundaries
        if (node.x < -30) node.x = width + 30;
        if (node.x > width + 30) node.x = -30;
        if (node.y < -30) node.y = height + 30;
        if (node.y > height + 30) node.y = -30;

        // Mouse gentle magnetic pull
        if (mouseRef.current.active) {
          const dx = mouseRef.current.x - node.x;
          const dy = mouseRef.current.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150 && dist > 10) {
            node.x += (dx / dist) * 0.4;
            node.y += (dy / dist) * 0.4;
          }
        }

        const pulse = Math.sin(time * 2 + node.pulseOffset) * 0.3 + 0.7;
        const alpha = 0.25 * pulse;
        const colorPrefix = idx % 2 === 0 ? palette.primary : palette.accent;

        ctx.strokeStyle = `${colorPrefix}${alpha})`;
        ctx.fillStyle = `${colorPrefix}${alpha * 0.25})`;
        ctx.lineWidth = 1.2;

        if (node.type === 'hex') {
          drawPolygon(node.x, node.y, node.size * pulse, 6, time + idx);
          ctx.stroke();
          ctx.fill();
        } else if (node.type === 'diamond') {
          drawPolygon(node.x, node.y, node.size * 0.9 * pulse, 4, time * 0.8 + idx);
          ctx.stroke();
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.size * 0.5 * pulse, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fill();
        }
      });

      // 3. Connect close nodes with laser circuit traces
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const lineAlpha = (1 - dist / 130) * 0.16;
            ctx.strokeStyle = `${palette.primary}${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // 4. Render interactive click shockwave ripples
      for (let r = ripples.length - 1; r >= 0; r--) {
        const rip = ripples[r];
        rip.radius += 4.5;
        rip.alpha *= 0.93;

        if (rip.alpha < 0.01 || rip.radius >= rip.maxRadius) {
          ripples.splice(r, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `${palette.primary}${rip.alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(rip.x, rip.y, Math.max(0, rip.radius * 0.65), 0, Math.PI * 2);
        ctx.strokeStyle = `${palette.accent}${rip.alpha * 0.55})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animId);
    };
  }, [glowEnabled, theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-85"
    />
  );
}
