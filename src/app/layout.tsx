import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CivicGrid — Find the people leading US cities",
  description:
    "Search mayors and top officials across 3,000+ US cities, with the official source and verification date behind each record. Free REST API.",
  openGraph: {
    title: "CivicGrid",
    description: "US city leadership, with the evidence behind every record.",
    url: "https://www.civicgrid.org",
    siteName: "CivicGrid",
    type: "website",
  },
  verification: {
    google: "XTNtMJjsIosWxYvsO1sAJeWUBv8VZZ8IPi9_Tpo1u5g",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        {/* Fixed light-mode design: render form controls and scrollbars light
            regardless of OS preference. */}
        <meta name="color-scheme" content="light" />
      </head>
      <body className="min-h-full flex flex-col font-sans text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:text-ink focus:shadow"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
