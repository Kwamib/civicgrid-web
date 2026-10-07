import Link from "next/link";

/** "▦ CivicGrid" wordmark, as in the approved reference. `tone` picks the color for dark or light backgrounds. */
export function Brand({ tone = "light", size = "lg" }: { tone?: "light" | "dark"; size?: "lg" | "sm" }) {
  return (
    <Link
      href="/"
      aria-label="CivicGrid home"
      className={`whitespace-nowrap font-bold leading-none hover:no-underline ${size === "lg" ? "text-[23px] sm:text-[25px]" : "text-[21px]"} ${
        tone === "light" ? "text-white" : "text-ink"
      }`}
    >
      <span aria-hidden="true">▦</span> CivicGrid
    </Link>
  );
}
