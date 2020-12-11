module.exports = {
  "parser": "@typescript-eslint/parser",
  "extends": [
    "airbnb-base",
    "eslint:recommended",
    'plugin:@typescript-eslint/recommended',
    "prettier/@typescript-eslint",
    // "plugin:prettier/recommended",
  ],
  "rules": {
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "indent": [
      "error",
      2
    ],
    "semi": [
      "error",
      "always"
    ],
    "no-trailing-spaces": 0,
    "keyword-spacing": 0,
    "no-unused-vars": 1,
    "no-multiple-empty-lines": 0,
    "space-before-function-paren": 0,
    "eol-last": 0,
    "import/no-unresolved": "off",
    'import/extensions': ['off',],
    "import/prefer-default-export": "off",
    "new-cap": 0,
    "no-param-reassign": 0,
    "no-underscore-dangle": "off",
    "camelcase": 0,
    "brace-style": 0,
    "linebreak-style": 0,
  }
};