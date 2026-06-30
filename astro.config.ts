import tailwind from '@tailwindcss/vite';
import { defineConfig, sharpImageService } from 'astro/config';

export default defineConfig({
  site: 'https://bunkei-programmer.net',
  output: 'static',
  markdown: {
    shikiConfig: {
      langAlias: {
        mysql: 'sql',
        conf: 'ini',
        jsp: 'html',
        ant: 'xml',
      },
},
  },
  image: {
    service: sharpImageService()
  },
  vite: {
    plugins: [tailwind(), {
      name: 'suppress-tailwind-css-warnings',
      enforce: 'pre',
      apply: 'build',
      buildStart() {
        const originalWarn = console.warn;
        console.warn = (...args) => {
          const msg = args.join(' ');
          if (msg.includes('Unexpected token Ident("children")') || msg.includes('Unexpected token Ident("vars")')) return;
          originalWarn.apply(console, args);
        };
      },
    }],
    build: {
      rollupOptions: {
        onwarn(warning, defaultWarn) {
          if (
            warning.code === 'UNUSED_EXTERNAL_IMPORT' &&
            warning.message.includes('node_modules/astro/dist/assets/utils/index.js')
          ) {
            return;
          }

          defaultWarn(warning);
        },
      },
    },
  },
});
