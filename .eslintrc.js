module.exports = {
  root: true,
  parserOptions: {
    parser: "babel-eslint"
  },
  env: {
    browser: true,
    node: true
  },
  extends: [
    "eslint:recommended",
    // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
    // préférer utiliser `plugin:vue/strongly-recommended` ou `plugin:vue/recommended` pour des règles stictes.
    "plugin:vue/recommended",
    "plugin:prettier/recommended"
  ],
  // required to lint *.vue files
  plugins: [
    "vue"
  ],
  // add your custom rules here
  rules: {
    "semi": [2, "never"],
    "no-console": "off",
    "vue/max-attributes-per-line": "off",
    "indent": ["error", 2, { "SwitchCase": 1, "ignoreComments": true }],
    "prettier/prettier": ["error", { "semi": false }]
  },
  globals: {}
}
