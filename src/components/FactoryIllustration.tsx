export function FactoryIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 500"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
    >
      <rect width="800" height="500" fill="#001724" />

      {/* Sky gradient */}
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#002133" />
          <stop offset="100%" stopColor="#004266" />
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill="url(#sky)" />

      {/* Distant building block */}
      <rect x="40" y="260" width="70" height="180" fill="#1f3847" />
      <rect x="120" y="220" width="55" height="220" fill="#1f3847" />

      {/* Main factory building */}
      <rect x="200" y="300" width="360" height="150" fill="#2f536a" />
      <rect x="200" y="300" width="360" height="14" fill="#3e6f8e" />

      {/* Sawtooth factory roof */}
      <polygon points="200,300 240,260 280,300" fill="#3e6f8e" />
      <polygon points="280,300 320,260 360,300" fill="#3e6f8e" />
      <polygon points="360,300 400,260 440,300" fill="#3e6f8e" />
      <polygon points="440,300 480,260 520,300" fill="#3e6f8e" />
      <polygon points="520,300 560,260 600,300" fill="#3e6f8e" />

      {/* Windows */}
      {Array.from({ length: 6 }, (_, i) => (
        <rect
          key={i}
          x={230 + i * 55}
          y={340}
          width="28"
          height="40"
          fill="#f6b83c"
          opacity="0.55"
        />
      ))}

      {/* Chimneys */}
      <rect x="600" y="150" width="30" height="180" fill="#1f3847" />
      <rect x="650" y="120" width="30" height="210" fill="#1f3847" />
      <rect x="700" y="180" width="24" height="150" fill="#1f3847" />

      {/* Smoke */}
      <circle cx="615" cy="120" r="18" fill="#95b9d0" opacity="0.35" />
      <circle cx="635" cy="95" r="24" fill="#95b9d0" opacity="0.3" />
      <circle cx="665" cy="80" r="20" fill="#95b9d0" opacity="0.3" />
      <circle cx="690" cy="60" r="26" fill="#95b9d0" opacity="0.25" />

      {/* Crane */}
      <rect x="150" y="180" width="8" height="150" fill="#4e8bb1" />
      <rect x="150" y="180" width="160" height="8" fill="#4e8bb1" />
      <rect x="290" y="188" width="6" height="40" fill="#4e8bb1" />

      {/* Ground */}
      <rect x="0" y="440" width="800" height="60" fill="#000f2b" />

      {/* Storage tanks */}
      <circle cx="740" cy="410" r="34" fill="#1f3847" />
      <rect x="706" y="410" width="68" height="30" fill="#1f3847" />
    </svg>
  );
}
