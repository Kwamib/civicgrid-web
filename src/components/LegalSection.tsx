import type { ReactNode } from "react";

/** One numbered section of a legal page (Terms, Privacy). */
export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-line py-6">
      <h2 className="font-serif text-[22px] font-bold leading-[1.2] text-ink">{title}</h2>
      <div className="mt-2 space-y-3 text-[15px] leading-relaxed text-muted">{children}</div>
    </section>
  );
}

export const LEGAL_UPDATED = "October 11, 2026";
export const CONTACT_EMAIL = "hello@civicgrid.org";
