module.exports = {
  root: true,
  extends: [
    '@react-native',
    '@react-native/eslint-config',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-shadow': ['error'],
        'no-shadow': 'off',
        'no-undef': 'off',
        'react/react-in-jsx-scope': 'off',
        'react-native/no-inline-styles': 'off',
      },
    },
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react-native/no-inline-styles': 'off',
  },
  ignorePatterns: [
    'node_modules/',
    'android/',
    'ios/',
    'dist/',
    'build/',
  ],
};

