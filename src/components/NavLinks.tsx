"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string };

export function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname() || "/";
  return (
    <nav
      aria-label="Primary"
      className="order-3 -mx-1 flex w-full gap-1 overflow-x-auto whitespace-nowrap md:order-none md:mx-0 md:w-auto md:flex-1 md:gap-2"
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
            className={`rounded-md px-2.5 py-1.5 text-sm transition ${
              active ? "text-sky" : "text-white/85 hover:bg-white/10 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
