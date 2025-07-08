import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  // Ignore common build/config files
  {
    ignores: [
      "dist/",
      "node_modules/",
      "coverage/",
      ".env",
      ".env.local",
      ".env.example",
      "*.log",
      "*.tsbuildinfo",
      ".vscode/",
      ".changeset/",
    ],
  },

  // Base JavaScript rules
  js.configs.recommended,

  // TypeScript files
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      globals: {
        console: "readonly",
        process: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      "no-console": "off", // Allow console in CLI tools
    },
  },

  // Test files - relax some rules for testing
  {
    files: ["**/*.test.ts", "**/*.spec.ts", "**/__tests__/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // Allow any in test files for mocking
      "@typescript-eslint/no-unused-vars": "off", // Allow unused vars in tests
    },
  },
];
