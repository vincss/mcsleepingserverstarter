const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const prettier = require("eslint-config-prettier");

module.exports = [
  {
    ignores: ["build/**", "bin/**"],
  },
  ...typescriptEslint.configs["flat/recommended"].map((config) => ({
    ...config,
    files: ["**/*.ts"],
  })),
  {
    files: ["**/*.ts"],
    rules: {
      ...prettier.rules,
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];
