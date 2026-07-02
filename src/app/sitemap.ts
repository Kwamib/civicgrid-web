import type { MetadataRoute } from "next";
import { getAllCities } from "@/lib/cities";
import { citySlug, stateSlug } from "@/lib/slug";

const BASE = "https://www.civicgrid.org";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cities = await getAllCities();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/compare`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/states`, changeFrequency: "weekly", priority: 0.8 },
  ];

  const cityRoutes: MetadataRoute.Sitemap = cities.map((c) => ({
    url: `${BASE}/cities/${citySlug(c.city, c.state_code)}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const stateNames = new Map<string, string>();
  for (const c of cities) {
    if (c.state_name && !stateNames.has(c.state_code)) {
      stateNames.set(c.state_code, c.state_name);
    }
  }
  const stateRoutes: MetadataRoute.Sitemap = [...stateNames.values()].map((name) => ({
    url: `${BASE}/states/${stateSlug(name)}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const topCities = [...cities]
    .sort((a, b) => (b.population || 0) - (a.population || 0))
    .slice(0, 20);

  const compareRoutes: MetadataRoute.Sitemap = [];
  for (let i = 0; i < topCities.length; i++) {
    for (let j = i + 1; j < topCities.length; j++) {
      const a = citySlug(topCities[i].city, topCities[i].state_code);
      const b = citySlug(topCities[j].city, topCities[j].state_code);
      compareRoutes.push({
        url: `${BASE}/compare/${a}/vs/${b}`,
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  }

  return [...staticRoutes, ...stateRoutes, ...cityRoutes, ...compareRoutes];
}
