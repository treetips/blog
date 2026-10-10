import { HATENA_PAGINATION_REDIRECTS } from "./generated/hatena-pagination-redirects.js";

export interface Env {
  ASSETS: Fetcher;
}

const CANONICAL_HOST = "bunkei-programmer.net";
const WWW_HOST = "www.bunkei-programmer.net";
const LEGACY_IMAGES_PREFIX = "/hatena-images/";
const BLOG_IMAGES_PREFIX = "/blog-images/";
// はてな由来のコンテンツアドレス済みファイル名 (タイムスタンプ+ハッシュ) なので
// 同一 URL の内容は不変。長期の immutable キャッシュが安全。
const IMAGE_CACHE_CONTROL = "public, max-age=31536000, immutable";

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

    // _headers は Assets パイプラインを通る直配信でのみ効く可能性があり、
    // ASSETS binding 経由では適用が保証されない。Why: 画像の毎回の取り直しを
    // 止めるため、binding 経由でも Cache-Control が確実に付くようにする
    // (既に付いている場合は上書きしない) (ADR 0004)。
    if (url.pathname.startsWith(BLOG_IMAGES_PREFIX)) {
      const assetsResponse = await env.ASSETS.fetch(request);
      if (assetsResponse.headers.get("cache-control")) {
        return assetsResponse;
      }
      const headers = new Headers(assetsResponse.headers);
      headers.set("Cache-Control", IMAGE_CACHE_CONTROL);
      return new Response(assetsResponse.body, {
        status: assetsResponse.status,
        statusText: assetsResponse.statusText,
        headers,
      });
    }

    return env.ASSETS.fetch(request);
  },
};
