import { createGlobalStyle } from 'styled-components'

export const GlobalStyles = createGlobalStyle`
  :root {
    font-size: ${({ theme }) => theme.font.sizeBase};
    font-family: ${({ theme }) => theme.font.family};
    color: ${({ theme }) => theme.color.text};
    background-color: ${({ theme }) => theme.color.bg};
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }
`
