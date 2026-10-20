import { useEffect, useRef } from "react";

// ──── Confetti ────────────────────────────────────────────────────────────────

export function Confetti({ onDone }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const pieces = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -20,
      w: 8 + Math.random() * 8,
      h: 5 + Math.random() * 5,
      rot: Math.random() * 360,
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 3,
      vr: (Math.random() - 0.5) * 6,
      color: ["#D4522A", "#C8A86A", "#7EB8D4", "#9B9A97", "#E8E4DE"][
        Math.floor(Math.random() * 5)
      ],
    }));
    let frame;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      pieces.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.vy += 0.05;
        if (p.y < canvas.height + 20) alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (alive) frame = requestAnimationFrame(draw);
      else onDone();
    };
    frame = requestAnimationFrame(draw);
    if (navigator.vibrate) navigator.vibrate([80, 60, 80, 60, 120]);
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <canvas
      ref={ref}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        pointerEvents: "none",
      }}
    />
  );
}
