export default [
  {
    ignores: [
      'node_modules/**',
      'packages/**/dist/**',
      'backend/dist/**'
    ]
  },
  {
    files: ['scripts/**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'commonjs',
      globals: {
        console: 'readonly',
        process: 'readonly',
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly'
      }
    },
    rules: {}
  }
];
