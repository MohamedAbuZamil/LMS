export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width="34"
        height="34"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="40" y2="40">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#6D28D9" />
          </linearGradient>
        </defs>
        <path
          d="M20 3 L36 12 V28 L20 37 L4 28 V12 Z"
          fill="url(#lg)"
        />
        <path
          d="M14 14 V26 H26"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <span className="text-2xl font-extrabold tracking-tight text-brand-700">
        LMS
      </span>
    </div>
  );
}
