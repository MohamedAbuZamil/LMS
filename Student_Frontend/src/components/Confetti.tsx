"use client";
import { motion } from "framer-motion";
import { useMemo } from "react";

const COLORS = ["#7C3AED", "#A78BFA", "#F59E0B", "#10B981", "#EC4899", "#38BDF8"];

type Piece = {
  x: number;
  y: number;
  size: number;
  rot: number;
  color: string;
  shape: "square" | "circle" | "triangle";
  delay: number;
};

/** Soft static confetti scattered behind the success check icon */
export function Confetti({ count = 22 }: { count?: number }) {
  const pieces: Piece[] = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 6 + Math.random() * 8,
      rot: Math.random() * 360,
      color: COLORS[i % COLORS.length],
      shape: (["square", "circle", "triangle"] as const)[i % 3],
      delay: Math.random() * 0.6,
    }));
  }, [count]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, scale: 0, y: -10 }}
          animate={{
            opacity: [0, 1, 1, 0.85],
            scale: 1,
            y: [0, 4, 0],
            rotate: [p.rot, p.rot + 25, p.rot - 15, p.rot],
          }}
          transition={{
            delay: p.delay,
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.shape !== "triangle" ? p.color : undefined,
            borderRadius: p.shape === "circle" ? "9999px" : p.shape === "square" ? "2px" : 0,
            clipPath: p.shape === "triangle" ? "polygon(50% 0%, 0% 100%, 100% 100%)" : undefined,
            backgroundColor: p.shape === "triangle" ? p.color : undefined,
          }}
        />
      ))}
    </div>
  );
}
