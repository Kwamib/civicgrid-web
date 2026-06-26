import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { citySlug } from "@/lib/slug";
import { getAllCities, type City } from "@/lib/cities";
import { Header } from "@/components/Header";

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

  const title = `${city.leader_name}, ${city.leader_title} of ${city.city}, ${city.state_code} · CivicGrid`;
  const description = `${city.leader_name} is the ${city.leader_title} of ${city.city}, ${city.state_name}. Population ${city.population.toLocaleString()}, ${city.leader_party}, elected ${city.leader_year_elected}.`;

  return {
    title,
    description,
    openGraph: {
      title: `${city.leader_name} · ${city.city}, ${city.state_code}`,
      description,
      url: `https://www.civicgrid.org/cities/${slug}`,
      siteName: "CivicGrid",
      type: "website",
    },
  };
}

export default async function CityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const city = await getCityBySlug(slug);

  if (!city) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />

      {/* Back link */}
      <div className="mx-auto max-w-3xl px-6 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to search
        </Link>
      </div>

      {/* Hero */}
      <section
        className="pt-8 pb-12"
        style={{
          background: "linear-gradient(180deg, #fafbfc 0%, #ffffff 100%)",
        }}
      >
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-xs text-slate-500 tracking-wider uppercase font-medium mb-3">
            {city.city_type || "City"} · {city.state_name}
          </div>

          <h1
            className="text-4xl md:text-5xl font-normal leading-[1.1] tracking-tight mb-2"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {city.leader_name}
          </h1>

          <p className="text-lg text-slate-600 mb-6">
            <span className="italic" style={{ color: "#1a2540" }}>
              {city.leader_title || "Mayor"}
            </span>{" "}
            of {city.city}, {city.state_code}
          </p>

          <div className="flex flex-wrap gap-2">
            <PartyBadge party={city.leader_party} />
            {city.leader_year_elected ? (
              <Badge>Elected {city.leader_year_elected}</Badge>
            ) : null}
            {city.leader_next_election ? (
              <Badge>Next election {city.leader_next_election}</Badge>
            ) : null}
          </div>
        </div>
      </section>

      {/* Demographics */}
      <Section title="Demographics" subtitle="Census data for the city">
        <DataGrid
          items={[
            { label: "Population", value: city.population?.toLocaleString() },
            {
              label: "Median household income",
              value: city.median_household_income
                ? `$${city.median_household_income.toLocaleString()}`
                : null,
            },
            {
              label: "Median age",
              value: city.median_age ? city.median_age.toString() : null,
            },
            {
              label: "Land area",
              value: city.land_area_sq_mi
                ? `${city.land_area_sq_mi.toLocaleString()} sq mi`
                : null,
            },
            {
              label: "Population density",
              value: city.population_density
                ? `${city.population_density.toLocaleString()} per sq mi`
                : null,
            },
            { label: "County", value: city.county },
            { label: "Metro area", value: city.metro_area },
          ]}
        />
      </Section>

      {/* Government */}
      <Section title="City government" subtitle="Budget and contact">
        <DataGrid
          items={[
            {
              label: "Annual budget",
              value: city.city_budget_text || null,
            },
            { label: "City hall phone", value: city.city_hall_phone },
            {
              label: "Official website",
              value: city.url ? (
                <a
                  href={city.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:underline truncate"
                  style={{ color: "#1a2540" }}
                >
                  {city.url.replace(/^https?:\/\//, "").replace(/\/$/, "")} →
                </a>
              ) : null,
            },
          ]}
        />
      </Section>

      {/* API teaser */}
      <section className="py-12 bg-slate-50 border-t border-slate-200">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-xs text-slate-500 tracking-widest uppercase font-medium mb-3">
            For developers
          </div>
          <p className="text-base text-slate-600 mb-5">
            Fetch this same data via API:
          </p>

          <div
            className="rounded-xl p-5 text-xs leading-relaxed overflow-x-auto mb-5 shadow-sm"
            style={{
              background: "#1a2540",
              color: "#e8eef5",
              fontFamily: "var(--font-mono)",
            }}
          >
            <div style={{ color: "#6b7a99" }}>
              $ curl https://api.civicgrid.org/cities?state={city.state_code} \
            </div>
            <div style={{ color: "#6b7a99" }}>
              {"    "}-H &quot;Authorization: Bearer cg_live_...&quot;
            </div>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-medium text-white hover:opacity-90 transition"
            style={{ background: "#1a2540" }}
          >
            Get API key →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6">
        <div className="mx-auto max-w-3xl px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-400">
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

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-10 border-t border-slate-200">
      <div className="mx-auto max-w-3xl px-6">
        <h2
          className="text-2xl font-normal mb-1"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {title}
        </h2>
        {subtitle ? (
          <p className="text-sm text-slate-500 mb-6">{subtitle}</p>
        ) : null}
        {children}
      </div>
    </section>
  );
}

function DataGrid({
  items,
}: {
  items: { label: string; value: React.ReactNode }[];
}) {
  const filtered = items.filter((i) => i.value);
  return (
    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
      {filtered.map((item) => (
        <div
          key={item.label}
          className="flex items-baseline justify-between gap-4 border-b border-slate-100 pb-3"
        >
          <dt className="text-sm text-slate-500 flex-shrink-0">
            {item.label}
          </dt>
          <dd className="text-sm font-medium text-right truncate">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs px-2.5 py-1 bg-white border border-slate-200 rounded-full text-slate-600">
      {children}
    </span>
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
      className="text-xs px-2.5 py-1 rounded-full font-medium"
      style={{ background: bg, color: fg }}
    >
      {party}
    </span>
  );
}
