import js from '@eslint/js'
import ts from 'typescript-eslint'

export default [
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    ignores: [
      'node_modules/',
      'dist/',
      'coverage/',
      'prisma/generated/',
      '*.config.js',
      '*.config.cjs',
      'jest.config.js',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]
