"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CitySummary } from "@/lib/cities";
import { citySlug } from "@/lib/slug";
import {
  POPULATION_BANDS,
  SORT_OPTIONS,
  displayHost,
  formatDate,
  formatPopulation,
  safeHttpUrl,
  verificationSummary,
  type PopulationBand,
  type SortKey,
} from "@/lib/format";
import { StatusBadge } from "@/components/ui";

const PAGE_SIZE = 10;

type SearchResponse = {
  data: CitySummary[];
  total: number;
  page: number;
  pageCount: number;
  datasetCount: number;
  states: [string, string][];
};

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
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [band, setBand] = useState<PopulationBand>("");
  const [sort, setSort] = useState<SortKey>("largest");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  // Debounce typing so each keystroke doesn't hit the server.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 200);
    return () => clearTimeout(t);
  }, [query]);

  // The server filters and sorts the full dataset; only this page comes back.
  const requestKey = new URLSearchParams({
    q: debouncedQuery,
    state: stateCode,
    pop: band,
    sort,
    page: String(page),
    pageSize: String(PAGE_SIZE),
  }).toString();

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`/api/search?${requestKey}`, { signal: ctrl.signal })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((json: SearchResponse) => {
        setResult(json);
        setLoadedKey(requestKey);
        setErrorKey(null);
      })
      .catch((e) => {
        if (e?.name !== "AbortError") setErrorKey(requestKey);
      });
    return () => ctrl.abort();
  }, [requestKey, retryNonce]);

  const status: "loading" | "ready" | "error" =
    errorKey === requestKey ? "error" : result ? "ready" : "loading";
  const refreshing = status === "ready" && loadedKey !== requestKey;
  const states = result?.states ?? [];
  const pageRows = result?.data ?? [];
  const total = result?.total ?? 0;
  const pageCount = result?.pageCount ?? 1;
  const currentPage = result?.page ?? 1;
  const selected = pageRows.find((c) => c.id === selectedId) ?? pageRows[0] ?? null;

  function retry() {
    setRetryNonce((n) => n + 1);
  }

  function resetPaging() {
    setPage(1);
  }

  function clearAll() {
    setQuery("");
    setDebouncedQuery("");
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
  const firstShown = total ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const lastShown = Math.min(currentPage * PAGE_SIZE, total);

  return (
    <>
      <section className="px-4 pb-7 pt-10 text-center sm:px-6 sm:pt-12">
        <h1 className="font-serif text-[32px] font-bold leading-[1.2] tracking-[-1px] text-ink sm:text-[42px]">
          Find the people leading your city.
        </h1>
        <p className="mx-auto mt-0 max-w-xl text-base text-muted sm:text-lg">
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
              className="h-[54px] w-full rounded-md border border-[#cdd8e5] bg-white pl-12 pr-4 text-sm text-ink sm:text-[17px] placeholder:text-[#8a9bb0] focus:border-cobalt focus:outline-none focus:ring-2 focus:ring-cobalt/30"
            />
          </div>
          <button type="submit" className="h-[54px] rounded-md border border-cobalt bg-cobalt px-[15px] text-sm font-semibold text-white hover:brightness-95 sm:px-7">
            Search
          </button>
        </form>
        <p className="mt-3 text-[13px] text-muted">
          {status === "ready"
            ? `${(result?.datasetCount ?? 0).toLocaleString("en-US")} US cities · every record shows its source and when it was last verified`
            : "Loading city records…"}
        </p>
      </section>

      <div className="mx-auto grid max-w-[1400px] items-start gap-4 px-4 pb-12 sm:px-6 lg:px-8 md:grid-cols-[200px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_320px]">
        {/* Filters */}
        <aside aria-label="Filters" className="rounded-lg border border-line bg-panel p-5">
          <h2 className="mb-6 font-serif text-[22px] text-ink font-bold leading-[1.2]">Refine results</h2>
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
            <h2 id="results-heading" className="font-serif text-[29px] text-ink font-bold leading-[1.2]">{heading}</h2>
            <span className="text-[13px] text-muted" aria-live="polite">
              {status === "ready" ? `${total.toLocaleString("en-US")} ${total === 1 ? "city" : "cities"}${debouncedQuery ? " · best matches first" : ""}${refreshing ? " · updating…" : ""}` : ""}
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
                  <tr className="bg-[#f5f7fb] text-[11px] uppercase tracking-[0.4px] text-muted">
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
                              <Link
                                href={`/cities/${citySlug(c.city, c.state_code)}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-left text-[15px] font-semibold text-cobalt hover:underline"
                              >
                                {c.city}
                              </Link>
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
              {status === "ready" && !refreshing && total === 0 ? (
                <div className="px-4 py-12 text-center text-sm text-muted">
                  No cities match{query.trim() ? <> &ldquo;{query.trim()}&rdquo;</> : null}. Try another spelling or state, or{" "}
                  <button type="button" onClick={clearAll} className="font-medium text-cobalt hover:underline">clear all filters</button>.
                </div>
              ) : null}
            </div>
          )}

          {status === "ready" && total > 0 ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[13px] text-muted">
                Showing {firstShown.toLocaleString("en-US")}–{lastShown.toLocaleString("en-US")} of {total.toLocaleString("en-US")}
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
              <h2 className="font-serif text-[22px] text-ink font-bold leading-[1.2]">Select a city</h2>
              <p className="mt-2 text-sm text-muted">Choose a result to see its leadership, source, and verification details.</p>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}

const selectCls =
  "min-h-[44px] w-full rounded-md border border-[#cdd8e5] bg-white px-3 py-[11px] text-[15px] text-ink focus:outline-2 focus:outline-offset-2 focus:outline-cobalt/40";

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-[7px] block text-sm font-semibold text-ink">{label}</label>
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
      <h2 className="font-serif text-[25px] text-ink font-bold leading-[1.2]">
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
