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
          <linearGradient id="fm-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        {/* Background */}
        <rect x="0" y="0" width="100" height="100" rx="24" fill="url(#fm-grad)" />

        {/* Letter F — left side */}
        <g>
          {/* Vertical stroke of F */}
          <rect x="22" y="24" width="12" height="52" rx="3" fill="white" />
          {/* Top horizontal bar of F */}
          <rect x="22" y="24" width="36" height="12" rx="3" fill="white" />
          {/* Middle horizontal bar of F */}
          <rect x="22" y="42" width="26" height="10" rx="3" fill="white" />
          {/* Wrench notch — small cutout in bottom of F's vertical stroke */}
          <rect x="25" y="66" width="6" height="3" rx="1.5" fill="url(#fm-grad)" />
        </g>

        {/* Letter M — right side */}
        <g>
          {/* Left vertical stroke of M */}
          <rect x="48" y="24" width="10" height="52" rx="3" fill="white" />
          {/* Right vertical stroke of M */}
          <rect x="72" y="24" width="10" height="52" rx="3" fill="white" />
          {/* Left diagonal of M */}
          <path d="M48 24 L57 24 L63 42 L54 42 Z" fill="white" />
          {/* Right diagonal of M */}
          <path d="M72 24 L80 24 L80 42 L66 42 L63 42 Z" fill="white" fillRule="evenodd" />
          {/* Bottom connecting bar */}
          <rect x="48" y="64" width="34" height="12" rx="3" fill="white" />
        </g>
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
        <linearGradient id="fm-grad-icon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="100" height="100" rx="24" fill="url(#fm-grad-icon)" />
      <g>
        <rect x="22" y="24" width="12" height="52" rx="3" fill="white" />
        <rect x="22" y="24" width="36" height="12" rx="3" fill="white" />
        <rect x="22" y="42" width="26" height="10" rx="3" fill="white" />
        <rect x="25" y="66" width="6" height="3" rx="1.5" fill="url(#fm-grad-icon)" />
      </g>
      <g>
        <rect x="48" y="24" width="10" height="52" rx="3" fill="white" />
        <rect x="72" y="24" width="10" height="52" rx="3" fill="white" />
        <path d="M48 24 L57 24 L63 42 L54 42 Z" fill="white" />
        <path d="M72 24 L80 24 L80 42 L66 42 L63 42 Z" fill="white" fillRule="evenodd" />
        <rect x="48" y="64" width="34" height="12" rx="3" fill="white" />
      </g>
    </svg>
  );
}
