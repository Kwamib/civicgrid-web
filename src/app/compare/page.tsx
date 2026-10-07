import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
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
      <Footer />
    </div>
  );
}
