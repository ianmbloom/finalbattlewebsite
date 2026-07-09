// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://finalbattle.video",
  output: "static",
  i18n: {
    defaultLocale: "en",
    locales: ["en", "fa"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      // ~/Desktop may be iCloud-synced and dev can run in a sandbox, where
      // native FS events are unreliable. Poll so HMR always catches edits.
      // Dev-only; has no effect on production builds.
      watch: {
        usePolling: true,
        interval: 300,
      },
    },
  },
});
