/**
 * Convert a city name and state code into a URL-safe slug.
 * "Los Angeles", "CA" -> "los-angeles-ca"
 * "New York", "NY" -> "new-york-ny"
 * "St. Louis", "MO" -> "st-louis-mo"
 */
export function citySlug(cityName: string, stateCode: string): string {
  return `${cityName} ${stateCode}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Match a city in a list by its slug.
 * Returns the city object or null.
 */
export function findCityBySlug<T extends { city: string; state_code: string }>(
  cities: T[],
  slug: string
): T | null {
  return (
    cities.find((c) => citySlug(c.city, c.state_code) === slug) ?? null
  );
}
