import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ["src/domain/**/*.{ts,tsx}", "src/conversation/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "react", message: "Core layers must not depend on React." },
            {
              name: "react-dom",
              message: "Core layers must not depend on React.",
            },
          ],
          patterns: [
            {
              group: ["react/**", "react-dom/**", "@/features/**"],
              message: "Core layers must not depend on React or features.",
            },
          ],
        },
      ],
    },
  },
]);
