import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Header } from "@/components/Header";
import { FixCityClient } from "@/components/FixCityClient";

export const dynamic = "force-dynamic";

export default async function FixCityPage() {
  const user = await getCurrentUser();
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim());
  if (!user || !adminEmails.includes(user.email ?? "")) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-8">
          <div className="text-xs text-slate-500 tracking-wider uppercase font-medium mb-2">Data quality</div>
          <h1 className="text-4xl md:text-5xl font-normal tracking-tight" style={{ fontFamily: "var(--font-serif)" }}>
            Fix a city
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Search any city, check the source, and correct its mayor. Saves stamp the record as verified.
          </p>
        </div>
        <FixCityClient />
      </main>
    </div>
  );
}
