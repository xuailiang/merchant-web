module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
    'vue/setup-compiler-macros': true,
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module',
    extraFileExtensions: ['.vue'],
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/attribute-hyphenation': 'off',
    'vue/attributes-order': 'off',
    'vue/require-default-prop': 'off',
    'vue/v-on-event-hyphenation': 'off',
    'vue/no-template-shadow': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
}
