module.exports = {
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  plugins: ["import"],
  env: {
    node: true,
  },
  rules: {
    "no-console": "off",
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "index",
          "sibling",
          "parent",
          "object",
          "type",
        ],
        alphabetize: {
          order: "asc",
        },
        "newlines-between": "always",
      },
    ],
    "@typescript-eslint/no-explicit-any": "off",
  },
  parserOptions: {
    parser: "@typescript-eslint/parser",
  },
};
