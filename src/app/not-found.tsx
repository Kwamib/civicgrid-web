import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LostMap } from "@/components/LostMap";

export const metadata: Metadata = {
  title: "Page not found · CivicGrid",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main id="main" className="mx-auto w-full max-w-[1000px] flex-1 px-4 pb-14 pt-10 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cobalt">404 · Page not found</p>
        <h1 className="mt-2 font-serif text-[32px] font-bold leading-[1.2] tracking-[-1px] text-ink sm:text-[42px]">
          This page is off the map.
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          The link you followed doesn&apos;t lead to a CivicGrid page. Choose a state to keep exploring, or head back
          to the city search.
        </p>

        <div className="mt-8 rounded-xl border border-line bg-panel p-4 sm:p-6">
          <LostMap />
        </div>

        <nav aria-label="Other places to go" className="mt-8 flex flex-wrap gap-3 text-sm">
          <Link href="/" className="rounded-md bg-cobalt px-4 py-2 font-semibold text-white hover:bg-cobalt-dark">
            Search cities
          </Link>
          <Link href="/states" className="rounded-md border border-line px-4 py-2 font-semibold text-ink hover:border-cobalt hover:text-cobalt">
            All states
          </Link>
          <Link href="/developers" className="rounded-md border border-line px-4 py-2 font-semibold text-ink hover:border-cobalt hover:text-cobalt">
            API &amp; docs
          </Link>
        </nav>
      </main>
      <Footer />
    </div>
  );
}
