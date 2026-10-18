import tailwind from "@tailwindcss/vite";
import { defineConfig, sharpImageService } from "astro/config";
import { satteri } from "@astrojs/markdown-satteri";
import { imageSizePlugin } from "./src/markdown/image-size-plugin.js";

export default defineConfig({
  site: "https://bunkei-programmer.net",
  output: "static",
  markdown: {
    processor: satteri({
      hastPlugins: [imageSizePlugin],
    }),
    shikiConfig: {
      langAlias: {
        mysql: "sql",
        conf: "ini",
        jsp: "html",
        ant: "xml",
      },
    },
  },
  image: {
    service: sharpImageService(),
  },
  experimental: {
    // 983ページの静的生成をワーカースレッドで分散して速くするため。
    // Why not: アダプター (@astrojs/cloudflare) が prerenderer を提供していない
    // 静的出力なので、このフラグの効果が最大化する構成だから。
    // ビルドがメモリ不足・逆に遅化した場合は workers 数を下げて調整する。
    parallelPrerender: true,
  },
  vite: {
    plugins: [
      tailwind(),
      {
        name: "suppress-tailwind-css-warnings",
        enforce: "pre",
        apply: "build",
        buildStart() {
          const originalWarn = console.warn;
          console.warn = (...args) => {
            const msg = args.join(" ");
            if (
              msg.includes('Unexpected token Ident("children")') ||
              msg.includes('Unexpected token Ident("vars")')
            )
              return;
            originalWarn.apply(console, args);
          };
        },
      },
    ],
    build: {
      rollupOptions: {
        onwarn(warning, defaultWarn) {
          if (
            warning.code === "UNUSED_EXTERNAL_IMPORT" &&
            warning.message.includes("node_modules/astro/dist/assets/utils/index.js")
          ) {
            return;
          }

          defaultWarn(warning);
        },
      },
    },
  },
});
