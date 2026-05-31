"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { citySlug } from "@/lib/slug";

type City = {
  id: number;
  city: string;
  state_code: string;
  state_name: string;
  population: number;
  leader_name: string;
  leader_title: string;
  leader_party: string;
  leader_year_elected: number;
};

const SUGGESTIONS = ["California", "Karen Bass", "Texas", "Megacities"];

export default function Home() {
  const [allCities, setAllCities] = useState<City[]>([]);
  const [query, setQuery] = useState("Los Angeles");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/search")
      .then((r) => {
        if (!r.ok) throw new Error(`API ${r.status}`);
        return r.json();
      })
      .then((json) => {
        setAllCities(json.data || []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();

    if (q === "megacities") {
      return allCities
        .filter((c) => c.population >= 1_000_000)
        .sort((a, b) => b.population - a.population)
        .slice(0, 8);
    }

    return allCities
      .filter(
        (c) =>
          c.city.toLowerCase().includes(q) ||
          c.state_name.toLowerCase().includes(q) ||
          c.state_code.toLowerCase() === q ||
          (c.leader_name && c.leader_name.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [query, allCities]);

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200">
        <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center text-white text-base"
              style={{
                background: "#1a2540",
                fontFamily: "var(--font-serif)",
              }}
            >
              C
            </div>
            <span
              className="text-lg font-medium tracking-tight group-hover:text-slate-700 transition"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              CivicGrid
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm text-slate-500">
            <a
              href="https://github.com/Kwamib/civicgrid-api"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 transition hidden sm:inline"
            >
              API
            </a>
            <a
              href="https://github.com/Kwamib/civicgrid-api#readme"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 transition hidden sm:inline"
            >
              Docs
            </a>
            <a
              href="mailto:hello@civicgrid.org?subject=API Key Request"
              className="text-white text-xs font-medium px-3.5 py-1.5 rounded-md hover:opacity-90 transition"
              style={{ background: "#1a2540" }}
            >
              Get key
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section
        className="pt-12 md:pt-16 pb-8"
        style={{
          background: "linear-gradient(180deg, #fafbfc 0%, #ffffff 100%)",
        }}
      >
        <div className="mx-auto max-w-3xl px-6">
          {/* Status badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs mb-6">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            <span className="text-emerald-700 font-medium">
              api.civicgrid.org
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500">
              {allCities.length > 0 ? allCities.length : "3,063"} cities live
            </span>
          </div>

          <h1
            className="text-5xl md:text-6xl font-normal leading-[1] tracking-tight mb-5"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Every US mayor.
            <br />
            <span className="italic" style={{ color: "#1a2540" }}>
              One search away.
            </span>
          </h1>

          <p className="text-base md:text-lg text-slate-500 leading-relaxed mb-8 max-w-lg">
            A clean REST API for every US mayor and city government. Built for
            newsrooms, civic tech, and gov affairs teams.
          </p>

          {/* Search box */}
          <div className="relative mb-3">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
              />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try: New York, Karen Bass, or Texas..."
              className="w-full pl-12 pr-12 py-4 text-base border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition shadow-sm"
              autoFocus
            />
            {query && (
              <button
                onClick={handleClear}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Chips */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setQuery(s)}
                className="text-xs px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-600 hover:border-slate-400 hover:text-slate-900 transition"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Results */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {loading && (
              <div className="px-4 py-8 text-sm text-slate-500 text-center">
                Loading data from api.civicgrid.org...
              </div>
            )}

            {error && (
              <div className="px-4 py-8 text-sm text-red-600 text-center">
                Couldn&apos;t reach API: {error}
              </div>
            )}

            {!loading && !error && query.trim() && results.length === 0 && (
              <div className="px-4 py-8 text-sm text-slate-500 text-center">
                No results for &ldquo;{query}&rdquo;
              </div>
            )}

            {!loading && !error && !query.trim() && (
              <div className="px-4 py-8 text-sm text-slate-500 text-center">
                Type to search {allCities.length} US cities
              </div>
            )}

            {results.map((c, i) => (
              <Link
                key={c.id}
                href={`/cities/${citySlug(c.city, c.state_code)}`}
                className={`flex items-center justify-between px-4 py-3.5 ${
                  i !== results.length - 1 ? "border-b border-slate-200" : ""
                } hover:bg-slate-50 transition cursor-pointer group`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium flex-shrink-0"
                    style={{ background: "#eff3f9", color: "#1a2540" }}
                  >
                    {getInitials(c.leader_name)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate group-hover:text-slate-900">
                      {c.leader_name || "—"}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate">
                      {c.leader_title || "Mayor"} of {c.city}, {c.state_code}
                      {c.leader_year_elected
                        ? ` · since ${c.leader_year_elected}`
                        : ""}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <PartyBadge party={c.leader_party} />
                  <span className="text-xs text-slate-400 hidden sm:inline">
                    {formatPop(c.population)}
                  </span>
                  <svg
                    className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>

          {!loading && !error && (
            <div className="text-xs text-slate-400 mt-2 text-right">
              {results.length > 0
                ? `${results.length} of ${allCities.length} cities · powered by api.civicgrid.org`
                : `${allCities.length} cities loaded · powered by api.civicgrid.org`}
            </div>
          )}
        </div>
      </section>

      {/* What you can build */}
      <section className="py-12 bg-slate-50 border-y border-slate-200">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-xs text-slate-500 tracking-widest uppercase font-medium mb-5">
            What you can build
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UseCaseCard
              icon="📰"
              title="Newsrooms"
              body="Local journalism with real-time leader data and contact info"
            />
            <UseCaseCard
              icon="⚡"
              title="Civic tech"
              body="Apps that connect citizens to local government decision-makers"
            />
            <UseCaseCard
              icon="🎯"
              title="Gov affairs"
              body="Track elected officials across all 50 states and 3,063 cities"
            />
          </div>
        </div>
      </section>

      {/* Developer section */}
      <section className="py-12">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-xs text-slate-500 tracking-widest uppercase font-medium mb-3">
            For developers
          </div>
          <p className="text-base text-slate-600 leading-relaxed mb-5 max-w-xl">
            Same data, REST API. Free tier includes 10,000 requests/month. No
            credit card required.
          </p>

          <div
            className="rounded-xl p-5 text-xs leading-relaxed overflow-x-auto mb-6 shadow-sm"
            style={{
              background: "#1a2540",
              color: "#e8eef5",
              fontFamily: "var(--font-mono)",
            }}
          >
            <div style={{ color: "#6b7a99" }}>
              $ curl https://api.civicgrid.org/cities?state=CA \
            </div>
            <div style={{ color: "#6b7a99" }}>
              {"    "}-H &quot;Authorization: Bearer cg_live_...&quot;
            </div>
            <div style={{ color: "#4ade80", marginTop: 8 }}>200 OK</div>
            <div style={{ color: "#a8c5e8", marginTop: 4 }}>
              {`{"data": [{"city": "Los Angeles",`}
            </div>
            <div style={{ color: "#a8c5e8" }}>
              {` "leader_name": "Karen Bass",`}
            </div>
            <div style={{ color: "#a8c5e8" }}>
              {` "leader_party": "Democrat",`}
            </div>
            <div style={{ color: "#a8c5e8" }}>{` "population": 3820914 }]}`}</div>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="mailto:hello@civicgrid.org?subject=API Key Request&body=Hi, I'd like an API key for CivicGrid."
              className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-medium text-white hover:opacity-90 transition"
              style={{ background: "#1a2540" }}
            >
              Get API key →
            </a>
            <a
              href="https://github.com/Kwamib/civicgrid-api#readme"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-medium border border-slate-200 hover:bg-slate-50 transition"
            >
              Read docs
            </a>
          </div>
        </div>
      </section>

      {/* Stats banner */}
      <section className="py-10" style={{ background: "#1a2540" }}>
        <div className="mx-auto max-w-3xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white">
            <Stat value="3,063" label="cities tracked" />
            <Stat value="50" label="states covered" />
            <Stat value="<100ms" label="avg response" />
            <Stat value="99.9%" label="uptime SLA" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6">
        <div className="mx-auto max-w-3xl px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-400">
          <div>© 2026 CivicGrid · Built quietly. Shipped loudly.</div>
          <div className="flex gap-5">
            <a
              href="https://github.com/Kwamib"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-700 transition"
            >
              GitHub
            </a>
            <a
              href="https://kwamib.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-700 transition"
            >
              Made by Kwame
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function UseCaseCard({
  icon,
  title,
  body,
}: {
  icon: string;
  title: string;
  body: string;
}) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200">
      <div className="text-2xl mb-3">{icon}</div>
      <div className="text-sm font-medium mb-1">{title}</div>
      <div className="text-xs text-slate-500 leading-relaxed">{body}</div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div
        className="text-3xl md:text-4xl font-normal leading-none mb-1"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {value}
      </div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}

function PartyBadge({ party }: { party: string }) {
  if (!party) return null;
  const p = party.toLowerCase();
  let bg = "#f1f5f9";
  let fg = "#475569";

  if (p.includes("democrat")) {
    bg = "#eff6ff";
    fg = "#1e40af";
  } else if (p.includes("republican")) {
    bg = "#fef2f2";
    fg = "#991b1b";
  } else if (p.includes("independent")) {
    bg = "#fdf4ff";
    fg = "#86198f";
  }

  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded font-medium whitespace-nowrap"
      style={{ background: bg, color: fg }}
    >
      {party}
    </span>
  );
}

function getInitials(name: string): string {
  if (!name) return "—";
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatPop(n: number): string {
  if (!n) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1000)}K`;
  return String(n);
}
