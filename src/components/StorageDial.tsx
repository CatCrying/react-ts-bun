interface StorageDialProps {
  usedGb: number;
  totalGb: number;
}

export function StorageDial({ usedGb, totalGb }: StorageDialProps) {
  const pct = Math.min(usedGb / totalGb, 1);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);
  const isNearFull = pct > 0.85;

  // Tick marks around the dial, like a combination lock
  const ticks = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="relative flex h-40 w-40 items-center justify-center">
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
        {ticks.map((i) => {
          const angle = (i / ticks.length) * 360;
          const isMajor = i % 6 === 0;
          return (
            <line
              key={i}
              x1="64"
              y1={isMajor ? "6" : "9"}
              x2="64"
              y2="14"
              stroke="var(--color-parchment-dim)"
              strokeWidth={isMajor ? 1.5 : 0.75}
              transform={`rotate(${angle} 64 64)`}
            />
          );
        })}
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="var(--color-ink-soft)"
          strokeWidth="8"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke={isNearFull ? "var(--color-rust)" : "var(--color-brass)"}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center font-mono text-parchment">
        <span className="text-2xl font-semibold tabular-nums">
          {usedGb.toFixed(1)}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-parchment-dim">
          of {totalGb} GB
        </span>
      </div>
    </div>
  );
}

