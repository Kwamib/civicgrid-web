import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageHeading } from "@/components/ui";
import { CONTACT_EMAIL, LEGAL_UPDATED, LegalSection } from "@/components/LegalSection";
import { OG_IMAGES } from "@/lib/og";

export const metadata: Metadata = {
  title: "Privacy Policy · CivicGrid",
  description:
    "What CivicGrid collects when you browse the site, sign in, or use the API, who processes it, and how to have it deleted.",
  openGraph: {
    title: "Privacy Policy · CivicGrid",
    description: "What CivicGrid collects when you browse the site, sign in, or use the API, who processes it, and how to have it deleted.",
    url: "/privacy",
    siteName: "CivicGrid",
    type: "website",
    images: OG_IMAGES,
  },
};

const mail = (
  <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-cobalt hover:underline">
    {CONTACT_EMAIL}
  </a>
);

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main id="main" className="mx-auto w-full max-w-[850px] flex-1 px-4 pb-14 pt-10 sm:px-6">
        <PageHeading
          eyebrow="Privacy Policy"
          title="We collect as little as we can."
          intro={`Last updated ${LEGAL_UPDATED}. This page explains what CivicGrid collects when you browse the site, sign in, or call the API, and what we do with it.`}
        />

        <LegalSection title="Who we are">
          <p>
            CivicGrid (civicgrid.org) is an independent project operated by Mayowa Babatola (&quot;Kwami&quot;) in Maryland, United
            States. Questions about this policy or your data go to {mail}.
          </p>
        </LegalSection>

        <LegalSection title="What we collect">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-ink">Account details.</strong> When you sign in we receive your email address.
              If you sign in with Google or GitHub, that provider also shares your name and profile picture with us.
            </li>
            <li>
              <strong className="text-ink">API keys and usage.</strong> For each key we store a one way hash of the key
              (never the key itself), its first few characters so you can recognize it, its label and tier, when it was
              created, when it was last used, and how many requests it has made. We use this to enforce rate limits and
              to spot problems such as a stuck script.
            </li>
            <li>
              <strong className="text-ink">Server logs.</strong> Like most web services, our servers briefly log
              requests (the address requested, the time, and the response code) to keep the service running and secure.
              Our network provider, Cloudflare, sees your IP address when you connect.
            </li>
            <li>
              <strong className="text-ink">Email you send us.</strong> If you email us, for example to report a
              correction, we keep the message so we can reply and act on it.
            </li>
          </ul>
          <p>
            We do not run advertising, we do not use third party analytics or tracking scripts, and we do not sell or
            rent personal information to anyone.
          </p>
        </LegalSection>

        <LegalSection title="Cookies">
          <p>
            The site uses cookies only to keep you signed in. Cloudflare may set a short lived security cookie to
            tell people from bots. There are no advertising or tracking cookies.
          </p>
        </LegalSection>

        <LegalSection title="How we use it">
          <ul className="list-disc space-y-2 pl-5">
            <li>To sign you in, issue and check API keys, and apply your tier&apos;s limits.</li>
            <li>To send account emails, such as sign-in links.</li>
            <li>To contact you about your account or API usage, for example if a script is overloading the service or a change affects you.</li>
            <li>To keep the service secure and fix problems.</li>
          </ul>
          <p>We will not add you to a marketing list without asking first.</p>
        </LegalSection>

        <LegalSection title="Who processes it for us">
          <p>We use a small number of providers to run CivicGrid. Each handles data only to provide its service:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li><strong className="text-ink">Supabase</strong>: database and sign-in.</li>
            <li><strong className="text-ink">Vercel</strong>: hosting for this website.</li>
            <li><strong className="text-ink">DigitalOcean</strong>: hosting for the API.</li>
            <li><strong className="text-ink">Cloudflare</strong>: domain, network security, and incoming email.</li>
            <li><strong className="text-ink">Resend</strong>: sending account emails.</li>
            <li><strong className="text-ink">Google and GitHub</strong>: only if you choose to sign in with them.</li>
          </ul>
          <p>We may also disclose information if the law requires it.</p>
        </LegalSection>

        <LegalSection title="How long we keep it">
          <p>
            Account and key records are kept while your account exists. Server logs are kept for a short period for
            operations and security. Backups of the database are kept in private storage for up to 60 days, so deleted data can
            remain in a backup until it ages out.
          </p>
        </LegalSection>

        <LegalSection title="Your choices">
          <p>
            You can revoke your API keys at any time from your <Link href="/dashboard" className="font-semibold text-cobalt hover:underline">dashboard</Link>.
            To get a copy of your data, correct it, or delete your account, email {mail} from the address on your
            account. We will respond within 30 days.
          </p>
        </LegalSection>

        <LegalSection title="Information about public officials">
          <p>
            CivicGrid publishes the names and titles of elected and appointed city officials, taken from official
            public sources. This is public record information about people in public roles, not information about our
            users. If you are an official and a record about you is wrong, please{" "}
            <Link href="/correction" className="font-semibold text-cobalt hover:underline">report a correction</Link>.
          </p>
        </LegalSection>

        <LegalSection title="Children">
          <p>CivicGrid is not directed at children under 13, and we do not knowingly collect their information.</p>
        </LegalSection>

        <LegalSection title="Changes to this policy">
          <p>
            If we change this policy we will update the date at the top of this page. For significant changes we will
            also email account holders.
          </p>
        </LegalSection>
      </main>
      <Footer />
    </div>
  );
}
