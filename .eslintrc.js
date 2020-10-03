module.exports = {
    "parser":  "@typescript-eslint/parser",
    "extends":  [
      'plugin:react/recommended', // 리액트 추천 룰셋
      'plugin:@typescript-eslint/recommended', // 타입스크립트 추천 룰셋
       // eslint의 typescript 포매팅 기능을 제거(eslint-config-prettier)
      
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