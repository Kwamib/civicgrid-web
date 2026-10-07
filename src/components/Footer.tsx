import Link from "next/link";
import { Brand } from "@/components/Brand";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-5 px-4 py-7 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex flex-col gap-1.5">
          <Brand tone="dark" />
          <p className="text-xs text-muted">© 2026 CivicGrid · Built quietly. Shipped loudly.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-[13px]">
          <Link href="/methodology" className="text-cobalt hover:underline">Sources &amp; methodology</Link>
          <Link href="/correction" className="text-cobalt hover:underline">Report a correction</Link>
          <Link href="/developers" className="text-cobalt hover:underline">API &amp; docs</Link>
          <a href="https://github.com/Kwamib" target="_blank" rel="noopener noreferrer" className="text-cobalt hover:underline">GitHub</a>
          <a href="https://kwamib.dev" target="_blank" rel="noopener noreferrer" className="text-cobalt hover:underline">Made by Kwame</a>
        </nav>
      </div>
    </footer>
  );
}
