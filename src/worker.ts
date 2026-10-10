import { HATENA_PAGINATION_REDIRECTS } from "./generated/hatena-pagination-redirects.js";

export interface Env {
  ASSETS: Fetcher;
}

const CANONICAL_HOST = "bunkei-programmer.net";
const WWW_HOST = "www.bunkei-programmer.net";
const LEGACY_IMAGES_PREFIX = "/hatena-images/";

function redirectToCanonical(request: Request) {
  const url = new URL(request.url);
  url.hostname = CANONICAL_HOST;
  url.protocol = "https:";
  return Response.redirect(url.toString(), 301);
}

function redirectToAstroPagination(request: Request) {
  const url = new URL(request.url);
  const page = url.searchParams.get("page");

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

    // はてな時代の画像 URL (/hatena-images/*) を新 URL に 301 で受ける。
    // Why not: 404 にするのは外部リンク・ブックマーク・検索インデックスを
    // 壊すため。canonical 補正より先に置くのは www → apex との往復を
    // 1 回で済ませるため (ADR 0002)。
    if (url.pathname.startsWith(LEGACY_IMAGES_PREFIX)) {
      url.protocol = "https:";
      url.hostname = CANONICAL_HOST;
      url.pathname = url.pathname.replace(/^\/hatena-images/, "/blog-images");
      return Response.redirect(url.toString(), 301);
    }

    if (url.protocol !== "https:" || url.hostname === WWW_HOST) {
      return redirectToCanonical(request);
    }

    if (url.pathname === "/") {
      const redirectResponse = redirectToAstroPagination(request);
      if (redirectResponse) {
        return redirectResponse;
      }
    }

    return env.ASSETS.fetch(request);
  },
};
