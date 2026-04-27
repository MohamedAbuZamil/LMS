"use client";
import { motion } from "framer-motion";

/**
 * Decorative shield + key illustration for the login page.
 * Purple themed, with floating key and animated sparks.
 */
export function LoginIllustration() {
  return (
    <svg
      viewBox="0 0 520 420"
      className="w-full h-auto"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="sh" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#5B21B6" />
        </linearGradient>
        <linearGradient id="shFace" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C4B5FD" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="key" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <radialGradient id="ground2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#DDD6FE" />
          <stop offset="100%" stopColor="#DDD6FE00" />
        </radialGradient>
      </defs>

      {/* ground */}
      <ellipse cx="260" cy="370" rx="190" ry="20" fill="url(#ground2)" />

      {/* shield */}
      <motion.g
        initial={{ y: 30, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, type: "spring", stiffness: 100 }}
      >
        <g transform="translate(260,210)">
          {/* outer shield */}
          <path
            d="M0 -130 L110 -90 L100 30 C100 80 60 120 0 150 C-60 120 -100 80 -100 30 L-110 -90 Z"
            fill="url(#sh)"
          />
          {/* inner face */}
          <path
            d="M0 -110 L92 -75 L83 25 C83 65 50 95 0 120 C-50 95 -83 65 -83 25 L-92 -75 Z"
            fill="url(#shFace)"
          />
          {/* lock body */}
          <rect x="-32" y="-15" width="64" height="56" rx="8" fill="#fff" />
          {/* shackle */}
          <path
            d="M-20 -15 L-20 -35 A20 20 0 0 1 20 -35 L20 -15"
            fill="none"
            stroke="#fff"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* keyhole */}
          <circle cx="0" cy="6" r="6" fill="#5B21B6" />
          <rect x="-3" y="6" width="6" height="14" rx="2" fill="#5B21B6" />
        </g>
      </motion.g>

      {/* floating key */}
      <motion.g
        initial={{ opacity: 0, x: 60, rotate: -30 }}
        animate={{ opacity: 1, x: 0, rotate: 0 }}
        transition={{ delay: 0.5, duration: 0.7, type: "spring" }}
      >
        <motion.g
          animate={{ y: [0, -10, 0], rotate: [-8, 4, -8] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "100px 200px" }}
        >
          <g transform="translate(60,180)">
            {/* head */}
            <circle cx="20" cy="20" r="22" fill="url(#key)" />
            <circle cx="20" cy="20" r="10" fill="#fff" />
            {/* shaft */}
            <rect x="40" y="14" width="70" height="12" rx="3" fill="url(#key)" />
            {/* teeth */}
            <rect x="92" y="26" width="6" height="10" fill="url(#key)" />
            <rect x="102" y="26" width="6" height="14" fill="url(#key)" />
          </g>
        </motion.g>
      </motion.g>

      {/* sparkles */}
      <g className="animate-sparkle">
        <circle cx="120" cy="120" r="4" fill="#A78BFA" />
      </g>
      <g className="animate-sparkle" style={{ animationDelay: "0.7s" }}>
        <circle cx="430" cy="160" r="5" fill="#FBBF24" />
      </g>
      <g className="animate-sparkle" style={{ animationDelay: "1.4s" }}>
        <circle cx="400" cy="290" r="3" fill="#8B5CF6" />
      </g>
      <g className="animate-sparkle" style={{ animationDelay: "0.3s" }}>
        <circle cx="90" cy="280" r="3" fill="#EC4899" />
      </g>
    </svg>
  );
}
