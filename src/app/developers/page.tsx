import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CodeBlock, PageHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "API & docs · CivicGrid",
  description:
    "CivicGrid REST API reference: endpoints, authentication, rate limits, and the verification fields on every city record.",
};

const ENDPOINTS: { method: string; path: string; desc: string; paid?: boolean }[] = [
  { method: "GET", path: "/cities", desc: "Cities with their current leader. Filters: state, city_type, min_pop, max_pop, search. Paginate with limit and offset (up to 25 per page on Free, 500 on paid tiers)." },
  { method: "GET", path: "/cities/all", desc: "Every city with its current leader in one response.", paid: true },
  { method: "GET", path: "/cities/{id}", desc: "One city with provenance, its published leadership history, and reviewer-published changes." },
  { method: "GET", path: "/leaders/current", desc: "Current leaders. Filters: party, state. Paginate with limit and offset (up to 25 per page on Free)." },
  { method: "GET", path: "/leaders/export", desc: "Every leader, current and former, grouped by city.", paid: true },
  { method: "GET", path: "/stats", desc: "Aggregate counts." },
  { method: "GET", path: "/stats/states", desc: "Per-state city counts and population." },
  { method: "GET", path: "/stats/states/{state_code}", desc: "One state's aggregates." },
  { method: "GET", path: "/health", desc: "Liveness and database readiness. No key required." },
];

const FIELDS: { name: string; desc: string; isNew?: boolean }[] = [
  { name: "city, state_code, state_name, county", desc: "Where the city is." },
  { name: "population", desc: "Census Bureau estimate. null when no figure is on file; 0 is a real value." },
  { name: "leader_name, leader_title", desc: "The current published leader and their exact title, e.g. Mayor or Village President." },
  { name: "governance_type", desc: "mayor, council_manager, select_board, town_administrator, commission, unknown, or null if not classified.", isNew: true },
  { name: "leader_last_verified_at", desc: "When the current leader was last confirmed against a source. null if never.", isNew: true },
  { name: "last_verified_method", desc: "human (a reviewer confirmed it) or automated (matched the official page).", isNew: true },
  { name: "verification_source_url", desc: "The source used for that confirmation.", isNew: true },
  { name: "last_checked_at", desc: "The latest check attempt of any outcome. A failed check never moves leader_last_verified_at.", isNew: true },
  { name: "last_check_result", desc: "confirmed, under_review (a possible change awaits review), or check_failed.", isNew: true },
  { name: "official_leader_page", desc: "The city's official leadership page, when one has been found.", isNew: true },
];

export default function DevelopersPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main id="main" className="mx-auto w-full max-w-[1200px] flex-1 px-4 pb-14 pt-10 sm:px-6 lg:px-8">
        <PageHeading
          eyebrow="Developer documentation"
          title="Civic data, without the scraping."
          intro="A read-only REST API for US city leadership. Every request uses an API key from your dashboard."
        />

        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr] [&>*]:min-w-0">
          <Card>
            <h2 className="mb-3 font-serif text-[29px] text-ink font-bold leading-[1.2]">Quick start</h2>
            <ol className="mb-5 list-decimal space-y-1.5 pl-5 text-[15px] text-muted">
              <li><Link href="/login" className="text-cobalt hover:underline">Sign in</Link> and create a key on your dashboard.</li>
              <li>Send it as a bearer token on every request.</li>
              <li>Read <code className="font-mono text-[13px] text-ink">pagination.total</code> to page through results.</li>
            </ol>
            <CodeBlock label="Example request (replace the key with your own)">{`curl "https://api.civicgrid.org/cities?state=MD&limit=10" \\
  -H "Authorization: Bearer cg_live_YOUR_KEY"`}</CodeBlock>
            <p className="mt-3 text-xs text-muted">
              Interactive OpenAPI reference:{" "}
              <a href="https://api.civicgrid.org/docs" target="_blank" rel="noopener noreferrer" className="text-cobalt hover:underline">api.civicgrid.org/docs ↗</a>
            </p>
          </Card>

          <Card className="bg-panel">
            <h2 className="mb-3 font-serif text-[22px] text-ink font-bold leading-[1.2]">Rate limits</h2>
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] uppercase tracking-[0.04em] text-muted">
                <tr><th className="py-2 font-semibold">Tier</th><th className="py-2 font-semibold">Per day</th><th className="py-2 font-semibold">Per minute</th><th className="py-2 font-semibold">Full export</th></tr>
              </thead>
              <tbody className="tabular text-ink">
                <tr className="border-t border-line"><td className="py-2">Free</td><td>100</td><td>10</td><td>No</td></tr>
                <tr className="border-t border-line"><td className="py-2">Starter</td><td>10,000</td><td>100</td><td>Yes</td></tr>
                <tr className="border-t border-line"><td className="py-2">Pro</td><td>100,000</td><td>500</td><td>Yes</td></tr>
              </tbody>
            </table>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              Day limits are a rolling 24-hour window. Over the limit, requests return HTTP 429 with a retry time. Full-export endpoints return HTTP 403 with <code className="font-mono">upgrade_required</code> on the Free tier.
            </p>
          </Card>
        </div>

        <Card className="mt-5">
          <h2 className="mb-4 font-serif text-[29px] text-ink font-bold leading-[1.2]">Endpoints</h2>
          <ul className="divide-y divide-line">
            {ENDPOINTS.map((e) => (
              <li key={e.path} className="grid gap-1 py-3 sm:grid-cols-[260px_1fr] sm:gap-4">
                <code className="font-mono text-[13px] text-ink">
                  <span className="mr-2 rounded bg-[#e9f2ff] px-1.5 py-0.5 text-[11px] font-semibold text-cobalt">{e.method}</span>
                  {e.path}
                  {e.paid ? <span className="ml-2 rounded bg-[#fff2d7] px-1.5 py-0.5 font-sans text-[10px] font-semibold text-[#7a5715]">Starter &amp; Pro</span> : null}
                </code>
                <span className="text-sm text-muted">{e.desc}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="mt-5">
          <h2 className="mb-1 font-serif text-[29px] text-ink font-bold leading-[1.2]">City record fields</h2>
          <p className="mb-4 text-sm text-muted">
            Returned by /cities and /cities/all. Fields marked <span className="rounded bg-[#e7f4ee] px-1.5 py-0.5 text-[11px] font-semibold text-[#1d6047]">verification</span> tell you how fresh a record is.
          </p>
          <dl className="divide-y divide-line">
            {FIELDS.map((f) => (
              <div key={f.name} className="grid gap-1 py-3 sm:grid-cols-[300px_1fr] sm:gap-4">
                <dt className="font-mono text-[13px] text-ink">
                  {f.name}
                  {f.isNew ? <span className="ml-2 rounded bg-[#e7f4ee] px-1.5 py-0.5 font-sans text-[10px] font-semibold text-[#1d6047]">verification</span> : null}
                </dt>
                <dd className="text-sm text-muted">{f.desc}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
