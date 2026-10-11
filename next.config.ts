import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // City pages live at /cities/<slug>; the city list is the home page.
    return [{ source: "/cities", destination: "/", permanent: false }];
  },
};

export default nextConfig;
