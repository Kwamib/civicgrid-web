import Link from "next/link";

/** Grid mark + wordmark. `tone` picks the text color for dark or light backgrounds. */
export function Brand({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2.5 whitespace-nowrap ${tone === "light" ? "text-white" : "text-ink"}`}
      aria-label="CivicGrid home"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7 flex-shrink-0" aria-hidden="true">
        <rect width="32" height="32" rx="6" fill={tone === "light" ? "#ffffff1a" : "#102840"} />
        <path d="M8 8h6v6H8zm10 0h6v6h-6zM8 18h6v6H8zm10 0h6v6h-6z" fill="#9bd4ff" />
      </svg>
      <span className="font-serif text-[22px] leading-none tracking-tight">CivicGrid</span>
    </Link>
  );
}
