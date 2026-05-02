const { parser: tsParser } = require("@typescript-eslint/parser");
const { FlatCompat } = require("@eslint/eslintrc");
const tseslint = require("typescript-eslint");

// Translate ESLintRC-style configs into flat configs.
const compat = new FlatCompat({
  baseDirectory: __dirname,
});
module.exports = [
  ...tseslint.configs.recommendedTypeCheckedOnly,
  ...compat.config({
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      project: "tsconfig.json",
      tsconfigRootDir: __dirname,
      sourceType: "module",
    },
    rules: {
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-vars": ["off"],
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/await-thenable": "off",
      "@typescript-eslint/no-unsafe-compare": "off",
      "@typescript-eslint/no-unsafe-enum-comparison": "off",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-floating-promises": "off",
    },
    ignorePatterns: ["dist", "node_modules"],
    overrides: [
      {
        files: ["*.ts", "**/*.ts"],
      },
    ],
  }),
];
