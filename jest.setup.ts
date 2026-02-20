import { TextEncoder, TextDecoder } from 'util'
import '@testing-library/jest-dom'

Object.assign(globalThis, { TextEncoder, TextDecoder })
