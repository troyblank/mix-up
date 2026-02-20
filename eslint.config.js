import eslint from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const jestGlobals = {
  describe: 'readonly',
  it: 'readonly',
  expect: 'readonly',
  jest: 'readonly',
  beforeAll: 'readonly',
  beforeEach: 'readonly',
  afterAll: 'readonly',
  afterEach: 'readonly',
}

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    },
  },
  {
    files: ['**/*.test.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...jestGlobals },
    },
  },
  {
    files: ['**/*.cjs'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
]
