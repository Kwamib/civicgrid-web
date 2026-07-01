import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { stateSlug, citySlug } from "@/lib/slug";
import { getAllStates, getStateBySlug, TOP_CITIES_LIMIT } from "@/lib/states";
import { Header } from "@/components/Header";

export async function generateStaticParams() {
  const states = await getAllStates();
  return states.map((s) => ({ slug: stateSlug(s.state_name) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const state = await getStateBySlug(slug);
  if (!state) return { title: "State not found · CivicGrid" };

  const title = `${state.state_name} Cities & Mayors · CivicGrid`;
  const description = `Leadership data for ${state.city_count.toLocaleString()} cities in ${state.state_name}, covering ${state.total_population.toLocaleString()} residents. Browse mayors, parties, and populations.`;

  return {
    title,
    description,
    openGraph: {
      title: `${state.state_name} · ${state.city_count} cities · CivicGrid`,
      description,
      url: `https://www.civicgrid.org/states/${slug}`,
      siteName: "CivicGrid",
      type: "website",
    },
  };
}

export default async function StateDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const state = await getStateBySlug(slug);

  if (!state) {
    notFound();
  }

  const remaining = state.city_count - state.top_cities.length;
  const partyRows = Object.entries(state.party_breakdown).sort((a, b) => b[1] - a[1]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />

      <div className="mx-auto max-w-3xl px-6 pt-6">
        <Link href="/states" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          All states
        </Link>
      </div>

      <section className="pt-8 pb-12" style={{ background: "linear-gradient(180deg, #fafbfc 0%, #ffffff 100%)" }}>
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-xs text-slate-500 tracking-wider uppercase font-medium mb-3">
            State · {state.state_code}
          </div>
          <h1 className="text-4xl md:text-5xl font-normal leading-[1.1] tracking-tight mb-2" style={{ fontFamily: "var(--font-serif)" }}>
            {state.state_name}
          </h1>
          <p className="text-lg text-slate-600 mb-6">
            <span className="font-medium">{state.city_count.toLocaleString()}</span> cities ·{" "}
            <span className="font-medium">{state.total_population.toLocaleString()}</span> residents
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge>Dominant: {state.dominant_party}</Badge>
          </div>
        </div>
      </section>

      <Section title="Leadership by party" subtitle="How many cities each party leads">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {partyRows.map(([party, count]) => (
            <div key={party} className="flex items-baseline justify-between gap-4 border-b border-slate-100 pb-3">
              <dt className="text-sm text-slate-500 flex-shrink-0"><PartyBadge party={party} /></dt>
              <dd className="text-sm font-medium text-right">
                {count.toLocaleString()}{" "}
                <span className="text-slate-400 font-normal">{count === 1 ? "city" : "cities"}</span>
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="Largest cities" subtitle={`Top ${Math.min(TOP_CITIES_LIMIT, state.top_cities.length)} by population`}>
        <div className="divide-y divide-slate-100">
          {state.top_cities.map((c, i) => (
            <Link key={c.id} href={`/cities/${citySlug(c.city, c.state_code)}`} className="flex items-center justify-between gap-4 py-3 group">
              <div className="flex items-baseline gap-3 min-w-0">
                <span className="text-xs text-slate-400 w-5 flex-shrink-0 text-right">{i + 1}</span>
                <span className="text-sm font-medium truncate group-hover:text-slate-900 transition">{c.city}</span>
                <span className="text-xs text-slate-400 truncate hidden sm:inline">{c.leader_name}{c.leader_title ? `, ${c.leader_title}` : ""}</span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-sm text-slate-500 tabular-nums">{c.population?.toLocaleString()}</span>
                <span className="text-slate-300 group-hover:text-slate-500 transition">→</span>
              </div>
            </Link>
          ))}
        </div>
        {remaining > 0 ? (
          <p className="text-sm text-slate-400 mt-5">…and {remaining.toLocaleString()} more {remaining === 1 ? "city" : "cities"} in {state.state_name}.</p>
        ) : null}
      </Section>

      <section className="py-12 bg-slate-50 border-t border-slate-200">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-xs text-slate-500 tracking-widest uppercase font-medium mb-3">For developers</div>
          <p className="text-base text-slate-600 mb-5">Fetch every {state.state_name} city via API:</p>
          <div className="rounded-xl p-5 text-xs leading-relaxed overflow-x-auto mb-5 shadow-sm" style={{ background: "#1a2540", color: "#e8eef5", fontFamily: "var(--font-mono)" }}>
            <div style={{ color: "#6b7a99" }}>$ curl https://api.civicgrid.org/cities?state={state.state_code}</div>
            <div style={{ color: "#6b7a99" }}>{"  "}-H &quot;Authorization: Bearer cg_live_...&quot;</div>
          </div>
          <Link href="/dashboard" className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-medium text-white hover:opacity-90 transition" style={{ background: "#1a2540" }}>Get API key →</Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-6">
        <div className="mx-auto max-w-3xl px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-400">
          <div>© 2026 CivicGrid · Built quietly. Shipped loudly.</div>
          <div className="flex gap-5">
            <Link href="/states" className="hover:text-slate-700 transition">States</Link>
            <Link href="/" className="hover:text-slate-700 transition">Search</Link>
            <a href="https://github.com/Kwamib" target="_blank" rel="noopener noreferrer" className="hover:text-slate-700 transition">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="py-10 border-t border-slate-200">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-2xl font-normal mb-1" style={{ fontFamily: "var(--font-serif)" }}>{title}</h2>
        {subtitle ? <p className="text-sm text-slate-500 mb-6">{subtitle}</p> : null}
        {children}
      </div>
    </section>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="text-xs px-2.5 py-1 bg-white border border-slate-200 rounded-full text-slate-600">{children}</span>;
}

function PartyBadge({ party }: { party: string }) {
  if (!party) return null;
  const p = party.toLowerCase();
  let bg = "#f1f5f9";
  let fg = "#475569";
  if (p.includes("democrat")) { bg = "#eff6ff"; fg = "#1e40af"; }
  else if (p.includes("republican")) { bg = "#fef2f2"; fg = "#991b1b"; }
  else if (p.includes("independent")) { bg = "#fdf4ff"; fg = "#86198f"; }
  return <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: bg, color: fg }}>{party}</span>;
}
