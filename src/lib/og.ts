/**
 * The site-wide share image (src/app/opengraph-image.png).
 *
 * Next.js adds it automatically only to pages that don't set their own
 * openGraph. Any page that does (to get its own og:url and title) must list
 * it, or link previews show no image.
 */
export const OG_IMAGES = [
  {
    url: "/opengraph-image.png",
    width: 1200,
    height: 630,
    alt: 'CivicGrid: the people leading 3,000+ U.S. cities, with the official source and verification date behind every record.',
  },
];
