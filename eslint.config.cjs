const js = require('@eslint/js');

module.exports = [
  {
    ignores: [
      'node_modules/**',
      'apps/**',
      'packages/**',
      'backend/**',
      'dist/**',
      'build/**'
    ]
  },
  {
    ...js.configs.recommended,
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs'
    },
    rules: {
      'no-var': 'error'
    }
  }
];
