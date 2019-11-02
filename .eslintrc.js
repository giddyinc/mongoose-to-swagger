module.exports = {
  "parser": "@typescript-eslint/parser",
  "extends": "xo-space",
  "env": {
    "mocha": true
  },
  "plugins": [
    "typescript",
    'chai-friendly'
  ],
  "parserOptions": {
    "ecmaFeatures": {
      "experimentalObjectRestSpread": true,
    },
    "sourceType": "module"
  },
  "rules": {
    "guard-for-in": [0],
    "no-multiple-empty-lines": 1,
    "capitalized-comments": 0,
    'no-unused-expressions': 0,
    "chai-friendly/no-unused-expressions": [2, { "allowShortCircuit": true }],
  }
}
