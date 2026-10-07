import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import { Brand } from "@/components/Brand";
import { NavLinks, type NavItem } from "@/components/NavLinks";

const NAV: NavItem[] = [
  { href: "/", label: "Explore cities" },
  { href: "/states", label: "States" },
  { href: "/compare", label: "Compare" },
  { href: "/developers", label: "API & docs" },
  { href: "/methodology", label: "Methodology" },
];

export async function Header() {
  const user = await getCurrentUser();
  const admin = isAdminEmail(user?.email);

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    null;

  const items = admin ? [...NAV, { href: "/admin/review", label: "Review queue" }] : NAV;

  return (
    <header className="bg-navy text-white">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-8 gap-y-3 px-4 py-4 sm:px-6 md:flex-nowrap lg:px-8">
        <Brand />
        <NavLinks items={items} />
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex min-h-10 items-center rounded-md border border-white/25 px-4 text-sm font-medium text-white transition hover:bg-white/10"
            >
              {displayName ? `Hi, ${String(displayName).split(" ")[0]}` : "Dashboard"}
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden min-h-10 items-center rounded-md px-3 text-sm text-white/85 hover:text-white sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                href="/login"
                className="inline-flex min-h-10 items-center rounded-md bg-cobalt px-4 text-sm font-semibold text-white transition hover:bg-cobalt-dark"
              >
                Get API key
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
