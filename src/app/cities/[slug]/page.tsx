import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { citySlug } from "@/lib/slug";
import { getAllCities, getCityHistory, type City, type CityHistory } from "@/lib/cities";
import {
  displayHost,
  formatDate,
  formatPopulation,
  governanceLabel,
  safeHttpUrl,
  verificationSummary,
} from "@/lib/format";
import { Header } from "@/components/Header";
import { BetaNotice } from "@/components/BetaNotice";
import { Footer } from "@/components/Footer";
import { Card, CodeBlock, Eyebrow, StatusBadge } from "@/components/ui";

export const revalidate = 3600;

// Leader roles (API migration 008). Optional: older responses omit them.
type AdminFields = { administrator_name?: string | null; administrator_title?: string | null };
type RoleField = { role?: "chief_executive" | "chief_administrator" | null };

async function getCityBySlug(slug: string): Promise<City | null> {
  const all = await getAllCities();
  return all.find((c) => citySlug(c.city, c.state_code) === slug) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const city = await getCityBySlug(slug);
  if (!city) return { title: "City not found · CivicGrid" };

  const place = `${city.city}, ${city.state_code}`;
  const title = city.leader_name
    ? `${city.leader_name}, ${city.leader_title || "leader"} of ${place} · CivicGrid`
    : `${place} city leadership · CivicGrid`;
  const parts = [
    city.leader_name
      ? `${city.leader_name} is listed as ${city.leader_title || "the top official"} of ${city.city}, ${city.state_name}.`
      : `Leadership record for ${city.city}, ${city.state_name}.`,
    city.population != null ? `Population ${city.population.toLocaleString("en-US")}.` : null,
    formatDate(city.leader_last_verified_at)
      ? `Last verified ${formatDate(city.leader_last_verified_at)}.`
      : null,
  ];
  const description = parts.filter(Boolean).join(" ");

  return {
    title,
    description,
    openGraph: {
      title: city.leader_name ? `${city.leader_name} · ${place}` : place,
      description,
      url: `https://www.civicgrid.org/cities/${slug}`,
      siteName: "CivicGrid",
      type: "website",
    },
  };
}

export default async function CityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = await getCityBySlug(slug);
  if (!found) notFound();
  const city = found as City & AdminFields;

  const history = await getCityHistory(city.id);
  const v = verificationSummary(city);
  const verified = formatDate(city.leader_last_verified_at);
  const checked = formatDate(city.last_checked_at);
  const sourceUrl = safeHttpUrl(city.verification_source_url);
  const officialPage = safeHttpUrl(city.official_leader_page);
  const cityWebsite = safeHttpUrl(city.url);
  const gov = governanceLabel(city.governance_type);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <BetaNotice />
      <main id="main" className="mx-auto w-full max-w-[1200px] flex-1 px-4 pb-14 pt-6 sm:px-6 lg:px-8">
        <Link href="/" className="text-sm text-cobalt hover:underline">
          ← Back to city explorer
        </Link>

        <div className="mb-8 mt-6">
          <Eyebrow>City profile · {city.city_type || "City"}</Eyebrow>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="font-serif text-[32px] font-bold leading-[1.2] tracking-[-1px] text-ink sm:text-[42px]">
              {city.city}, {city.state_name}
            </h1>
            <StatusBadge tone={v.tone}>{v.label}</StatusBadge>
          </div>
          <p className="mt-3 text-base text-muted sm:text-lg">
            Who leads {city.city}, with the evidence behind the record.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr] [&>*]:min-w-0">
          <Card>
            <h2 className="mb-5 font-serif text-[29px] text-ink font-bold leading-[1.2]">City leadership</h2>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
              <Def term="Leader" value={city.leader_name || "No leader on record"} />
              <Def term="Role" value={city.leader_title || "Title not recorded"} />
              {city.administrator_name ? (
                <Def
                  term={city.administrator_title || "Administrator"}
                  value={city.administrator_name}
                  note="Appointed to run day-to-day operations"
                />
              ) : null}
              {gov ? <Def term="Form of government" value={gov} /> : null}
              {city.leader_party ? <Def term="Party" value={city.leader_party} /> : null}
              <Def
                term="Population"
                value={formatPopulation(city.population)}
                note={city.population != null ? "Census Bureau estimate" : "No population figure on file"}
              />
              <Def
                term="Last verified"
                value={verified ?? "Not yet verified"}
                note={
                  verified
                    ? city.last_verified_method === "human"
                      ? "Confirmed by a reviewer against a source"
                      : city.last_verified_method === "automated"
                        ? "Matched the official page in an automated check"
                        : undefined
                    : "Not confirmed against an official source yet"
                }
              />
              <Def
                term="Last checked"
                value={checked ?? "Not available"}
                note={
                  checked
                    ? city.last_check_result === "check_failed"
                      ? "The check couldn't read the source; the record was kept"
                      : city.last_check_result === "under_review"
                        ? "The check found a possible change; it is being reviewed"
                        : "The check matched the published record"
                    : undefined
                }
              />
            </dl>

            {city.last_check_result === "under_review" ? (
              <Callout>
                A possible leadership change for {city.city} is waiting for review. The record above stays published
                until a reviewer confirms the change against an official source.
              </Callout>
            ) : !verified ? (
              <Callout>
                This record hasn&apos;t been confirmed against an official source yet. Treat it as unverified.
              </Callout>
            ) : null}
          </Card>

          <Card>
            <h2 className="mb-4 font-serif text-[22px] text-ink font-bold leading-[1.2]">Source &amp; verification</h2>
            <ul className="space-y-3 text-sm">
              <SourceLink label="Verification source" href={sourceUrl} empty="No source recorded for the last verification" />
              <SourceLink label="Official leadership page" href={officialPage} empty="Not found yet" />
              <SourceLink label="City website" href={cityWebsite} empty="Not on file" />
            </ul>
            <p className="mt-5 text-[13px] leading-relaxed text-muted">
              &ldquo;Last checked&rdquo; is when we last looked at the source. &ldquo;Last verified&rdquo; is when the
              record was last confirmed. A page we couldn&apos;t read never counts as a verification.
            </p>
            <div className="mt-5 flex flex-col gap-2 border-t border-line pt-4 text-sm">
              <Link href={`/correction?city=${encodeURIComponent(slug)}`} className="text-cobalt hover:underline">
                Suggest a correction
              </Link>
              <Link href="/methodology" className="text-cobalt hover:underline">
                How records are checked
              </Link>
            </div>
          </Card>
        </div>

        {history ? <HistoryCard history={history} /> : null}

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Card>
            <h2 className="mb-1 font-serif text-[22px] text-ink font-bold leading-[1.2]">Demographics</h2>
            <p className="mb-4 text-[13px] text-muted">Census Bureau data for the city</p>
            <DataList
              items={[
                ["Population", city.population != null ? city.population.toLocaleString("en-US") : null],
                ["Median household income", city.median_household_income ? `$${city.median_household_income.toLocaleString("en-US")}` : null],
                ["Median age", city.median_age ? String(city.median_age) : null],
                ["Land area", city.land_area_sq_mi ? `${city.land_area_sq_mi.toLocaleString("en-US")} sq mi` : null],
                ["Population density", city.population_density ? `${city.population_density.toLocaleString("en-US")} per sq mi` : null],
                ["County", city.county],
                ["Metro area", city.metro_area],
              ]}
            />
          </Card>
          <Card>
            <h2 className="mb-1 font-serif text-[22px] text-ink font-bold leading-[1.2]">City government</h2>
            <p className="mb-4 text-[13px] text-muted">Budget and contact</p>
            <DataList
              items={[
                ["Annual budget", city.city_budget_text || null],
                ["City hall phone", city.city_hall_phone],
                [
                  "Official website",
                  cityWebsite ? (
                    <a href={cityWebsite} target="_blank" rel="noopener noreferrer" className="text-cobalt hover:underline">
                      {displayHost(cityWebsite)} ↗
                    </a>
                  ) : null,
                ],
              ]}
            />
          </Card>
        </div>

        <section className="mt-5 grid items-center gap-6 rounded-lg bg-navy p-6 text-white sm:p-8 lg:grid-cols-[1fr_1.2fr] [&>*]:min-w-0">
          <div>
            <h2 className="font-serif text-[29px] font-bold leading-[1.2]">Use this record in your app</h2>
            <p className="mt-2 text-[15px] text-[#c3d4e6]">
              The same leadership and verification fields are available from the API.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/developers" className="inline-flex h-11 items-center rounded-md bg-cobalt px-5 text-sm font-semibold text-white hover:bg-cobalt-dark">
                API docs
              </Link>
              <Link href="/dashboard" className="inline-flex h-11 items-center rounded-md border border-[#58718b] px-5 text-sm font-semibold text-white hover:bg-white/10">
                Get API key
              </Link>
            </div>
          </div>
          <CodeBlock>{`curl https://api.civicgrid.org/cities/${city.id} \\
  -H "Authorization: Bearer cg_live_..."`}</CodeBlock>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Def({ term, value, note }: { term: string; value: ReactNode; note?: string }) {
  return (
    <div>
      <dt className="text-xs text-muted">{term}</dt>
      <dd className="mt-0.5 text-base font-semibold text-ink">{value}</dd>
      {note ? <dd className="mt-0.5 text-xs text-muted">{note}</dd> : null}
    </div>
  );
}

function Callout({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 rounded-md border border-[#d5e4fa] bg-[#f1f6ff] px-4 py-3 text-sm leading-relaxed text-[#2f4b6b]">
      {children}
    </div>
  );
}

function SourceLink({ label, href, empty }: { label: string; href: string | null; empty: string }) {
  return (
    <li>
      <div className="text-xs text-muted">{label}</div>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="break-all text-cobalt hover:underline">
          {displayHost(href)} ↗
        </a>
      ) : (
        <div className="text-muted">{empty}</div>
      )}
    </li>
  );
}

function DataList({ items }: { items: [string, ReactNode][] }) {
  const shown = items.filter(([, v]) => v !== null && v !== undefined && v !== "");
  if (shown.length === 0) return <p className="text-sm text-muted">Not available.</p>;
  return (
    <dl className="divide-y divide-[#eef2f6]">
      {shown.map(([k, v]) => (
        <div key={k} className="flex items-baseline justify-between gap-4 py-2.5">
          <dt className="text-sm text-muted">{k}</dt>
          <dd className="tabular truncate text-right text-sm font-medium text-ink">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function HistoryCard({ history }: { history: CityHistory }) {
  const { leadership_history: leaders, published_changes: changes } = history;
  return (
    <Card className="mt-5">
      <h2 className="mb-1 font-serif text-[29px] text-ink font-bold leading-[1.2]">Record history</h2>
      <p className="mb-5 text-[13px] text-muted">
        Published records only. Possible changes still under review are not shown here.
      </p>
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 text-sm font-semibold text-ink">Leaders on record</h3>
          {leaders.length === 0 ? (
            <p className="text-sm text-muted">No leaders recorded.</p>
          ) : (
            <ol className="ml-2 border-l-2 border-[#d9e6f7] pl-5">
              {leaders.map((l) => (
                <li key={l.id} className="relative pb-5 last:pb-0">
                  <span aria-hidden="true" className={`absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-white ${l.is_current ? "bg-cobalt" : "bg-[#b9c8d9]"}`} />
                  <div className="text-[15px] font-semibold text-ink">
                    {l.full_name}{" "}
                    <span className="ml-1 text-xs font-normal text-muted">
                      {l.is_current ? "Current" : "Former"}
                      {(l as typeof l & RoleField).role === "chief_administrator" ? " · Administrator" : ""}
                    </span>
                  </div>
                  <div className="text-[13px] text-muted">
                    {l.leader_title || "Title not recorded"}
                    {formatDate(l.recorded_at) ? ` · added ${formatDate(l.recorded_at)}` : ""}
                    {formatDate(l.last_verified_at) ? ` · verified ${formatDate(l.last_verified_at)}` : ""}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold text-ink">Reviewed changes</h3>
          {changes.length === 0 ? (
            <p className="text-sm text-muted">No reviewer-published changes yet.</p>
          ) : (
            <ul className="space-y-3">
              {changes.map((ch, i) => {
                const src = safeHttpUrl(ch.source_url);
                return (
                  <li key={i} className="rounded-md border border-line px-4 py-3 text-sm">
                    <div className="text-xs text-muted">
                      {formatDate(ch.created_at)} · {ch.action === "correct" ? "Corrected by reviewer" : "Accepted by reviewer"}
                    </div>
                    <div className="mt-1 text-ink">
                      {ch.before_name ? <span className="text-muted line-through decoration-[#b9c8d9]">{ch.before_name}</span> : <span className="text-muted">No prior leader</span>}
                      <span aria-hidden="true" className="mx-2 text-muted">→</span>
                      <span className="sr-only"> replaced by </span>
                      <span className="font-semibold">{ch.after_name}</span>
                      {ch.after_title ? <span className="text-muted">, {ch.after_title}</span> : null}
                    </div>
                    {src ? (
                      <a href={src} target="_blank" rel="noopener noreferrer" className="mt-1 block truncate text-xs text-cobalt hover:underline">
                        Source: {displayHost(src)} ↗
                      </a>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </Card>
  );
}
