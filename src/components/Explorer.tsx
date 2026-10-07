"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { CitySummary } from "@/lib/cities";
import { citySlug } from "@/lib/slug";
import {
  POPULATION_BANDS,
  SORT_OPTIONS,
  compareCities,
  displayHost,
  formatDate,
  formatPopulation,
  inPopulationBand,
  safeHttpUrl,
  verificationSummary,
  type PopulationBand,
  type SortKey,
} from "@/lib/format";
import { StatusBadge } from "@/components/ui";

const PAGE_SIZE = 10;

/** Relevance score for a search; lower is better, null = no match. */
function matchScore(c: CitySummary, q: string): number | null {
  const city = c.city.toLowerCase();
  const stateCode = c.state_code.toLowerCase();
  const stateName = (c.state_name || "").toLowerCase();
  const leader = (c.leader_name || "").toLowerCase();

  // "Laurel, MD" or "Laurel, Maryland": city part must match AND state must match.
  if (q.includes(",")) {
    const [cityPart, statePart] = q.split(",").map((x) => x.trim());
    if (statePart && !(stateCode === statePart || stateName.startsWith(statePart))) return null;
    if (!city.includes(cityPart)) return null;
    return city === cityPart ? 0 : city.startsWith(cityPart) ? 1 : 2;
  }
  if (city === q) return 0;
  if (city.startsWith(q)) return 1;
  if (city.includes(q)) return 2;
  if (stateCode === q) return 3;
  if (stateName.includes(q)) return 4;
  if (leader.includes(q)) return 5;
  return null;
}

function pageList(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

export function Explorer() {
  const [all, setAll] = useState<CitySummary[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [query, setQuery] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [band, setBand] = useState<PopulationBand>("");
  const [sort, setSort] = useState<SortKey>("largest");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const deferredQuery = useDeferredValue(query);

  // State is only set in async callbacks, so this is safe to call from an effect.
  const fetchCities = useCallback(() => {
    return fetch("/api/search")
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((json) => {
        setAll(json.data || []);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  function retry() {
    setStatus("loading");
    fetchCities();
  }

  const states = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of all) if (c.state_code) m.set(c.state_code, c.state_name || c.state_code);
    return [...m.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [all]);

  // Filter and sort the FULL dataset first; paginate afterwards.
  const results = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    const cmp = compareCities<CitySummary>(sort);
    const rows: { c: CitySummary; score: number }[] = [];
    for (const c of all) {
      if (stateCode && c.state_code !== stateCode) continue;
      if (!inPopulationBand(c.population, band)) continue;
      const score = q ? matchScore(c, q) : 0;
      if (score === null) continue;
      rows.push({ c, score });
    }
    rows.sort((a, b) => a.score - b.score || cmp(a.c, b.c));
    return rows.map((r) => r.c);
  }, [all, deferredQuery, stateCode, band, sort]);

  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageRows = results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const selected =
    results.find((c) => c.id === selectedId) ?? pageRows[0] ?? null;

  function resetPaging() {
    setPage(1);
  }

  function clearAll() {
    setQuery("");
    setStateCode("");
    setBand("");
    setSort("largest");
    setPage(1);
    setSelectedId(null);
  }

  function select(id: number) {
    setSelectedId(id);
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1279px)").matches) {
      requestAnimationFrame(() =>
        document.getElementById("city-detail")?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    }
  }

  const filtersActive = Boolean(query.trim() || stateCode || band || sort !== "largest");
  const stateLabel = states.find(([code]) => code === stateCode)?.[1];
  const heading = stateLabel ? `Cities in ${stateLabel}` : "All cities";
  const firstShown = results.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const lastShown = Math.min(currentPage * PAGE_SIZE, results.length);

  return (
    <>
      <section className="px-4 pb-7 pt-10 text-center sm:px-6 sm:pt-12">
        <h1 className="font-serif text-[40px] leading-[1.05] tracking-tight text-ink sm:text-[52px]">
          Find the people leading your city.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-muted sm:text-lg">
          Search city governments. Inspect the sources. Build with civic data.
        </p>
        <form
          role="search"
          className="mx-auto mt-7 flex max-w-[880px] gap-2.5"
          onSubmit={(e) => {
            e.preventDefault();
            resetPaging();
          }}
        >
          <label htmlFor="city-search" className="sr-only">
            Search by city, state, or leader
          </label>
          <div className="relative min-w-0 flex-1">
            <svg aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8a9bb0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
            <input
              id="city-search"
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                resetPaging();
              }}
              placeholder="Search a city, leader, or state — e.g. Laurel, MD"
              autoComplete="off"
              className="h-14 w-full rounded-md border border-[#cdd8e5] bg-white pl-12 pr-4 text-base text-ink shadow-sm placeholder:text-[#8a9bb0] focus:border-cobalt focus:outline-none focus:ring-2 focus:ring-cobalt/30"
            />
          </div>
          <button type="submit" className="h-14 rounded-md bg-cobalt px-5 text-sm font-semibold text-white transition hover:bg-cobalt-dark sm:px-7">
            Search
          </button>
        </form>
        <p className="mt-3 text-[13px] text-muted">
          {status === "ready"
            ? `${all.length.toLocaleString("en-US")} US cities · every record shows its source and when it was last verified`
            : "Loading city records…"}
        </p>
      </section>

      <div className="mx-auto grid max-w-[1400px] items-start gap-4 px-4 pb-12 sm:px-6 lg:px-8 md:grid-cols-[200px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_320px]">
        {/* Filters */}
        <aside aria-label="Filters" className="rounded-lg border border-line bg-panel p-5">
          <h2 className="mb-5 font-serif text-[22px] leading-none text-ink">Refine results</h2>
          <div className="grid grid-cols-2 gap-x-3 gap-y-4 md:grid-cols-1">
            <Field label="State" htmlFor="f-state">
              <select id="f-state" value={stateCode} onChange={(e) => { setStateCode(e.target.value); resetPaging(); }} className={selectCls}>
                <option value="">All states</option>
                {states.map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </Field>
            <Field label="Population size" htmlFor="f-pop">
              <select id="f-pop" value={band} onChange={(e) => { setBand(e.target.value as PopulationBand); resetPaging(); }} className={selectCls}>
                {POPULATION_BANDS.map((b) => (
                  <option key={b.value || "all"} value={b.value}>{b.label}</option>
                ))}
              </select>
            </Field>
            <div className="col-span-2 md:col-span-1">
              <Field label="Sort by" htmlFor="f-sort">
                <select id="f-sort" value={sort} onChange={(e) => { setSort(e.target.value as SortKey); resetPaging(); }} className={selectCls}>
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </Field>
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted">
            Population figures are Census Bureau estimates. Cities without a figure stay listed and can be found
            under &ldquo;Population unknown.&rdquo;
          </p>
          {filtersActive ? (
            <button type="button" onClick={clearAll} className="mt-3 text-sm font-medium text-cobalt hover:underline">
              Clear filters
            </button>
          ) : null}
        </aside>

        {/* Results */}
        <section aria-labelledby="results-heading" className="min-w-0 rounded-lg border border-line bg-white p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="results-heading" className="font-serif text-[28px] leading-tight text-ink">{heading}</h2>
            <span className="text-[13px] text-muted" aria-live="polite">
              {status === "ready" ? `${results.length.toLocaleString("en-US")} ${results.length === 1 ? "city" : "cities"}${query.trim() ? " · best matches first" : ""}` : ""}
            </span>
          </div>

          {status === "error" ? (
            <div className="rounded-md border border-[#f0d5d9] bg-[#fbf3f4] px-4 py-8 text-center text-sm text-[#8f4651]">
              City records couldn&apos;t be loaded right now.{" "}
              <button type="button" onClick={retry} className="font-semibold underline">Try again</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm sm:min-w-[520px]">
                <caption className="sr-only">City search results. Select a city to see its details.</caption>
                <thead>
                  <tr className="bg-[#f5f7fb] text-[11px] uppercase tracking-[0.04em] text-muted">
                    <th scope="col" className="px-2 py-3 sm:px-3 font-semibold">City</th>
                    <th scope="col" className="hidden px-2 py-3 sm:px-3 font-semibold sm:table-cell">State</th>
                    <th scope="col" className="px-2 py-3 sm:px-3 font-semibold">Leadership</th>
                    <th scope="col" className="px-2 py-3 sm:px-3 text-right font-semibold">Population</th>
                  </tr>
                </thead>
                <tbody>
                  {status === "loading"
                    ? Array.from({ length: PAGE_SIZE }, (_, i) => (
                        <tr key={i} className="border-b border-line">
                          {[40, 12, 55, 18].map((w, j) => (
                            <td key={j} className={`px-2 py-4 sm:px-3 ${j === 1 ? "hidden sm:table-cell" : ""}`}>
                              <div className="h-3.5 animate-pulse rounded bg-[#e8eef5]" style={{ width: `${w + ((i * 7) % 20)}%` }} />
                            </td>
                          ))}
                        </tr>
                      ))
                    : pageRows.map((c) => {
                        const isSel = selected?.id === c.id;
                        return (
                          <tr
                            key={c.id}
                            onClick={() => select(c.id)}
                            className={`cursor-pointer border-b border-line transition-colors ${isSel ? "bg-[#e9f2ff]" : "hover:bg-[#f4f8ff]"}`}
                          >
                            <td className="px-2 py-3 sm:px-3.5">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); select(c.id); }}
                                aria-pressed={isSel}
                                className="text-left text-[15px] font-semibold text-cobalt hover:underline"
                              >
                                {c.city}
                              </button>
                              <span className="ml-1 text-[13px] text-muted sm:hidden">{c.state_code}</span>
                            </td>
                            <td className="hidden px-2 py-3 sm:px-3.5 text-ink sm:table-cell">{c.state_code}</td>
                            <td className="px-2 py-3 sm:px-3.5">
                              {c.leader_name ? (
                                <>
                                  <span className="block text-ink">{c.leader_name}</span>
                                  <span className="block text-[11px] text-muted">{c.leader_title || "Title not recorded"}</span>
                                </>
                              ) : (
                                <span className="text-muted">No leader on record</span>
                              )}
                            </td>
                            <td className="tabular px-2 py-3.5 sm:px-3 text-right text-ink">
                              {c.population === null || c.population === undefined ? (
                                <span className="text-muted">Unknown</span>
                              ) : (
                                c.population.toLocaleString("en-US")
                              )}
                            </td>
                          </tr>
                        );
                      })}
                </tbody>
              </table>
              {status === "ready" && results.length === 0 ? (
                <div className="px-4 py-12 text-center text-sm text-muted">
                  No cities match{query.trim() ? <> &ldquo;{query.trim()}&rdquo;</> : null}. Try another spelling or state, or{" "}
                  <button type="button" onClick={clearAll} className="font-medium text-cobalt hover:underline">clear all filters</button>.
                </div>
              ) : null}
            </div>
          )}

          {status === "ready" && results.length > 0 ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[13px] text-muted">
                Showing {firstShown.toLocaleString("en-US")}–{lastShown.toLocaleString("en-US")} of {results.length.toLocaleString("en-US")}
              </span>
              <nav aria-label="Pagination" className="flex items-center gap-1">
                <PagerButton disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} label="Previous page">‹</PagerButton>
                {pageList(currentPage, pageCount).map((p, i) =>
                  p === "gap" ? (
                    <span key={`g${i}`} className="px-1 text-muted" aria-hidden="true">…</span>
                  ) : (
                    <PagerButton key={p} active={p === currentPage} onClick={() => setPage(p)} label={`Page ${p}`}>
                      {p}
                    </PagerButton>
                  ),
                )}
                <PagerButton disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} label="Next page">›</PagerButton>
              </nav>
            </div>
          ) : null}
        </section>

        {/* Selected city */}
        <aside
          id="city-detail"
          aria-label="Selected city"
          className="scroll-mt-4 rounded-lg border border-line border-t-[5px] border-t-cobalt bg-white p-5 sm:p-6 md:col-start-2 xl:col-start-auto"
        >
          {selected ? <CityPanel c={selected} /> : (
            <div>
              <h2 className="font-serif text-2xl text-ink">Select a city</h2>
              <p className="mt-2 text-sm text-muted">Choose a result to see its leadership, source, and verification details.</p>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}

const selectCls =
  "h-11 w-full rounded-md border border-[#cdd8e5] bg-white px-3 text-[15px] text-ink focus:border-cobalt focus:outline-none focus:ring-2 focus:ring-cobalt/30";

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-ink">{label}</label>
      {children}
    </div>
  );
}

function PagerButton({ children, onClick, active, disabled, label }: {
  children: React.ReactNode; onClick: () => void; active?: boolean; disabled?: boolean; label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={`tabular h-9 min-w-9 rounded-md border px-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? "border-cobalt bg-cobalt font-semibold text-white" : "border-line bg-white text-ink hover:border-[#b9c8d9]"
      }`}
    >
      {children}
    </button>
  );
}

function CityPanel({ c }: { c: CitySummary }) {
  const v = verificationSummary(c);
  const checked = formatDate(c.last_checked_at);
  const verified = formatDate(c.leader_last_verified_at);
  const source = safeHttpUrl(c.verification_source_url);
  const officialPage = safeHttpUrl(c.official_leader_page);
  const link = source ?? officialPage;
  const href = `/cities/${citySlug(c.city, c.state_code)}`;

  return (
    <div>
      <h2 className="font-serif text-[26px] leading-tight text-ink">
        {c.city}, {c.state_name || c.state_code}
      </h2>
      <p className="mt-1 text-[13px] text-muted">
        Population {formatPopulation(c.population)}
        {c.county ? ` · ${c.county}` : ""}
      </p>

      <PanelSection title="Leadership">
        {c.leader_name ? (
          <>
            <div className="text-base font-semibold text-ink">{c.leader_name}</div>
            <div className="text-[13px] text-muted">{c.leader_title || "Title not recorded"}</div>
          </>
        ) : (
          <div className="text-sm text-muted">No leader on record for this city.</div>
        )}
        <div className="mt-3"><StatusBadge tone={v.tone}>{v.label}</StatusBadge></div>
      </PanelSection>

      <PanelSection title="Source & checks">
        <dl className="grid grid-cols-2 gap-3 text-[13px]">
          <div>
            <dt className="text-muted">Last verified</dt>
            <dd className="font-semibold text-ink">{verified ?? "Not yet"}</dd>
          </div>
          <div>
            <dt className="text-muted">Last checked</dt>
            <dd className="font-semibold text-ink">
              {checked ?? "Not available"}
              {checked && c.last_check_result === "check_failed" ? <span className="block text-[11px] font-normal text-[#8f4651]">Check failed; record kept</span> : null}
            </dd>
          </div>
        </dl>
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" className="mt-3 block truncate text-[13px] text-cobalt hover:underline">
            {source ? "Verification source" : "Official leadership page"}: {displayHost(link)} ↗
          </a>
        ) : (
          <p className="mt-3 text-[13px] text-muted">No source recorded yet.</p>
        )}
      </PanelSection>

      <div className="border-t border-line pt-5">
        <Link href={href} className="flex h-11 w-full items-center justify-center rounded-md bg-cobalt text-sm font-semibold text-white transition hover:bg-cobalt-dark">
          View city profile
        </Link>
        <Link href={`/correction?city=${encodeURIComponent(citySlug(c.city, c.state_code))}`} className="mt-3 block text-center text-[13px] text-cobalt hover:underline">
          Report a correction
        </Link>
      </div>
    </div>
  );
}

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5 border-t border-line pt-4">
      <h3 className="mb-2 text-sm font-semibold text-ink">{title}</h3>
      {children}
    </section>
  );
}
