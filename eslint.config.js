const typescriptEslint = require("@typescript-eslint/eslint-plugin");

module.exports = [
  {
    ignores: ["build/**", "bin/**"],
  },
  ...typescriptEslint.configs["flat/recommended"].map((config) => ({
    ...config,
    files: ["**/*.ts"],
  })),
];
