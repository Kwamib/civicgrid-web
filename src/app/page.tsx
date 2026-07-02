import Link from "next/link";
import { Header } from "@/components/Header";
import { BetaNotice } from "@/components/BetaNotice";
import { CitySearch } from "@/components/CitySearch";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />
      <BetaNotice />

      <CitySearch />

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
            <Link
              href="/login"
              className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-medium text-white hover:opacity-90 transition"
              style={{ background: "#1a2540" }}
            >
              Get API key →
            </Link>
            <Link
              href="https://github.com/Kwamib/civicgrid-api#readme"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-medium border border-slate-200 hover:bg-slate-50 transition"
            >
              Read docs
            </Link>
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
            <Link
              href="https://github.com/Kwamib"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-700 transition"
            >
              GitHub
            </Link>
            <Link
              href="https://kwamib.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-700 transition"
            >
              Made by Kwame
            </Link>
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