import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Header } from "@/components/Header";
import { FixCityClient } from "@/components/FixCityClient";

export const dynamic = "force-dynamic";

export default async function FixCityPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string | string[] }>;
}) {
  const user = await getCurrentUser();
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim());
  if (!user || !adminEmails.includes(user.email ?? "")) {
    redirect("/login");
  }

  // ?id=2140 opens that city. Only a plain number is accepted; anything else
  // is ignored. The link never fills in values or saves.
  const { id } = await searchParams;
  const rawId = typeof id === "string" ? id : undefined;
  const initialCityId = rawId && /^[1-9][0-9]{0,8}$/.test(rawId) ? Number(rawId) : null;

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-8">
          <div className="text-xs text-slate-500 tracking-wider uppercase font-medium mb-2">Data quality</div>
          <h1 className="text-4xl md:text-5xl tracking-tight font-bold" style={{ fontFamily: "var(--font-serif)" }}>
            Fix a city
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Search any city, check the source, and correct its mayor. Saves stamp the record as verified.
          </p>
        </div>
        <FixCityClient initialCityId={initialCityId} />
      </main>
    </div>
  );
}
