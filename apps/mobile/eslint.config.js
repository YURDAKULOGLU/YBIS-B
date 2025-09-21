// ESLint 9.x flat config format
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

export default [
  // Base JavaScript rules
  js.configs.recommended,

  // React Native legacy configuration via compat
  ...compat.extends('@react-native/eslint-config'),

  // Disable legacy rules incompatible with ESLint 9
  {
    rules: {
      'ft-flow/define-flow-type': 'off',
      'ft-flow/use-flow-type': 'off',
      'react-native/no-inline-styles': 'off',
      'react/react-in-jsx-scope': 'off',
    },
  },

  // TypeScript configuration
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },

  // Global ignores
  {
    ignores: [
      'node_modules/**',
      'android/**',
      'ios/**',
      'dist/**',
      'build/**',
      '*.config.js',
      '.expo/**',
    ],
  },
];
