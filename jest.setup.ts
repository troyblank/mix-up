import { TextEncoder, TextDecoder } from 'util'
import '@testing-library/jest-dom'

Object.assign(globalThis, { TextEncoder, TextDecoder })

beforeEach(() => {
  globalThis.fetch = jest.fn(() =>
    Promise.reject(
      new Error(
        'global.fetch was not mocked in this test. Add a beforeEach in the test file, or mock hooks such as useList instead.',
      ),
    ),
  ) as unknown as typeof fetch
})
