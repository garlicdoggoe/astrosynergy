import { dirname } from "path";
import { fileURLToPath } from "url";
import nextPlugin from "@next/eslint-plugin-next";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ESLint 9 flat config for Next.js
const eslintConfig = [
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts", "convex/_generated/**"]
  },
  {
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      // Core Web Vitals rules from Next.js
      ...nextPlugin.configs["core-web-vitals"].rules,
      // TypeScript rules from Next.js
      ...nextPlugin.configs.recommended.rules,
    },
  }
];

export default eslintConfig;
