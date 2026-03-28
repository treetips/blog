import { defineConfig } from 'astro/config';
import tailwind from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://bunkei-programmer.net',
  output: 'static',
  image: {
    service: {
      config: {
        jpeg: { mozjpeg: true },
        webp: { effort: 6, alphaQuality: 80 },
        avif: { effort: 4, chromaSubsampling: '4:2:0' },
        png: { compressionLevel: 9 },
      },
    },
  },
  vite: {
    plugins: [tailwind()],
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
