import { bindings, defineConfig, triggers } from "cf/config";

/**
 * Secret-like files were detected but not read or migrated: .env. Only `secrets.required` entries are migrated.
 * @see https://developers.cloudflare.com/workers/configuration/secrets/
 */

export default defineConfig({
  worker: {
    name: "bunkei-programmer-net",
    compatibilityDate: "2026-03-22",
    entrypoint: "./src/worker.ts",
    observability: {
      enabled: true,
    },
    assets: {
      runWorkerFirst: true,
    },
    triggers: [
      triggers.fetch({
        pattern: "bunkei-programmer.net/*",
        zone: "bunkei-programmer.net",
      }),
      triggers.fetch({
        pattern: "www.bunkei-programmer.net/*",
        zone: "bunkei-programmer.net",
      }),
    ],
    env: {
      ASSETS: bindings.assets(),
    },
  },
});
