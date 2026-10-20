import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CapitalsGame } from "@/components/CapitalsGame";
import { OG_IMAGES } from "@/lib/og";

const TITLE = "States and Capitals Quiz · CivicGrid";
const DESCRIPTION = "Name the capital of every U.S. state. Play 10 random states or all 50, with multiple choice or typed answers.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/play/capitals", siteName: "CivicGrid", type: "website", images: OG_IMAGES },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: OG_IMAGES.map((i) => i.url) },
};

export default function CapitalsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main id="main" className="mx-auto w-full max-w-[760px] flex-1 px-4 pb-14 pt-10 sm:px-6">
        <p className="mb-2 text-sm">
          <Link href="/play" className="text-cobalt hover:underline">Play</Link> <span className="text-muted">/ States and capitals</span>
        </p>
        <h1 className="mb-6 font-serif text-[32px] font-bold leading-[1.2] text-ink sm:text-[36px]">States and capitals</h1>
        <CapitalsGame />
        <section aria-labelledby="more" className="mt-10">
          <h2 id="more" className="mb-3 font-serif text-xl font-bold text-ink">More to explore</h2>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/play" className="rounded-full border border-line px-4 py-2 text-cobalt hover:bg-panel">All games</Link>
            <Link href="/states" className="rounded-full border border-line px-4 py-2 text-cobalt hover:bg-panel">Browse states</Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
