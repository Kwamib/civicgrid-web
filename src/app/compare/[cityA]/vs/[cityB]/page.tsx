import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { citySlug } from "@/lib/slug";
import { getAllCities, type City } from "@/lib/cities";
import { Header } from "@/components/Header";

async function findCity(slug: string): Promise<City | null> {
  const all = await getAllCities();
  return all.find((c) => citySlug(c.city, c.state_code) === slug) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cityA: string; cityB: string }>;
}): Promise<Metadata> {
  const { cityA, cityB } = await params;
  const [a, b] = await Promise.all([findCity(cityA), findCity(cityB)]);
  if (!a || !b) return { title: "Comparison not found · CivicGrid" };

  const title = `${a.city} vs ${b.city} · CivicGrid`;
  const description = `Compare ${a.city}, ${a.state_code} and ${b.city}, ${b.state_code}: population, income, age, and city leadership side by side.`;

  return {
    title,
    description,
    openGraph: {
      title: `${a.city} vs ${b.city} · CivicGrid`,
      description,
      url: `https://www.civicgrid.org/compare/${cityA}/vs/${cityB}`,
      siteName: "CivicGrid",
      type: "website",
    },
  };
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ cityA: string; cityB: string }>;
}) {
  const { cityA, cityB } = await params;
  const [a, b] = await Promise.all([findCity(cityA), findCity(cityB)]);

  if (!a || !b) {
    notFound();
  }

  const rows: { label: string; aVal: number | null; bVal: number | null; fmt: (n: number) => string }[] = [
    { label: "Population", aVal: a.population, bVal: b.population, fmt: (n) => n.toLocaleString() },
    { label: "Median income", aVal: a.median_household_income, bVal: b.median_household_income, fmt: (n) => `$${n.toLocaleString()}` },
    { label: "Median age", aVal: a.median_age, bVal: b.median_age, fmt: (n) => n.toString() },
    { label: "Land area", aVal: a.land_area_sq_mi, bVal: b.land_area_sq_mi, fmt: (n) => `${n.toLocaleString()} sq mi` },
    { label: "Density", aVal: a.population_density, bVal: b.population_density, fmt: (n) => `${n.toLocaleString()}/sq mi` },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />

      <div className="mx-auto max-w-3xl px-6 pt-6">
        <Link href="/compare" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          New comparison
        </Link>
      </div>

      <section className="pt-6 pb-8" style={{ background: "linear-gradient(180deg, #fafbfc 0%, #ffffff 100%)" }}>
        <div className="mx-auto max-w-3xl px-6">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <CityHead city={a} align="right" />
            <div className="text-slate-300 text-lg" style={{ fontFamily: "var(--font-serif)" }}>vs</div>
            <CityHead city={b} align="left" />
          </div>
        </div>
      </section>

      <section className="pb-12">
        <div className="mx-auto max-w-3xl px-6">
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            {rows.map((row, i) => {
              const aBigger = row.aVal != null && row.bVal != null && row.aVal > row.bVal;
              const bBigger = row.aVal != null && row.bVal != null && row.bVal > row.aVal;
              return (
                <div key={row.label} className={`grid grid-cols-[1fr_auto_1fr] items-center ${i !== rows.length - 1 ? "border-b border-slate-100" : ""}`}>
                  <div className={`px-5 py-4 text-right text-sm ${aBigger ? "font-semibold text-slate-900" : "text-slate-600"}`}>
                    {row.aVal != null ? row.fmt(row.aVal) : "—"}
                    {aBigger ? <span className="text-emerald-600 ml-1">↑</span> : null}
                  </div>
                  <div className="px-4 py-4 text-[11px] tracking-wide uppercase text-slate-400 text-center whitespace-nowrap">{row.label}</div>
                  <div className={`px-5 py-4 text-left text-sm ${bBigger ? "font-semibold text-slate-900" : "text-slate-600"}`}>
                    {bBigger ? <span className="text-emerald-600 mr-1">↑</span> : null}
                    {row.bVal != null ? row.fmt(row.bVal) : "—"}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-slate-400 mt-3 text-center">↑ marks the higher value</p>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-6">
        <div className="mx-auto max-w-3xl px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-400">
          <div>© 2026 CivicGrid · Built quietly. Shipped loudly.</div>
          <div className="flex gap-5">
            <Link href="/compare" className="hover:text-slate-700 transition">Compare</Link>
            <Link href="/states" className="hover:text-slate-700 transition">States</Link>
            <Link href="/" className="hover:text-slate-700 transition">Search</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CityHead({ city, align }: { city: City; align: "left" | "right" }) {
  const alignClass = align === "right" ? "text-right items-end" : "text-left items-start";
  return (
    <div className={`flex flex-col ${alignClass}`}>
      <div className="text-[11px] text-slate-500 uppercase tracking-wide mb-1">{city.state_name}</div>
      <Link href={`/cities/${citySlug(city.city, city.state_code)}`} className="text-2xl md:text-3xl font-normal leading-tight hover:text-slate-600 transition" style={{ fontFamily: "var(--font-serif)" }}>
        {city.city}
      </Link>
      <div className="text-sm text-slate-600 mt-1">{city.leader_name || "—"}</div>
      <div className="mt-2"><PartyBadge party={city.leader_party} /></div>
    </div>
  );
}

function PartyBadge({ party }: { party: string }) {
  if (!party) return null;
  const p = party.toLowerCase();
  let bg = "#f1f5f9";
  let fg = "#475569";
  if (p.includes("democrat")) { bg = "#eff6ff"; fg = "#1e40af"; }
  else if (p.includes("republican")) { bg = "#fef2f2"; fg = "#991b1b"; }
  else if (p.includes("independent")) { bg = "#fdf4ff"; fg = "#86198f"; }
  return <span className="text-[10px] px-2 py-0.5 rounded font-medium whitespace-nowrap" style={{ background: bg, color: fg }}>{party}</span>;
}
