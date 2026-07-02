"use client";

import { useMemo, useRef, useState } from "react";
import type { City } from "@/lib/cities";

function getInitials(name: string): string {
  if (!name) return "—";
  return name.split(/\s+/).map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
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

export function CityPicker({
  label,
  cities,
  loading,
  selected,
  onSelect,
}: {
  label: string;
  cities: City[];
  loading: boolean;
  selected: City | null;
  onSelect: (city: City | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return cities
      .filter(
        (c) =>
          c.city.toLowerCase().includes(q) ||
          c.state_name.toLowerCase().includes(q) ||
          c.state_code.toLowerCase() === q ||
          (c.leader_name && c.leader_name.toLowerCase().includes(q))
      )
      .slice(0, 6);
  }, [query, cities]);

  if (selected) {
    return (
      <div>
        <label className="text-xs text-slate-500 block mb-1.5">{label}</label>
        <div className="flex items-center justify-between gap-3 border border-slate-300 rounded-lg px-3 py-2.5 bg-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium flex-shrink-0" style={{ background: "#eff3f9", color: "#1a2540" }}>
              {getInitials(selected.leader_name)}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{selected.city}, {selected.state_code}</div>
              <div className="text-xs text-slate-500 truncate">{selected.leader_name || "—"}</div>
            </div>
          </div>
          <button onClick={() => { onSelect(null); setQuery(""); }} className="text-xs text-slate-400 hover:text-slate-700 transition flex-shrink-0">
            change
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="text-xs text-slate-500 block mb-1.5">{label}</label>
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={loading ? "Loading cities..." : "Search a city..."}
          disabled={loading}
          className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
        />
      </div>
      {open && query.trim() && (
        <div className="mt-1.5 bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          {results.length === 0 ? (
            <div className="px-3 py-4 text-xs text-slate-500 text-center">No results for &ldquo;{query}&rdquo;</div>
          ) : (
            results.map((c, i) => (
              <button
                key={c.id}
                onClick={() => { onSelect(c); setOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-left ${i !== results.length - 1 ? "border-b border-slate-100" : ""} hover:bg-slate-50 transition group`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium flex-shrink-0" style={{ background: "#eff3f9", color: "#1a2540" }}>
                    {getInitials(c.leader_name)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{c.city}, {c.state_code}</div>
                    <div className="text-xs text-slate-500 truncate">{c.leader_name || "—"}</div>
                  </div>
                </div>
                <PartyBadge party={c.leader_party} />
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
