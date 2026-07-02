import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { CompareClient } from "@/components/CompareClient";

export const metadata: Metadata = {
  title: "Compare Cities · CivicGrid",
  description: "Pick any two US cities to compare population, income, age, and city leadership side by side.",
  openGraph: {
    title: "Compare Cities · CivicGrid",
    description: "Compare any two US cities side by side.",
    url: "https://www.civicgrid.org/compare",
    siteName: "CivicGrid",
    type: "website",
  },
};

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />
      <CompareClient />
      <footer className="border-t border-slate-200 py-6">
        <div className="mx-auto max-w-2xl px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-400">
          <div>© 2026 CivicGrid · Built quietly. Shipped loudly.</div>
          <div className="flex gap-5">
            <a href="/states" className="hover:text-slate-700 transition">States</a>
            <a href="/" className="hover:text-slate-700 transition">Search</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
