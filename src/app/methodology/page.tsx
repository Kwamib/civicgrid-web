import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Sources & methodology · CivicGrid",
  description:
    "How CivicGrid finds official sources, checks city leadership records, and keeps reviewers in charge of every published change.",
};

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="grid gap-3 border-t border-line py-7 sm:grid-cols-[56px_1fr]">
      <div className="font-serif text-[29px] text-cobalt font-bold leading-[1.2]" aria-hidden="true">{n}</div>
      <div>
        <h2 className="font-serif text-[29px] text-ink font-bold leading-[1.2]">{title}</h2>
        <div className="mt-2 space-y-3 text-[15px] leading-relaxed text-muted">{children}</div>
      </div>
    </section>
  );
}

export default function MethodologyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main id="main" className="mx-auto w-full max-w-[850px] flex-1 px-4 pb-14 pt-10 sm:px-6">
        <PageHeading
          eyebrow="Sources & methodology"
          title="Evidence before confidence."
          intro="How a city leadership record gets into CivicGrid, how it is checked, and what the dates on each profile mean."
        />

        <Step n={1} title="Find each city's official source">
          <p>
            For every city we look for the official page that names its leader, starting from the city&apos;s own
            website. Candidate sites must be government domains (.gov or .state.us) or show clear signs of being a
            municipal site, and must name the right state. Same-name cities in different states are a known trap,
            so the state is checked on every page.
          </p>
          <p>
            Not every city has a findable leadership page. Some sites block automated access and some towns have
            no mayor at all. Those cities stay listed; their profiles say what is missing.
          </p>
        </Step>

        <Step n={2} title="Check the page, not the web">
          <p>
            A check fetches the official page and skips it if nothing meaningful changed since the last check.
            Otherwise a language model running on our own hardware reads the page and returns the officeholder&apos;s
            name. The name must appear word for word on the page, or it is thrown away. The model never decides
            what gets published.
          </p>
        </Step>

        <Step n={3} title="A reviewer decides what changes">
          <p>
            When a check finds a different name or title, it creates a <em>finding</em>, not a change. Findings go to
            a restricted review queue that shows the current record, the proposed one, and the source side by side.
            A reviewer then accepts it, corrects it, dismisses it, or asks for the source to be re-checked.
          </p>
          <p>
            Every decision is written to an append-only audit log with who made it, why, and the before and after
            values. If the record changed while a finding was waiting, the finding can&apos;t be applied until a
            reviewer looks again.
          </p>
        </Step>

        <Step n={4} title="Two dates, two meanings">
          <ul className="list-disc space-y-2 pl-5">
            <li><strong className="text-ink">Last checked</strong> is when we last looked at the source, whatever happened.</li>
            <li><strong className="text-ink">Last verified</strong> is when the published leader was last confirmed against a source, either by a matching check or by a reviewer.</li>
          </ul>
          <p>
            A source that fails to load never counts as a verification, and it never erases a record. The previous
            record stays published until there is evidence to change it.
          </p>
        </Step>

        <Step n={5} title="Known limits">
          <ul className="list-disc space-y-2 pl-5">
            <li>An official leadership page has been found for about half of the cities so far. Coverage is growing.</li>
            <li>Checks run in batches; a regular weekly schedule is being set up.</li>
            <li>Population figures are Census Bureau estimates. The release year isn&apos;t yet stored with each record.</li>
            <li>Party is shown only where a record already carries it. Many city offices are nonpartisan.</li>
          </ul>
        </Step>

        <div className="mt-4 rounded-md border border-[#d5e4fa] bg-[#f1f6ff] p-5 text-[15px] text-[#2f4b6b]">
          See something wrong? <Link href="/correction" className="font-semibold text-cobalt hover:underline">Report a correction</Link> with
          a link to the official source and it will go through the same review.
        </div>
      </main>
      <Footer />
    </div>
  );
}
