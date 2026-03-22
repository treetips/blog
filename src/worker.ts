import { HATENA_PAGINATION_REDIRECTS } from './generated/hatena-pagination-redirects.js';

export interface Env {
  ASSETS: Fetcher;
}

const CANONICAL_HOST = 'bunkei-programmer.net';
const WWW_HOST = 'www.bunkei-programmer.net';
const HATENA_IMAGE_CDN = 'https://cdn-ak.f.st-hatena.com';

function redirectToCanonical(request: Request) {
  const url = new URL(request.url);
  url.hostname = CANONICAL_HOST;
  url.protocol = 'https:';
  return Response.redirect(url.toString(), 301);
}

function redirectToAstroPagination(request: Request) {
  const url = new URL(request.url);
  const page = url.searchParams.get('page');

  if (!page) {
    return null;
  }

  const targetPath = HATENA_PAGINATION_REDIRECTS[page];
  if (!targetPath) {
    return null;
  }

  const targetUrl = new URL(targetPath, `https://${CANONICAL_HOST}`);
  return Response.redirect(targetUrl.toString(), 301);
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    if (url.protocol !== 'https:' || url.hostname === WWW_HOST) {
      return redirectToCanonical(request);
    }

    if (url.pathname === '/') {
      const redirectResponse = redirectToAstroPagination(request);
      if (redirectResponse) {
        return redirectResponse;
      }
    }

    const assetsResponse = await env.ASSETS.fetch(request);
    if (assetsResponse.status !== 404 || !url.pathname.startsWith('/hatena-images/')) {
      return assetsResponse;
    }

    const remoteUrl = `${HATENA_IMAGE_CDN}${url.pathname.replace(/^\/hatena-images/, '')}${url.search}`;
    return fetch(remoteUrl, {
      headers: {
        'user-agent': request.headers.get('user-agent') ?? 'Mozilla/5.0',
        referer: 'https://treeapps.hatenablog.com/',
      },
    });
  },
};
