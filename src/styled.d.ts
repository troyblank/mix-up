import 'styled-components'
import type { Theme } from './theme'

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- DefaultTheme is our Theme; no extra members
  export interface DefaultTheme extends Theme {}
}
