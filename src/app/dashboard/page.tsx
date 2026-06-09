import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getUserKeys, signOut } from "./actions";
import { KeyManager } from "./key-manager";
import { Header } from "@/components/Header";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const keys = await getUserKeys();
  const activeKeys = (keys ?? []).filter((k) => !k.revoked_at);

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "there";

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />

      <main className="mx-auto max-w-3xl px-6 py-12">
        {/* Page heading */}
        <div className="mb-10 flex items-start justify-between gap-6">
          <div>
            <h1
              className="text-4xl md:text-5xl font-normal tracking-tight"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Welcome back, {displayName}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Manage your CivicGrid API keys
            </p>
          </div>

          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-slate-500 hover:text-slate-900 transition"
            >
              Sign out
            </button>
          </form>
        </div>

        {/* Account section */}
        <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2
            className="text-xl mb-4"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Account
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
            <div>
              <dt className="text-slate-500 text-xs uppercase tracking-wider">
                Email
              </dt>
              <dd className="mt-1 font-medium">{user.email}</dd>
            </div>
            <div>
              <dt className="text-slate-500 text-xs uppercase tracking-wider">
                Signed in via
              </dt>
              <dd className="mt-1 font-medium capitalize">
                {user.app_metadata?.provider || "email"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500 text-xs uppercase tracking-wider">
                User ID
              </dt>
              <dd
                className="mt-1 text-xs text-slate-700 truncate"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {user.id}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500 text-xs uppercase tracking-wider">
                Active keys
              </dt>
              <dd className="mt-1 font-medium">{activeKeys.length}</dd>
            </div>
          </dl>
        </section>

        {/* API Keys section */}
        <KeyManager keys={keys ?? []} />

        {/* Help footer */}
        <footer className="mt-12 pt-8 border-t border-slate-200 text-sm text-slate-500">
          <p className="mb-2">Need help getting started?</p>
          <div
            className="rounded-xl p-4 text-xs leading-relaxed overflow-x-auto shadow-sm"
            style={{
              background: "#1a2540",
              color: "#e8eef5",
              fontFamily: "var(--font-mono)",
            }}
          >
            <div style={{ color: "#6b7a99" }}>
              $ curl https://api.civicgrid.org/cities?limit=5 \
            </div>
            <div style={{ color: "#6b7a99" }}>
              {"    "}-H &quot;Authorization: Bearer cg_live_...&quot;
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <Link
              href="https://github.com/Kwamib/civicgrid-api#readme"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 transition"
            >
              Read docs →
            </Link>
            <Link href="/" className="hover:text-slate-900 transition">
              Back to home →
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}