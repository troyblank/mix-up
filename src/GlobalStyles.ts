import { createGlobalStyle } from 'styled-components'
import { spaceCssVarsBlock } from './theme/space'

export const GlobalStyles = createGlobalStyle`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :root {
    ${spaceCssVarsBlock}
    font-size: ${({ theme }) => theme.font.sizeBase};
    font-family: ${({ theme }) => theme.font.family};
    color: ${({ theme }) => theme.color.text};
    background-color: ${({ theme }) => theme.color.bg};
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  textarea,
  select,
  input:not([type='submit']):not([type='button']):not([type='checkbox']):not([type='radio']):not([type='file']):not([type='range']):not([type='hidden']):not([type='reset']):not([type='image']) {
    display: block;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    margin: 0 0 ${({ theme }) => theme.space.large};
    padding: ${({ theme }) => theme.space.medium};
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 6px;
    background: ${({ theme }) => theme.color.surface};
    color: ${({ theme }) => theme.color.text};
    box-shadow: inset 0 1px 2px ${({ theme }) => theme.color.shadow};
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
  }

  textarea:focus,
  select:focus,
  input:not([type='submit']):not([type='button']):not([type='checkbox']):not([type='radio']):not([type='file']):not([type='range']):not([type='hidden']):not([type='reset']):not([type='image']):focus {
    outline: 0;
    border-color: ${({ theme }) => theme.color.accent};
  }

  input[type='submit'],
  button[type='submit'] {
    display: block;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    margin-top: ${({ theme }) => theme.space.large};
    margin-bottom: ${({ theme }) => theme.space.large};
    padding: ${({ theme }) => theme.space.medium};
    border: none;
    border-radius: 6px;
    background: ${({ theme }) => theme.color.accent};
    color: ${({ theme }) => theme.color.bg};
    text-transform: uppercase;
    letter-spacing: 0.04em;
    box-shadow: none;
    cursor: pointer;
    -webkit-appearance: none;
    transition: background-color 0.15s ease;

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.color.accentHover};
    }

    &:focus-visible {
      outline: 2px solid ${({ theme }) => theme.color.accent};
      outline-offset: 2px;
    }

    &:disabled {
      opacity: 0.75;
      cursor: wait;
    }
  }

  textarea:-webkit-autofill,
  input:not([type='submit']):not([type='button']):not([type='checkbox']):not([type='radio']):not([type='file']):not([type='range']):not([type='hidden']):not([type='reset']):not([type='image']):-webkit-autofill {
    -webkit-box-shadow: inset 0 1px 2px ${({ theme }) => theme.color.shadow},
      inset 0 0 0 50px ${({ theme }) => theme.color.surface};
    -webkit-text-fill-color: ${({ theme }) => theme.color.text};
  }

  form label {
    color: ${({ theme }) => theme.color.textMuted};
  }
`
