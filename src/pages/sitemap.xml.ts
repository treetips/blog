import type { APIRoute } from 'astro';
import { getSortedPosts, getTotalPages, getPageHref } from '../lib/blog';

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL('https://bunkei-programmer.net');
  const sortedPosts = await getSortedPosts();
  const totalPages = getTotalPages(sortedPosts.length);

  const urls = [
    {
      url: new URL('/', base).toString(),
      lastmod: new Date().toISOString(),
    },
    ...Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) => {
      const page = index + 2;
      return {
        url: new URL(getPageHref(page), base).toString(),
        lastmod: new Date().toISOString(),
      };
    }),
    ...sortedPosts.map((post) => ({
      url: new URL(`/entry/${post.id}/`, base).toString(),
      lastmod: post.data.publishedAt.toISOString(),
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ url, lastmod }) => `  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${escapeXml(lastmod)}</lastmod>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
