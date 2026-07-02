"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CityPicker } from "@/components/CityPicker";
import { citySlug } from "@/lib/slug";
import type { City } from "@/lib/cities";

export function CompareClient() {
  const router = useRouter();
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityA, setCityA] = useState<City | null>(null);
  const [cityB, setCityB] = useState<City | null>(null);

  useEffect(() => {
    fetch("/api/search")
      .then((r) => r.json())
      .then((json) => { setCities(json.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const canCompare = cityA && cityB && cityA.id !== cityB.id;

  function goCompare() {
    if (!canCompare) return;
    const a = citySlug(cityA!.city, cityA!.state_code);
    const b = citySlug(cityB!.city, cityB!.state_code);
    router.push(`/compare/${a}/vs/${b}`);
  }

  return (
    <section className="pt-12 pb-10" style={{ background: "linear-gradient(180deg, #fafbfc 0%, #ffffff 100%)" }}>
      <div className="mx-auto max-w-2xl px-6">
        <div className="text-xs text-slate-500 tracking-wider uppercase font-medium mb-3">Compare cities</div>
        <h1 className="text-4xl md:text-5xl font-normal leading-[1.1] tracking-tight mb-3" style={{ fontFamily: "var(--font-serif)" }}>
          Two cities, side by side
        </h1>
        <p className="text-base text-slate-500 mb-8">
          Pick any two US cities to compare population, income, and leadership.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 items-end">
          <CityPicker label="City A" cities={cities} loading={loading} selected={cityA} onSelect={setCityA} />
          <div className="hidden sm:block text-center text-slate-400 pb-3" style={{ fontFamily: "var(--font-serif)" }}>vs</div>
          <CityPicker label="City B" cities={cities} loading={loading} selected={cityB} onSelect={setCityB} />
        </div>

        {cityA && cityB && cityA.id === cityB.id ? (
          <p className="text-xs text-amber-600 mt-4">Pick two different cities.</p>
        ) : null}

        <button
          onClick={goCompare}
          disabled={!canCompare}
          className="mt-6 inline-flex items-center px-6 py-3 rounded-lg text-sm font-medium text-white transition disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
          style={{ background: "#1a2540" }}
        >
          Compare →
        </button>
      </div>
    </section>
  );
}
