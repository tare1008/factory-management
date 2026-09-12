const MARK_COLORS = {
  dark: { primary: "#c38509", accent: "#0085cc", text: "#001724" },
  light: { primary: "#f6b83c", accent: "#66c9ff", text: "#ffffff" },
} as const;

function LogoMark({ size, theme }: { size: number; theme: "dark" | "light" }) {
  const colors = MARK_COLORS[theme];
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="44" height="44" rx="12" fill={colors.primary} />
      <path d="M24 10 L36 24 L24 38 L12 24 Z" fill="white" fillOpacity="0.15" />
      <path d="M24 14 L32 24 L24 34 L16 24 Z" fill={colors.accent} />
      <circle cx="24" cy="24" r="4" fill="white" />
    </svg>
  );
}

export function Logo({
  theme = "dark",
  size = "full",
}: {
  theme?: "dark" | "light";
  size?: "full" | "compact";
}) {
  const colors = MARK_COLORS[theme];

  if (size === "compact") {
    return (
      <span className="inline-flex items-center gap-2">
        <LogoMark size={32} theme={theme} />
        <span className="text-lg font-bold tracking-tight" style={{ color: colors.text }}>
          Supreme International
        </span>
      </span>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <LogoMark size={88} theme={theme} />
      <div>
        <p
          className="text-2xl font-bold uppercase tracking-[0.15em]"
          style={{ color: colors.text }}
        >
          Supreme
        </p>
        <p
          className="text-sm font-medium uppercase tracking-[0.35em]"
          style={{ color: colors.text, opacity: 0.7 }}
        >
          International
        </p>
        <div className="mx-auto mt-3 h-0.5 w-16 rounded-full bg-papaya-whip-500" />
      </div>
    </div>
  );
}
