import Link from "next/link";
import type { Metadata } from "next";
import { stateSlug } from "@/lib/slug";
import { getAllStates } from "@/lib/states";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Cities & Mayors by State · CivicGrid",
  description:
    "Browse US municipal leadership data by state. City counts, populations, and party breakdowns for every state CivicGrid covers.",
  openGraph: {
    title: "Cities & Mayors by State · CivicGrid",
    description:
      "Browse US municipal leadership data by state — city counts, populations, and party breakdowns.",
    url: "https://www.civicgrid.org/states",
    siteName: "CivicGrid",
    type: "website",
  },
};

export default async function StatesIndexPage() {
  const states = await getAllStates();
  const totalCities = states.reduce((sum, s) => sum + s.city_count, 0);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />

      <section
        className="pt-10 pb-10"
        style={{
          background: "linear-gradient(180deg, #fafbfc 0%, #ffffff 100%)",
        }}
      >
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-xs text-slate-500 tracking-wider uppercase font-medium mb-3">
            Browse by state
          </div>
          <h1
            className="text-4xl md:text-5xl font-normal leading-[1.1] tracking-tight mb-3"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Cities &amp; Mayors by State
          </h1>
          <p className="text-lg text-slate-600">
            {states.length} states · {totalCities.toLocaleString()} cities covered
          </p>
        </div>
      </section>

      <section className="py-10 border-t border-slate-200">
        <div className="mx-auto max-w-4xl px-6">
          {states.length === 0 ? (
            <p className="text-sm text-slate-500">
              State data is unavailable right now. Please check back shortly.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {states.map((s) => (
                <Link
                  key={s.state_code}
                  href={`/states/${stateSlug(s.state_name)}`}
                  className="group rounded-xl border border-slate-200 p-4 hover:border-slate-300 hover:shadow-sm transition"
                >
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <span
                      className="text-lg font-normal group-hover:text-slate-900 transition"
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      {s.state_name}
                    </span>
                    <span className="text-xs text-slate-400">{s.state_code}</span>
                  </div>
                  <div className="text-sm text-slate-500">
                    {s.city_count.toLocaleString()}{" "}
                    {s.city_count === 1 ? "city" : "cities"} ·{" "}
                    {s.total_population.toLocaleString()} residents
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-slate-200 py-6">
        <div className="mx-auto max-w-4xl px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-400">
          <div>© 2026 CivicGrid · Built quietly. Shipped loudly.</div>
          <div className="flex gap-5">
            <Link href="/" className="hover:text-slate-700 transition">
              Search
            </Link>
            <a
              href="https://github.com/Kwamib"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-700 transition"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
