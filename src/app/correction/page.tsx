import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageHeading } from "@/components/ui";
import { CorrectionForm } from "@/components/CorrectionForm";
import { getAllCities } from "@/lib/cities";
import { findCityBySlug } from "@/lib/slug";

export const metadata: Metadata = {
  title: "Report a correction · CivicGrid",
  description: "Tell CivicGrid about an incorrect city leadership record, with a link to the official source.",
};

export default async function CorrectionPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const { city: slug } = await searchParams;
  let cityLabel = "";
  if (slug) {
    const match = findCityBySlug(await getAllCities(), slug);
    if (match) cityLabel = `${match.city}, ${match.state_code}`;
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main id="main" className="mx-auto w-full max-w-[760px] flex-1 px-4 pb-14 pt-10 sm:px-6">
        <PageHeading
          eyebrow="Data quality"
          title="Report a correction."
          intro="Point us to an official source and we'll review the record. Corrections go through the same review as automated findings."
        />
        <CorrectionForm initialCity={cityLabel} />
      </main>
      <Footer />
    </div>
  );
}
