/** @type {import('jest').Config} */
module.exports = {
  coveragePathIgnorePatterns: ['<rootDir>/src/testing/'],
  coverageReporters: ['lcov', 'text-summary'],
  coverageThreshold: {
    global: {
      statements: 100,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  preset: 'ts-jest/presets/default-esm',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jsdom',
  testMatch: ['**/*.test.{ts,tsx}'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          target: 'ESNext',
          module: 'ESNext',
          moduleResolution: 'node',
          jsx: 'react-jsx',
          allowImportingTsExtensions: true,
          noEmit: true,
        },
      },
    ],
  },
}
