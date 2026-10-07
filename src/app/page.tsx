import Link from "next/link";
import { Header } from "@/components/Header";
import { BetaNotice } from "@/components/BetaNotice";
import { Footer } from "@/components/Footer";
import { Explorer } from "@/components/Explorer";
import { CodeBlock } from "@/components/ui";

const SAMPLE = `curl https://api.civicgrid.org/cities?state=MD \\
  -H "Authorization: Bearer cg_live_..."

# Response shape (abridged)
{
  "data": [{
    "city": "…",
    "state_code": "MD",
    "leader_name": "…",
    "leader_title": "…",
    "population": 0,
    "leader_last_verified_at": "…",
    "verification_source_url": "…"
  }],
  "pagination": { "total": 0, "limit": 50, "offset": 0 }
}`;

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <BetaNotice />
      <main id="main" className="flex-1">
        <Explorer />

        <section className="mx-auto max-w-[1400px] px-4 pb-14 sm:px-6 lg:px-8">
          <div className="grid items-center gap-8 rounded-lg bg-navy p-6 text-white sm:p-8 lg:grid-cols-2 lg:gap-10 [&>*]:min-w-0">
            <div>
              <h2 className="font-serif text-[29px] font-bold leading-[1.2]">The same data, ready for your application.</h2>
              <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-[#c3d4e6]">
                A REST API with a free tier. Every city row carries its verification fields, so your app can show
                how fresh a record is instead of guessing.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/developers" className="inline-flex h-11 items-center rounded-md bg-cobalt px-5 text-sm font-semibold text-white hover:bg-cobalt-dark">
                  Read the API docs
                </Link>
                <Link href="/login" className="inline-flex h-11 items-center rounded-md border border-[#58718b] px-5 text-sm font-semibold text-white hover:bg-white/10">
                  Get an API key
                </Link>
              </div>
            </div>
            <CodeBlock>{SAMPLE}</CodeBlock>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
