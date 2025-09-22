export default [
  {
    files: ['scripts/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        console: 'readonly',
        module: 'readonly',
        process: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'error',
      'no-undef': 'error',
    },
  },
  {
    ignores: [
      'apps/**',
      'backend/**',
      'docs/**',
      'node_modules/**',
      'packages/**',
      'specs/**',
      '.*',
    ],
  },
];
