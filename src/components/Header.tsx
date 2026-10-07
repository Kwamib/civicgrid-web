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
      <div className="flex flex-wrap items-center justify-between gap-x-[30px] gap-y-3.5 px-5 py-4 md:flex-nowrap md:px-[30px] md:py-[19px]">
        <Brand />
        <NavLinks items={items} />
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex min-h-[43px] items-center rounded-md border border-[#58718b] px-[18px] text-sm font-semibold text-white hover:brightness-95"
            >
              {displayName ? `Hi, ${String(displayName).split(" ")[0]}` : "Dashboard"}
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden min-h-[43px] items-center px-2 text-sm text-white hover:underline sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                href="/login"
                className="hidden min-h-[43px] items-center rounded-md border border-cobalt bg-cobalt px-[18px] text-sm font-semibold text-white hover:brightness-95 md:inline-flex"
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
