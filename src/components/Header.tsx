import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export async function Header() {
  const user = await getCurrentUser();

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    null;

  const avatarUrl =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <header className="border-b border-slate-200">
      <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center text-white text-base"
            style={{ background: "#1a2540", fontFamily: "var(--font-serif)" }}
          >
            C
          </div>
          <span
            className="text-lg font-medium tracking-tight group-hover:text-slate-700 transition"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            CivicGrid
          </span>
        </Link>

        <nav className="flex items-center gap-6 text-sm text-slate-500">
          <Link
            href="https://github.com/Kwamib/civicgrid-api"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-900 transition hidden sm:inline"
          >
            API
          </Link>
          <Link
            href="https://github.com/Kwamib/civicgrid-api#readme"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-900 transition hidden sm:inline"
          >
            Docs
          </Link>
          {user ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-white text-xs font-medium px-3.5 py-1.5 rounded-md hover:opacity-90 transition"
              style={{ background: "#1a2540" }}
            >
              {avatarUrl && (
                <img src={avatarUrl} alt="" className="h-4 w-4 rounded-full" />
              )}
              <span className="hidden sm:inline">
                {displayName ? "Hi, " + displayName.split(" ")[0] : "Dashboard"}
              </span>
              <span className="sm:hidden">Dashboard</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-white text-xs font-medium px-3.5 py-1.5 rounded-md hover:opacity-90 transition"
              style={{ background: "#1a2540" }}
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}