import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://bunkei-programmer.net',
  output: 'static',
  vite: {
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
