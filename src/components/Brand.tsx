import Link from "next/link";

/**
 * CivicGrid logo: a 3x3 grid with the center square in cobalt ("the city
 * you're looking for"), plus the wordmark. `tone` picks colors for dark
 * (navy header) or light backgrounds. Same mark as src/app/icon.svg.
 */
const SQUARES = [
  [2, 2],
  [12, 2],
  [22, 2],
  [2, 12],
  [22, 12],
  [2, 22],
  [12, 22],
  [22, 22],
];

export function BrandMark({ tone = "light", className = "" }: { tone?: "light" | "dark"; className?: string }) {
  const cell = tone === "light" ? "#ffffff" : "#11223a";
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      {SQUARES.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="8" height="8" rx="1.5" fill={cell} />
      ))}
      <rect x="12" y="12" width="8" height="8" rx="1.5" fill="#0869ee" />
    </svg>
  );
}

export function Brand({ tone = "light", size = "lg" }: { tone?: "light" | "dark"; size?: "lg" | "sm" }) {
  return (
    <Link
      href="/"
      aria-label="CivicGrid home"
      className={`inline-flex items-center gap-2.5 whitespace-nowrap font-bold leading-none hover:no-underline ${size === "lg" ? "text-[23px] sm:text-[25px]" : "text-[21px]"} ${
        tone === "light" ? "text-white" : "text-ink"
      }`}
    >
      <BrandMark tone={tone} className="h-[0.95em] w-[0.95em] shrink-0" />
      CivicGrid
    </Link>
  );
}
