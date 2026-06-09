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

export function CitySearch() {
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
    <>
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
            <span className="text-emerald-700 font-medium">api.civicgrid.org</span>
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
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                      {c.leader_year_elected ? ` · since ${c.leader_year_elected}` : ""}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <PartyBadge party={c.leader_party} />
                  <span className="text-xs text-slate-400 hidden sm:inline">
                    {formatPop(c.population)}
                  </span>
                  <svg className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
    </>
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