interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  variant?: "color" | "white" | "black";
}

export function Logo({ size = 36, className = "", showText = true, variant = "color" }: LogoProps) {
  const bgId = `fm-bg-${variant}`;
  const gradientDef =
    variant === "color" ? (
      <linearGradient id={bgId} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2563eb" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    ) : null;

  const bgColor =
    variant === "black" ? "#0f172a" : variant === "white" ? "#ffffff" : `url(#${bgId})`;

  const letterColor = variant === "black" ? "#ffffff" : "#ffffff";
  const notchColor = variant === "black" ? "#0f172a" : variant === "white" ? "#0f172a" : `url(#${bgId})`;

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
        {gradientDef}
        <rect width="100" height="100" rx="24" fill={bgColor} />
        {/* F */}
        <rect x="22" y="24" width="12" height="52" rx="3" fill={letterColor} />
        <rect x="22" y="24" width="36" height="12" rx="3" fill={letterColor} />
        <rect x="22" y="42" width="26" height="10" rx="3" fill={letterColor} />
        <rect x="25" y="66" width="6" height="3" rx="1.5" fill={notchColor} />
        {/* M */}
        <rect x="48" y="24" width="10" height="52" rx="3" fill={letterColor} />
        <rect x="72" y="24" width="10" height="52" rx="3" fill={letterColor} />
        <path d="M48 24 L57 24 L63 42 L54 42 Z" fill={letterColor} />
        <path d="M72 24 L80 24 L80 42 L66 42 L63 42 Z" fill={letterColor} fillRule="evenodd" />
        <rect x="48" y="64" width="34" height="12" rx="3" fill={letterColor} />
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span
            className="font-extrabold text-lg leading-none tracking-tight"
            style={{
              color:
                variant === "black"
                  ? "#0f172a"
                  : variant === "white"
                  ? "#ffffff"
                  : undefined,
            }}
          >
            <span className={variant === "color" ? "text-slate-900 dark:text-white" : ""}>
              Fix
            </span>
            <span className={variant === "color" ? "text-brand-500" : variant === "black" ? "text-blue-600" : "text-blue-500"}>
              Mate
            </span>
          </span>
          <span
            className="text-[8px] font-bold tracking-[0.2em] uppercase"
            style={{
              color:
                variant === "black"
                  ? "#64748b"
                  : variant === "white"
                  ? "rgba(255,255,255,0.6)"
                  : undefined,
            }}
          >
            <span className={variant === "color" ? "text-slate-400 dark:text-slate-500" : ""}>
              HOME SERVICES
            </span>
          </span>
        </div>
      )}
    </div>
  );
}

export function LogoIcon({ size = 32, variant = "color" as "color" | "white" | "black" }: { size?: number; variant?: "color" | "white" | "black" }) {
  const bgId = `fm-icon-${variant}`;
  const gradientDef =
    variant === "color" ? (
      <linearGradient id={bgId} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2563eb" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    ) : null;

  const bgColor =
    variant === "black" ? "#0f172a" : variant === "white" ? "#ffffff" : `url(#${bgId})`;
  const letterColor = "#ffffff";
  const notchColor = variant === "black" ? "#0f172a" : variant === "white" ? "#0f172a" : `url(#${bgId})`;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {gradientDef}
      <rect width="100" height="100" rx="24" fill={bgColor} />
      <rect x="22" y="24" width="12" height="52" rx="3" fill={letterColor} />
      <rect x="22" y="24" width="36" height="12" rx="3" fill={letterColor} />
      <rect x="22" y="42" width="26" height="10" rx="3" fill={letterColor} />
      <rect x="25" y="66" width="6" height="3" rx="1.5" fill={notchColor} />
      <rect x="48" y="24" width="10" height="52" rx="3" fill={letterColor} />
      <rect x="72" y="24" width="10" height="52" rx="3" fill={letterColor} />
      <path d="M48 24 L57 24 L63 42 L54 42 Z" fill={letterColor} />
      <path d="M72 24 L80 24 L80 42 L66 42 L63 42 Z" fill={letterColor} fillRule="evenodd" />
      <rect x="48" y="64" width="34" height="12" rx="3" fill={letterColor} />
    </svg>
  );
}
