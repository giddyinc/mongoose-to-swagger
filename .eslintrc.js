module.exports = {
  "extends": "xo-space",
  "env": {
    "mocha": true
  },
  "parserOptions": {
    "ecmaFeatures": {
      "experimentalObjectRestSpread": true,
    },
    "sourceType": "module"
  },
  "rules": {
    "guard-for-in": [0],
    "no-multiple-empty-lines": 1
  }
}
