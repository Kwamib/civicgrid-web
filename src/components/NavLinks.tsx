"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string };

export function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname() || "/";
  return (
    <nav
      aria-label="Primary"
      className="order-3 flex w-full gap-5 overflow-x-auto whitespace-nowrap md:order-none md:ml-[35px] md:w-auto md:flex-1 md:gap-7"
    >
      {items.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`py-1 text-[13px] hover:underline md:text-sm ${active ? "text-sky" : "text-white"}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
