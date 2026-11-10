// ESLint for Next.js 16, which dropped `next lint`. The same rules as the old
// .eslintrc.json ("next/core-web-vitals"), in ESLint's flat config format.
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  {
    rules: {
      // New with Next 16's React Hooks plugin. It flags reading browser-only
      // state (the saved focus pick, the motion setting, the screen size)
      // in an effect after the first render, which is how this site keeps
      // the server's HTML and the first browser render the same. A warning,
      // so it stays visible; useSyncExternalStore would be the way to clear it.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  globalIgnores([
    // eslint-config-next's own defaults:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Art sources and their Python tools, not site code.
    "assets-src/**",
    "graphify-out/**",
  ]),
]);
