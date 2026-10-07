import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageHeading } from "@/components/ui";
import { getProposals } from "./actions";
import { ReviewClient } from "@/components/ReviewClient";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const user = await getCurrentUser();
  if (!user || !isAdminEmail(user.email)) {
    redirect("/login");
  }

  const { proposals, total, counts } = await getProposals("pending", 100, 0);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main id="main" className="mx-auto w-full max-w-[1400px] flex-1 px-4 pb-14 pt-10 sm:px-6 lg:px-8">
        <PageHeading
          eyebrow="Restricted · Data quality"
          title="Review possible leadership changes."
          intro="A finding is not a change. Nothing is published until you act, and every decision is logged with your email and reason."
        />
        <ReviewClient initialProposals={proposals} initialTotal={total} initialCounts={counts} />
        <p className="mt-6 text-xs text-muted">
          Need to fix a city that has no finding? Use <Link href="/admin/cities" className="text-cobalt hover:underline">Fix a city</Link>.
        </p>
      </main>
      <Footer />
    </div>
  );
}
