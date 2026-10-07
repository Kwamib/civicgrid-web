/** Small shared presentational pieces for the redesign. Server-safe (no hooks). */
import type { ReactNode } from "react";

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-cobalt">{children}</div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-lg border border-line bg-white p-5 sm:p-6 ${className}`}>{children}</div>;
}

const TONES = {
  verified: "bg-[#e7f4ee] text-[#1d6047]",
  pending: "bg-[#fff2d7] text-[#7a5715]",
  warning: "bg-[#fbecee] text-[#8f4651]",
  none: "bg-[#eef2f7] text-[#4f5f75]",
} as const;

export function StatusBadge({ tone, children }: { tone: keyof typeof TONES; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-[5px] px-2 py-1 text-xs font-medium ${TONES[tone]}`}>
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  );
}

export function PageHeading({ eyebrow, title, intro }: { eyebrow?: ReactNode; title: ReactNode; intro?: ReactNode }) {
  return (
    <div className="mb-8">
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h1 className="font-serif text-[32px] font-bold leading-[1.2] tracking-[-1px] text-ink sm:text-[42px]">{title}</h1>
      {intro ? <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">{intro}</p> : null}
    </div>
  );
}

export function CodeBlock({ children, label }: { children: string; label?: string }) {
  return (
    <figure className="m-0 min-w-0">
      {label ? <figcaption className="mb-2 text-xs text-[#9fb4ca]">{label}</figcaption> : null}
      <pre className="overflow-x-auto rounded-md bg-[#142e49] p-5 font-mono text-[13px] leading-relaxed text-[#d4e5f5]">
        <code>{children}</code>
      </pre>
    </figure>
  );
}
