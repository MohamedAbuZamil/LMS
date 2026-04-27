"use client";
import type { CourseTheme } from "@/lib/data/teachers";

/**
 * Decorative dark gradient cover for course cards.
 * Each theme uses pure SVG with subject-themed motifs.
 */
export function CourseCover({ theme }: { theme: CourseTheme }) {
  return (
    <svg viewBox="0 0 320 180" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id={`${theme}-bg`} x1="0" y1="0" x2="1" y2="1">
          {gradients[theme].map((stop, i) => (
            <stop key={i} offset={`${(i / (gradients[theme].length - 1)) * 100}%`} stopColor={stop} />
          ))}
        </linearGradient>
        <radialGradient id={`${theme}-glow`} cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="320" height="180" fill={`url(#${theme}-bg)`} />
      <rect width="320" height="180" fill={`url(#${theme}-glow)`} />

      {theme === "constellation" && <Constellation />}
      {theme === "calculus" && <Calculus />}
      {theme === "blackboard" && <Blackboard />}
      {theme === "geometry" && <Geometry />}
      {theme === "dice" && <Dice />}
      {theme === "graph" && <Graph />}
      {theme === "sequence" && <Sequence />}
      {theme === "equation" && <Equation />}
    </svg>
  );
}

const gradients: Record<CourseTheme, string[]> = {
  constellation: ["#0F172A", "#1E1B4B", "#312E81"],
  calculus: ["#1E1B4B", "#4C1D95", "#6D28D9"],
  blackboard: ["#1F2937", "#111827", "#0F172A"],
  geometry: ["#0B1220", "#1E293B", "#0F172A"],
  dice: ["#0F172A", "#1E293B", "#334155"],
  graph: ["#0C1227", "#172554", "#1E3A8A"],
  sequence: ["#1E1B4B", "#0F172A", "#0F172A"],
  equation: ["#2E1065", "#1E1B4B", "#312E81"],
};

const stroke = "#A5B4FC";
const dim = "#6366F1";
const text = "#E0E7FF";

function Constellation() {
  const points = [
    [40, 50],
    [90, 35],
    [140, 70],
    [180, 40],
    [240, 60],
    [275, 100],
    [220, 130],
    [160, 110],
    [100, 130],
    [50, 110],
  ];
  return (
    <g>
      {/* connecting lines */}
      <polyline
        points={points.map((p) => p.join(",")).join(" ")}
        fill="none"
        stroke={stroke}
        strokeOpacity="0.35"
        strokeWidth="1"
      />
      {/* dots */}
      {points.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={i % 3 === 0 ? 3 : 2} fill="#fff" opacity="0.9" />
          {i % 3 === 0 && <circle cx={x} cy={y} r={6} fill="#fff" opacity="0.15" />}
        </g>
      ))}
      {/* tiny formula */}
      <text x="22" y="160" fontFamily="serif" fontSize="14" fill={text} opacity="0.8" fontStyle="italic">
        f(x) = ax² + bx + c
      </text>
    </g>
  );
}

function Calculus() {
  return (
    <g>
      {/* big integral symbol */}
      <text x="20" y="140" fontFamily="serif" fontSize="160" fill="#fff" opacity="0.08" fontStyle="italic">
        ∫
      </text>
      {/* small formula */}
      <text x="60" y="80" fontFamily="serif" fontSize="22" fill={text} opacity="0.85" fontStyle="italic">
        ∫ f(x)·dx
      </text>
      <text x="80" y="115" fontFamily="serif" fontSize="14" fill={text} opacity="0.6" fontStyle="italic">
        = F(x) + C
      </text>
      {/* curve */}
      <path
        d="M 0 150 Q 80 110 160 130 T 320 100"
        fill="none"
        stroke={stroke}
        strokeOpacity="0.5"
        strokeWidth="1.5"
      />
    </g>
  );
}

function Blackboard() {
  return (
    <g>
      {/* desk */}
      <rect x="0" y="155" width="320" height="25" fill="#3B2A1A" opacity="0.6" />
      <rect x="0" y="150" width="320" height="6" fill="#5D3A22" opacity="0.6" />
      {/* equations */}
      <text x="22" y="60" fontFamily="serif" fontSize="34" fill="#fff" opacity="0.92" fontStyle="italic">
        E = mc²
      </text>
      <text x="170" y="55" fontFamily="serif" fontSize="14" fill="#fff" opacity="0.55" fontStyle="italic">
        a² + b² = c²
      </text>
      <text x="170" y="80" fontFamily="serif" fontSize="14" fill="#fff" opacity="0.55" fontStyle="italic">
        sin²θ + cos²θ = 1
      </text>
      <text x="22" y="100" fontFamily="serif" fontSize="14" fill="#fff" opacity="0.55" fontStyle="italic">
        F = ma
      </text>
      <text x="22" y="125" fontFamily="serif" fontSize="14" fill="#fff" opacity="0.45" fontStyle="italic">
        Δx · Δp ≥ ℏ/2
      </text>
      {/* chalk dust */}
      <circle cx="270" cy="120" r="1.5" fill="#fff" opacity="0.3" />
      <circle cx="290" cy="135" r="1" fill="#fff" opacity="0.25" />
    </g>
  );
}

function Geometry() {
  return (
    <g stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.85">
      {/* pyramid */}
      <g transform="translate(60,40)">
        <path d="M 0 80 L 40 0 L 80 80 Z" />
        <path d="M 0 80 L 40 60 L 80 80" />
        <path d="M 40 0 L 40 60" strokeDasharray="3 3" opacity="0.6" />
      </g>
      {/* cube */}
      <g transform="translate(180,30)">
        <rect x="0" y="20" width="70" height="70" />
        <path d="M 0 20 L 20 0 L 90 0 L 70 20" />
        <path d="M 90 0 L 90 70 L 70 90" />
        <path d="M 70 20 L 70 90" />
        <path d="M 0 20 L 20 0 M 20 0 L 20 70 L 0 90" strokeDasharray="3 3" opacity="0.6" />
      </g>
      {/* axis */}
      <line x1="20" y1="160" x2="300" y2="160" opacity="0.3" />
    </g>
  );
}

function Dice() {
  const dot = (cx: number, cy: number) => <circle cx={cx} cy={cy} r="3" fill="#1E293B" />;
  return (
    <g>
      {/* die 1 (5) */}
      <g transform="translate(40,40) rotate(-8)">
        <rect width="70" height="70" rx="10" fill="#fff" opacity="0.92" />
        {dot(15, 15)}
        {dot(55, 15)}
        {dot(35, 35)}
        {dot(15, 55)}
        {dot(55, 55)}
      </g>
      {/* die 2 (3) */}
      <g transform="translate(130,55) rotate(12)">
        <rect width="70" height="70" rx="10" fill="#fff" opacity="0.92" />
        {dot(18, 18)}
        {dot(35, 35)}
        {dot(52, 52)}
      </g>
      {/* die 3 (4) */}
      <g transform="translate(220,35) rotate(-4)">
        <rect width="70" height="70" rx="10" fill="#fff" opacity="0.92" />
        {dot(15, 15)}
        {dot(55, 15)}
        {dot(15, 55)}
        {dot(55, 55)}
      </g>
      <text x="20" y="160" fontFamily="serif" fontSize="13" fill={text} opacity="0.7" fontStyle="italic">
        P(A) = n(A)/n(S)
      </text>
    </g>
  );
}

function Graph() {
  return (
    <g>
      {/* axes */}
      <line x1="40" y1="20" x2="40" y2="160" stroke="#fff" strokeOpacity="0.35" />
      <line x1="40" y1="160" x2="300" y2="160" stroke="#fff" strokeOpacity="0.35" />
      {/* arrows */}
      <path d="M 40 20 L 36 28 M 40 20 L 44 28" stroke="#fff" strokeOpacity="0.5" />
      <path d="M 300 160 L 292 156 M 300 160 L 292 164" stroke="#fff" strokeOpacity="0.5" />
      {/* grid */}
      {[60, 100, 140, 180, 220, 260].map((x) => (
        <line key={x} x1={x} y1="20" x2={x} y2="160" stroke="#fff" strokeOpacity="0.06" />
      ))}
      {/* sine wave */}
      <path
        d="M 40 90 Q 80 30 120 90 T 200 90 T 280 90"
        fill="none"
        stroke={stroke}
        strokeWidth="2.5"
      />
      {/* parabola */}
      <path
        d="M 40 140 Q 170 -20 300 140"
        fill="none"
        stroke="#FBBF24"
        strokeOpacity="0.65"
        strokeWidth="2"
        strokeDasharray="4 4"
      />
      <text x="245" y="50" fontFamily="serif" fontSize="14" fill={text} opacity="0.75" fontStyle="italic">
        f(x)
      </text>
    </g>
  );
}

function Sequence() {
  const xs = [40, 70, 105, 145, 190, 240, 295];
  return (
    <g>
      {xs.map((x, i) => {
        const r = 4 + i * 1.6;
        return (
          <g key={i}>
            <circle cx={x} cy="90" r={r} fill="#fff" opacity={0.25 + i * 0.08} />
            <text
              x={x}
              y={94}
              textAnchor="middle"
              fontFamily="serif"
              fontSize="10"
              fill="#0F172A"
              fontWeight="700"
            >
              {Math.pow(2, i)}
            </text>
          </g>
        );
      })}
      <text x="20" y="150" fontFamily="serif" fontSize="13" fill={text} opacity="0.7" fontStyle="italic">
        a, ar, ar², ar³, …
      </text>
      <text x="200" y="150" fontFamily="serif" fontSize="13" fill={text} opacity="0.6" fontStyle="italic">
        Σ aₙ
      </text>
    </g>
  );
}

function Equation() {
  return (
    <g>
      <text x="22" y="55" fontFamily="serif" fontSize="22" fill="#fff" opacity="0.85" fontStyle="italic">
        dy/dx = ky
      </text>
      <text x="22" y="95" fontFamily="serif" fontSize="16" fill={text} opacity="0.7" fontStyle="italic">
        y = Ce^(kx)
      </text>
      <text x="22" y="125" fontFamily="serif" fontSize="14" fill={text} opacity="0.55" fontStyle="italic">
        ∂²u/∂x² = c²·∂²u/∂t²
      </text>
      {/* small motifs */}
      <text x="220" y="60" fontFamily="serif" fontSize="38" fill="#fff" opacity="0.1" fontStyle="italic">
        ∂
      </text>
      <text x="240" y="140" fontFamily="serif" fontSize="44" fill="#fff" opacity="0.08" fontStyle="italic">
        ∇
      </text>
    </g>
  );
}
