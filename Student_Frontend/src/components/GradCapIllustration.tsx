"use client";
import { motion } from "framer-motion";

/**
 * Graduation cap sitting on a stack of books, with a small plant.
 * Matches the purple-themed signup hero illustration in the mockup.
 */
export function GradCapIllustration() {
  return (
    <svg
      viewBox="0 0 520 420"
      className="w-full h-auto"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="cap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#5B21B6" />
        </linearGradient>
        <linearGradient id="capTop" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>
        <linearGradient id="bookA" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#5B21B6" />
        </linearGradient>
        <linearGradient id="bookB" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id="bookC" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#C4B5FD" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
        <radialGradient id="ground" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#DDD6FE" />
          <stop offset="100%" stopColor="#DDD6FE00" />
        </radialGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx="260" cy="370" rx="220" ry="22" fill="url(#ground)" />

      {/* plant pot left */}
      <motion.g
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <g transform="translate(50,260)">
          <rect x="0" y="60" width="60" height="55" rx="8" fill="#F1F5F9" />
          <rect x="0" y="60" width="60" height="12" fill="#E2E8F0" />
          <path d="M30 60 C18 32, 0 30, 5 4 C24 12, 32 30, 32 60 Z" fill="#22C55E" />
          <path d="M30 60 C44 30, 60 28, 56 4 C40 12, 32 30, 30 60 Z" fill="#16A34A" />
          <path d="M30 60 C30 35, 27 18, 33 -2 C37 18, 35 38, 33 60 Z" fill="#15803D" />
        </g>
      </motion.g>

      {/* book stack (back to front) */}
      <motion.g
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.7, type: "spring" }}
      >
        {/* bottom book */}
        <g transform="translate(150,290)">
          <rect x="0" y="0" width="220" height="34" rx="4" fill="url(#bookA)" />
          <rect x="0" y="0" width="220" height="6" fill="#4C1D95" opacity="0.4" />
          <rect x="10" y="13" width="40" height="3" rx="1.5" fill="#fff" opacity=".5" />
          <rect x="10" y="20" width="60" height="3" rx="1.5" fill="#fff" opacity=".4" />
        </g>
        {/* middle book */}
        <g transform="translate(135,260)">
          <rect x="0" y="0" width="250" height="34" rx="4" fill="url(#bookB)" />
          <rect x="0" y="0" width="250" height="6" fill="#5B21B6" opacity="0.45" />
          <rect x="14" y="13" width="36" height="3" rx="1.5" fill="#fff" opacity=".55" />
          <rect x="14" y="20" width="70" height="3" rx="1.5" fill="#fff" opacity=".45" />
          {/* bookmark */}
          <rect x="220" y="-2" width="10" height="22" fill="#F59E0B" />
          <polygon points="220,20 225,14 230,20" fill="#F59E0B" />
        </g>
        {/* top book */}
        <g transform="translate(165,230)">
          <rect x="0" y="0" width="200" height="32" rx="4" fill="url(#bookC)" />
          <rect x="0" y="0" width="200" height="6" fill="#7C3AED" opacity="0.4" />
          <rect x="14" y="12" width="48" height="3" rx="1.5" fill="#fff" opacity=".7" />
          <rect x="14" y="19" width="80" height="3" rx="1.5" fill="#fff" opacity=".6" />
        </g>
      </motion.g>

      {/* graduation cap */}
      <motion.g
        initial={{ y: -40, rotate: -8, opacity: 0 }}
        animate={{ y: 0, rotate: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8, type: "spring", stiffness: 90 }}
        style={{ transformOrigin: "260px 180px" }}
      >
        {/* cap base (trapezoid) */}
        <g transform="translate(180,160)">
          <path d="M0 40 L160 40 L150 70 L10 70 Z" fill="url(#cap)" />
          <path d="M10 70 L150 70 L148 76 L12 76 Z" fill="#4C1D95" />
        </g>
        {/* cap top (rotated square) */}
        <g transform="translate(260,150)">
          <polygon
            points="0,-30 110,5 0,40 -110,5"
            fill="url(#capTop)"
          />
          <polygon
            points="0,-30 110,5 0,40 -110,5"
            fill="none"
            stroke="#4C1D95"
            strokeOpacity="0.35"
            strokeWidth="2"
          />
          {/* button */}
          <circle cx="0" cy="5" r="6" fill="#FBBF24" />
          <circle cx="0" cy="5" r="3" fill="#F59E0B" />
        </g>
        {/* tassel */}
        <motion.g
          initial={{ rotate: 0 }}
          animate={{ rotate: [0, 6, -6, 0] }}
          transition={{ delay: 1.2, duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "260px 155px" }}
        >
          <path
            d="M260 155 Q300 175 305 215"
            stroke="#FBBF24"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="305" cy="218" r="6" fill="#F59E0B" />
          <path d="M301 222 L301 238 M305 222 L305 240 M309 222 L309 238" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
        </motion.g>
      </motion.g>

      {/* sparkles */}
      <g className="animate-sparkle">
        <circle cx="120" cy="180" r="3" fill="#A78BFA" />
      </g>
      <g className="animate-sparkle" style={{ animationDelay: "0.6s" }}>
        <circle cx="430" cy="200" r="4" fill="#C4B5FD" />
      </g>
      <g className="animate-sparkle" style={{ animationDelay: "1.2s" }}>
        <circle cx="400" cy="120" r="3" fill="#8B5CF6" />
      </g>
    </svg>
  );
}
