import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageHeading } from "@/components/ui";
import { CONTACT_EMAIL, LEGAL_UPDATED, LegalSection } from "@/components/LegalSection";
import { OG_IMAGES } from "@/lib/og";

export const metadata: Metadata = {
  title: "Terms of Use · CivicGrid",
  description:
    "The terms for using the CivicGrid website and API: accounts and keys, fair use, how you may use the data, and our limits of responsibility.",
  openGraph: {
    title: "Terms of Use · CivicGrid",
    description: "The terms for using the CivicGrid website and API: accounts and keys, fair use, how you may use the data, and our limits of responsibility.",
    url: "/terms",
    siteName: "CivicGrid",
    type: "website",
    images: OG_IMAGES,
  },
};

const link = "font-semibold text-cobalt hover:underline";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main id="main" className="mx-auto w-full max-w-[850px] flex-1 px-4 pb-14 pt-10 sm:px-6">
        <PageHeading
          eyebrow="Terms of Use"
          title="The ground rules."
          intro={`Last updated ${LEGAL_UPDATED}. By using the CivicGrid website or API you agree to these terms. They are written to be read, so please do.`}
        />

        <LegalSection title="1. The service">
          <p>
            CivicGrid is an independent project operated by Mayowa Babatola (&quot;Kwami&quot;), referred to here as &quot;we&quot;. It provides information
            about the leadership of United States cities through this website and an API. The service is in beta:
            features, coverage, and limits may change as it grows.
          </p>
        </LegalSection>

        <LegalSection title="2. Accounts and API keys">
          <ul className="list-disc space-y-2 pl-5">
            <li>You need an account to get an API key. Give a real email address so we can reach you.</li>
            <li>Keep your keys secret. You are responsible for requests made with your keys. If a key leaks, revoke it from your <Link href="/dashboard" className={link}>dashboard</Link> and create a new one.</li>
            <li>One account per person or organization. Do not create extra accounts or keys to get around your limits.</li>
          </ul>
        </LegalSection>

        <LegalSection title="3. Plans, limits, and fair use">
          <p>
            Each tier has daily and per minute limits, listed on the <Link href="/developers" className={link}>API page</Link>.
            Requests over a limit are refused with HTTP 429. Please cache responses you reuse; city leadership changes
            slowly, so there is rarely a reason to request the same data more than a few times a day.
          </p>
          <p>
            All tiers are currently free. If we introduce paid plans, we will tell you in advance, and we will never
            charge you without your agreement.
          </p>
        </LegalSection>

        <LegalSection title="4. Acceptable use">
          <p>You agree not to:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>overload the service, or try to bypass rate limits, authentication, or other protections;</li>
            <li>probe, scan, or test the security of the service without our written permission;</li>
            <li>scrape the website as a substitute for the API;</li>
            <li>use the data to harass, threaten, or impersonate anyone, including public officials; or</li>
            <li>use the service for anything unlawful.</li>
          </ul>
          <p>
            We may suspend or revoke keys that break these rules or put the service at risk. Where we can, we will
            contact you first.
          </p>
        </LegalSection>

        <LegalSection title="5. Using the data">
          <p>
            The leadership records are compiled from official public sources and checked as described in our{" "}
            <Link href="/methodology" className={link}>methodology</Link>. You may use the data in your own websites,
            apps, research, and reporting, including commercial products.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Please credit CivicGrid where practical, for example &quot;Data: CivicGrid (civicgrid.org)&quot;.</li>
            <li>Do not resell or republish the dataset as a whole, or offer it as a competing data service or API.</li>
          </ul>
        </LegalSection>

        <LegalSection title="6. Accuracy">
          <p>
            We work hard to keep records accurate, but officials change, elections happen, and sources can be wrong or
            out of date. Each record shows when it was last checked and verified. Confirm with the city&apos;s official
            source before relying on a record for anything important, such as legal notices or deadlines. If you find
            an error, please <Link href="/correction" className={link}>report a correction</Link>.
          </p>
        </LegalSection>

        <LegalSection title="7. No warranty">
          <p>
            The service and data are provided &quot;as is&quot; and &quot;as available&quot;, without warranties of any
            kind, including fitness for a particular purpose, accuracy, or uninterrupted availability, to the extent
            the law allows.
          </p>
        </LegalSection>

        <LegalSection title="8. Limit of liability">
          <p>
            To the extent the law allows, we are not liable for indirect, incidental, or consequential losses, or for
            lost profits or data, arising from your use of the service. Our total liability for any claim is limited
            to the greater of the amount you paid us in the 12 months before the claim or US$50.
          </p>
        </LegalSection>

        <LegalSection title="9. Ending access">
          <p>
            You can stop using CivicGrid and delete your account at any time. We may change, suspend, or end the
            service or your access, with notice where reasonable. Sections 5 to 10 continue to apply after access ends.
          </p>
        </LegalSection>

        <LegalSection title="10. General">
          <p>
            These terms are governed by the laws of the State of Maryland, United States. Our{" "}
            <Link href="/privacy" className={link}>Privacy Policy</Link> explains how we handle personal information. If
            we change these terms we will update the date above, and for significant changes we will email account
            holders. Questions:{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className={link}>{CONTACT_EMAIL}</a>.
          </p>
        </LegalSection>
      </main>
      <Footer />
    </div>
  );
}
