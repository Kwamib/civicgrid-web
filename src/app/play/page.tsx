import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageHeading } from "@/components/ui";
import { OG_IMAGES } from "@/lib/og";

const TITLE = "Play · CivicGrid";
const DESCRIPTION = "Quick games about U.S. states and cities, built on CivicGrid's data.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/play", siteName: "CivicGrid", type: "website", images: OG_IMAGES },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: OG_IMAGES.map((i) => i.url) },
};

function GameCard({ title, blurb, href, icon }: { title: string; blurb: string; href?: string; icon: ReactNode }) {
  const body = (
    <>
      <span className="text-cobalt" aria-hidden="true">{icon}</span>
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p className="text-sm leading-relaxed text-muted">{blurb}</p>
      <span className={`mt-auto text-sm font-semibold ${href ? "text-cobalt" : "text-muted"}`}>{href ? "Play" : "Coming soon"}</span>
    </>
  );
  const cls = "flex flex-col gap-2.5 rounded-xl border border-line bg-white p-6";
  return href ? (
    <Link href={href} className={`${cls} hover:border-cobalt`}>{body}</Link>
  ) : (
    <div className={`${cls} opacity-75`}>{body}</div>
  );
}

const svg = (d: ReactNode) => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);

export default function PlayPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main id="main" className="mx-auto w-full max-w-[1120px] flex-1 px-4 pb-14 pt-10 sm:px-6">
        <PageHeading
          eyebrow="Play"
          title="Games about U.S. cities"
          intro="Quick games built on the same data as CivicGrid: 3,064 cities, their states, populations and verified leaders."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <GameCard
            title="States and capitals"
            blurb="Name the capital of each state. Keep your streak going."
            href="/play/capitals"
            icon={svg(<><path d="M3 21h18" /><path d="M5 21V10l7-5 7 5v11" /><path d="M9 21v-6h6v6" /><path d="M12 5V2" /></>)}
          />
          <GameCard
            title="Higher or lower"
            blurb="Two cities. Which has more people? One wrong answer ends the run."
            icon={svg(<><path d="M7 4v16" /><path d="M3 8l4-4 4 4" /><path d="M17 20V4" /><path d="M13 16l4 4 4-4" /></>)}
          />
          <GameCard
            title="Pin the city"
            blurb="Drop a pin where you think the city is. Closer scores higher."
            icon={svg(<><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></>)}
          />
          <GameCard
            title="Daily city puzzle"
            blurb="One mystery city a day. Each miss reveals a clue. Share your score."
            icon={svg(<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18" /><path d="M8 3v4" /><path d="M16 3v4" /></>)}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
