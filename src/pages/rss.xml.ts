import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async ({ site }) => {
  const posts = await getCollection('blog');
  const base = site ?? new URL('https://bunkei-programmer.net');
  const items = [...posts]
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime())
    .slice(0, 50);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml('文系プログラマによるTIPSブログ')}</title>
    <link>${escapeXml(new URL('/', base).toString())}</link>
    <description>${escapeXml('はてなブログから移行した技術メモと日記。')}</description>
    <language>ja</language>
    <atom:link href="${escapeXml(new URL('/rss.xml', base).toString())}" rel="self" type="application/rss+xml" />
${items
  .map(
    (post) => `    <item>
      <title>${escapeXml(post.data.title)}</title>
      <link>${escapeXml(new URL(`/entry/${post.id}/`, base).toString())}</link>
      <guid isPermaLink="true">${escapeXml(new URL(`/entry/${post.id}/`, base).toString())}</guid>
      <pubDate>${escapeXml(post.data.publishedAt.toUTCString())}</pubDate>
      <description>${escapeXml(post.data.categories.join(' / ') || post.data.title)}</description>
    </item>`,
  )
  .join('\n')}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
