"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { stateSlug } from "@/lib/slug";
import { US_STATES } from "@/lib/us-states";

/**
 * Interactive US map for the 404 page. Hover or focus a state to light it up;
 * click (or Enter) to open that state's page. A pulsing pin sits out in the
 * Atlantic: "you are here", i.e. off the map.
 */
export function LostMap() {
  const router = useRouter();
  const [active, setActive] = useState<string | null>(null);

  function go(name: string) {
    router.push(`/states/${stateSlug(name)}`);
  }

  function surprise() {
    const pick = US_STATES[Math.floor(Math.random() * US_STATES.length)];
    setActive(pick.name);
    window.setTimeout(() => go(pick.name), 450);
  }

  return (
    <div className="w-full">
      <svg
        viewBox="0 0 975 610"
        className="h-auto w-full"
        role="group"
        aria-label="Map of the United States. Choose a state to explore its cities."
      >
        <g>
          {US_STATES.map((s) => {
            const on = active === s.name;
            return (
              <a
                key={s.name}
                href={`/states/${stateSlug(s.name)}`}
                aria-label={`Explore ${s.name}`}
                onClick={(e) => {
                  e.preventDefault();
                  go(s.name);
                }}
                onMouseEnter={() => setActive(s.name)}
                onMouseLeave={() => setActive((cur) => (cur === s.name ? null : cur))}
                onFocus={() => setActive(s.name)}
                onBlur={() => setActive((cur) => (cur === s.name ? null : cur))}
                className="outline-none"
              >
                <path
                  d={s.d}
                  className={`cursor-pointer stroke-white transition-colors duration-150 ${
                    on ? "fill-cobalt" : "fill-[#d6e2f0] hover:fill-cobalt"
                  }`}
                  strokeWidth={1}
                  strokeLinejoin="round"
                />
              </a>
            );
          })}
        </g>

        {/* You are here: lost in the Atlantic. */}
        <g transform="translate(925 445)" aria-hidden="true">
          <circle r="16" className="fill-cobalt/20 origin-center animate-ping [transform-box:fill-box]" />
          <circle r="7" className="fill-cobalt stroke-white" strokeWidth={2.5} />
          <text x="-14" y="-18" textAnchor="end" className="fill-ink text-[19px] font-semibold">
            You are here
          </text>
        </g>
      </svg>

      <div className="mt-3 flex min-h-[44px] flex-wrap items-center justify-between gap-3">
        <p className="text-[15px] text-muted" aria-live="polite">
          {active ? (
            <>
              Explore <strong className="text-ink">{active}</strong> &rarr;
            </>
          ) : (
            "Pick a state to find your way back."
          )}
        </p>
        <button
          type="button"
          onClick={surprise}
          className="rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink hover:border-cobalt hover:text-cobalt"
        >
          Take me somewhere
        </button>
      </div>
    </div>
  );
}
