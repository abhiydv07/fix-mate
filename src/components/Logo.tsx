interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export function Logo({ size = 36, className = "", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="logo-grad-dark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <filter id="logo-shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#2563eb" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Background — rounded square with gradient */}
        <rect
          x="4"
          y="4"
          width="92"
          height="92"
          rx="22"
          fill="url(#logo-grad)"
          filter="url(#logo-shadow)"
        />

        {/* Inner subtle shine */}
        <rect
          x="4"
          y="4"
          width="92"
          height="46"
          rx="22"
          fill="white"
          opacity="0.12"
        />

        {/* House roof — unique angular shape */}
        <path
          d="M50 18 L82 44 L74 44 L74 72 L26 72 L26 44 L18 44 Z"
          fill="white"
          opacity="0.95"
        />

        {/* Door opening */}
        <rect
          x="42"
          y="52"
          width="16"
          height="20"
          rx="3"
          fill="url(#logo-grad-dark)"
          opacity="0.9"
        />

        {/* Wrench handle — goes through the door diagonally */}
        <g transform="translate(50, 62) rotate(-45)">
          {/* Handle */}
          <rect
            x="-2"
            y="-18"
            width="4"
            height="28"
            rx="2"
            fill="white"
            opacity="0.95"
          />
          {/* Wrench head top */}
          <path
            d="M-7 -18 L7 -18 L5 -12 L-5 -12 Z"
            fill="white"
            opacity="0.95"
          />
          {/* Wrench head notch */}
          <rect
            x="-2"
            y="-22"
            width="4"
            height="5"
            rx="1"
            fill="url(#logo-grad-dark)"
          />
        </g>

        {/* Checkmark — small, in bottom-right corner */}
        <path
          d="M62 60 L68 66 L80 50"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.9"
        />
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className="font-extrabold text-lg leading-none tracking-tight text-slate-900 dark:text-white">
            Fix<span className="text-brand-500">Mate</span>
          </span>
          <span className="text-[8px] font-bold tracking-[0.2em] text-slate-400 dark:text-slate-500 uppercase">
            HOME SERVICES
          </span>
        </div>
      )}
    </div>
  );
}

/* Favicon SVG — smaller, no text */
export function LogoIcon({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="icon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="92" height="92" rx="22" fill="url(#icon-grad)" />
      <rect x="4" y="4" width="92" height="46" rx="22" fill="white" opacity="0.12" />
      <path d="M50 18 L82 44 L74 44 L74 72 L26 72 L26 44 L18 44 Z" fill="white" opacity="0.95" />
      <rect x="42" y="52" width="16" height="20" rx="3" fill="#1d4ed8" opacity="0.9" />
      <g transform="translate(50, 62) rotate(-45)">
        <rect x="-2" y="-18" width="4" height="28" rx="2" fill="white" opacity="0.95" />
        <path d="M-7 -18 L7 -18 L5 -12 L-5 -12 Z" fill="white" opacity="0.95" />
        <rect x="-2" y="-22" width="4" height="5" rx="1" fill="#1d4ed8" />
      </g>
      <path d="M62 60 L68 66 L80 50" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.9" />
    </svg>
  );
}
