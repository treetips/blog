// src/markdown/image-size-plugin.ts
// What: Sätteri (Astro 7 既定の markdown プロセッサ) の hast plugin として、
//       /blog-images/ 配下の <img> に実ファイルの寸法 (width/height) を
//       注入する。CLS 対策。
import path from "node:path";
import { stat } from "node:fs/promises";
import sharp from "sharp";

const IMAGE_URL_PREFIX = "/blog-images/";

type ElementRepr = {
  tagName?: string;
  properties?: Record<string, unknown>;
};

type VisitorContext = {
  setProperty: (node: unknown, key: string, value: unknown) => void;
};

export type ImageSizePluginEntry = {
  name: string;
  element: {
    filter: string[];
    visit: (node: unknown, ctx: VisitorContext) => Promise<void> | void;
  };
};

async function dimensionsFor(src: unknown): Promise<{ width: number; height: number } | null> {
  if (typeof src !== "string" || !src.startsWith(IMAGE_URL_PREFIX)) return null;
  const clean = src.split("?")[0]!.split("#")[0]!;
  const file = path.resolve("public/blog-images", clean.slice(IMAGE_URL_PREFIX.length));
  // Why not: 寸法が取れない画像でビルドを落とさない。寸法なしの <img> は
  // 従来どおり出る (表示自体には影響しない) ため。
  try {
    const info = await stat(file);
    if (!info.isFile()) return null;
    const meta = await sharp(file).metadata();
    return meta.width && meta.height ? { width: meta.width, height: meta.height } : null;
  } catch {
    return null;
  }
}

export const imageSizePlugin = {
  name: "image-size",
  // Why not: filter を img に絞るのは Sätteri が Rust 側で visitor を
  // フィルタするため。全 node を JS に渡させないための実測負荷軽減。
  element: {
    filter: ["img"],
    async visit(node, ctx) {
      const { properties } = node as ElementRepr;
      const size = await dimensionsFor(properties?.src);
      if (size) {
        ctx.setProperty(node, "width", size.width);
        ctx.setProperty(node, "height", size.height);
        ctx.setProperty(node, "decoding", "async");
      }
    },
  },
} satisfies {
  name: string;
  element: {
    filter: string[];
    visit: (
      node: unknown,
      ctx: { setProperty: (node: unknown, key: string, value: unknown) => void },
    ) => Promise<void> | void;
  };
};
