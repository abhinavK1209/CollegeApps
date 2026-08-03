"use client";

import { useEffect, useRef, useState } from "react";

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  spin: number;
  color: string;
  size: number;
}

const COLORS = [
  "hsl(243 75% 59%)",
  "hsl(160 84% 33%)",
  "hsl(38 92% 46%)",
  "hsl(199 89% 46%)",
  "hsl(292 84% 61%)",
];

/**
 * Fires once per mount, for about 1.6 seconds. Respects prefers-reduced-motion
 * by not animating at all rather than by animating slower.
 */
export function Confetti({ message }: { message: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces: Piece[] = Array.from({ length: 120 }, () => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 260,
      y: canvas.height * 0.32,
      vx: (Math.random() - 0.5) * 9,
      vy: Math.random() * -11 - 3,
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? "hsl(243 75% 59%)",
      size: 5 + Math.random() * 6,
    }));

    let frame = 0;
    let raf = 0;

    const tick = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      for (const piece of pieces) {
        piece.vy += 0.32;
        piece.x += piece.vx;
        piece.y += piece.vy;
        piece.rotation += piece.spin;

        context.save();
        context.translate(piece.x, piece.y);
        context.rotate(piece.rotation);
        context.fillStyle = piece.color;
        context.globalAlpha = Math.max(0, 1 - frame / 96);
        context.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.6);
        context.restore();
      }
      frame += 1;
      if (frame < 96) raf = requestAnimationFrame(tick);
      else setVisible(false);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!visible) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-50"
      />
      <div
        role="status"
        className="border-border bg-overlay fixed top-6 left-1/2 z-50 -translate-x-1/2 rounded-full border px-4 py-2 text-[13.5px] shadow-[var(--shadow-lg)]"
      >
        {message}
      </div>
    </>
  );
}
