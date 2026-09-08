import { cn } from "@/lib/cn";

type ProgressRingProps = {
  className?: string;
  label: string;
  size?: number;
  value: number;
};

export function ProgressRing({
  className,
  label,
  size = 40,
  value,
}: ProgressRingProps) {
  const percentage = Math.min(Math.max(value, 0), 100);
  const radius = 16;
  const circumference = 2 * Math.PI * radius;

  return (
    <span
      aria-label={label}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={percentage}
      className={cn(
        "relative inline-grid shrink-0 place-items-center",
        className,
      )}
      role="progressbar"
      style={{ height: size, width: size }}
    >
      <svg
        aria-hidden="true"
        className="-rotate-90"
        height={size}
        viewBox="0 0 40 40"
        width={size}
      >
        <circle
          cx="20"
          cy="20"
          fill="none"
          r={radius}
          stroke="var(--ring-track)"
          strokeWidth="4"
        />
        <circle
          cx="20"
          cy="20"
          fill="none"
          r={radius}
          stroke="var(--accent-500)"
          strokeDasharray={`${(circumference * percentage) / 100} ${circumference}`}
          strokeLinecap="round"
          strokeWidth="4"
        />
      </svg>
      <b className="absolute text-[.625rem] font-bold text-[var(--gray-600)]">
        {percentage}%
      </b>
    </span>
  );
}
