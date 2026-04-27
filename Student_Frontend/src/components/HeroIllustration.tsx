/**
 * Stylized SVG illustration of a person sitting on a beanbag with a laptop.
 * Pure SVG so no external assets are required.
 */
export function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 520 520"
      className="w-full h-auto"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="bag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id="hood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>
        <linearGradient id="laptop" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id="screen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <radialGradient id="ground" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#EDE9FE" />
          <stop offset="100%" stopColor="#EDE9FE00" />
        </radialGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx="260" cy="470" rx="220" ry="28" fill="url(#ground)" />

      {/* plant pot left */}
      <g transform="translate(40,330)">
        <rect x="0" y="60" width="70" height="60" rx="10" fill="#F1F5F9" />
        <rect x="0" y="60" width="70" height="14" fill="#E2E8F0" />
        <path d="M35 60 C20 30, 0 30, 5 0 C25 10, 35 30, 35 60 Z" fill="#22C55E" />
        <path d="M35 60 C50 30, 70 30, 65 5 C45 15, 35 35, 35 60 Z" fill="#16A34A" />
        <path d="M35 60 C35 35, 32 15, 38 -5 C42 15, 40 35, 38 60 Z" fill="#15803D" />
      </g>

      {/* beanbag */}
      <path
        d="M120 320 C120 240, 200 200, 280 210 C380 220, 430 280, 430 360 C430 430, 360 460, 270 460 C170 460, 120 410, 120 360 Z"
        fill="url(#bag)"
      />
      <path
        d="M150 360 C170 410, 240 440, 310 435"
        stroke="#6D28D9"
        strokeWidth="3"
        strokeLinecap="round"
        opacity=".5"
        fill="none"
      />

      {/* legs / pants */}
      <path d="M225 360 L210 460 L260 460 L270 380 Z" fill="#1E293B" />
      <path d="M285 360 L320 460 L370 455 L335 370 Z" fill="#1E293B" />

      {/* shoes */}
      <ellipse cx="225" cy="465" rx="28" ry="12" fill="#F8FAFC" />
      <ellipse cx="225" cy="465" rx="28" ry="12" fill="none" stroke="#CBD5E1" strokeWidth="2" />
      <ellipse cx="345" cy="462" rx="30" ry="12" fill="#F8FAFC" />
      <ellipse cx="345" cy="462" rx="30" ry="12" fill="none" stroke="#CBD5E1" strokeWidth="2" />

      {/* body / hoodie */}
      <path
        d="M200 250 C200 210, 240 190, 280 192 C330 195, 360 220, 360 270 L370 380 L210 380 Z"
        fill="url(#hood)"
      />
      {/* hoodie strings */}
      <path d="M275 235 L272 270" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <path d="M295 235 L298 270" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      {/* pocket */}
      <path d="M240 320 L330 320 L340 360 L230 360 Z" fill="#5B21B6" opacity=".6" />

      {/* arms */}
      <path d="M210 280 C190 310, 195 350, 230 360 L280 350 L260 305 Z" fill="url(#hood)" />
      <path d="M360 270 C385 295, 385 345, 350 360 L300 350 L320 300 Z" fill="url(#hood)" />

      {/* laptop on lap */}
      <g transform="translate(220,330) rotate(-6)">
        <rect x="0" y="20" width="170" height="14" rx="3" fill="#0F172A" />
        <rect x="10" y="-60" width="150" height="84" rx="6" fill="url(#laptop)" />
        <rect x="16" y="-54" width="138" height="72" rx="3" fill="url(#screen)" />
        <rect x="24" y="-46" width="60" height="6" rx="3" fill="#fff" opacity=".8" />
        <rect x="24" y="-34" width="100" height="4" rx="2" fill="#fff" opacity=".5" />
        <rect x="24" y="-26" width="80" height="4" rx="2" fill="#fff" opacity=".5" />
        <rect x="24" y="-18" width="40" height="4" rx="2" fill="#fff" opacity=".5" />
      </g>

      {/* head */}
      <g>
        {/* hood back */}
        <path d="M225 180 C225 130, 335 130, 340 180 L340 215 L225 215 Z" fill="#6D28D9" />
        {/* face */}
        <ellipse cx="285" cy="180" rx="48" ry="54" fill="#FCD9B6" />
        {/* hair / hood top */}
        <path
          d="M232 165 C235 120, 340 115, 345 165 C345 145, 320 130, 285 130 C250 130, 232 145, 232 165 Z"
          fill="#1E293B"
        />
        {/* ears */}
        <ellipse cx="237" cy="185" rx="6" ry="9" fill="#F4C091" />
        {/* eyes */}
        <circle cx="270" cy="180" r="3.5" fill="#0F172A" />
        <circle cx="302" cy="180" r="3.5" fill="#0F172A" />
        {/* eyebrows */}
        <path d="M262 168 L278 170" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M295 170 L311 168" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
        {/* smile */}
        <path d="M275 200 Q286 210 298 200" stroke="#0F172A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </g>

      {/* small leaves bottom */}
      <g transform="translate(380,420)">
        <path d="M0 30 C-10 10, 10 -5, 25 5 C20 25, 5 35, 0 30 Z" fill="#22C55E" />
        <path d="M20 30 C15 15, 35 5, 45 20 C40 35, 25 38, 20 30 Z" fill="#16A34A" />
      </g>
    </svg>
  );
}
