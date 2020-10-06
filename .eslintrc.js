module.exports = {
    "parser":  "@typescript-eslint/parser",
    "extends":  [
      "eslint:recommended",
      'plugin:@typescript-eslint/recommended',
      "prettier/@typescript-eslint",
      // "plugin:prettier/recommended",
    ],
    "rules": {
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
        "eol-last": 0
      }
  };