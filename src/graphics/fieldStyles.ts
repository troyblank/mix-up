import { css } from 'styled-components'

import { selectChevron } from './selectChevron'

export const dialogFieldStyles = css`
  width: 100%;
  box-sizing: border-box;
  padding: ${({ theme }) => theme.space.small}
    ${({ theme }) => theme.space.medium};
  border: 1px solid ${({ theme }) => theme.color.inputBorder};
  border-radius: 0.35rem;
  font: inherit;
  color: ${({ theme }) => theme.color.text};
  background: ${({ theme }) => theme.color.bg};

  @media (max-width: ${({ theme }) => theme.size.small}) {
    border-width: 1.5px;
    border-color: ${({ theme }) => theme.color.inputBorderStrong};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.accent};
    outline-offset: 2px;
  }
`

export const surfaceFieldStyles = css`
  display: block;
  width: 100%;
  margin: ${({ theme }) => theme.space.small} 0 0;
  padding: ${({ theme }) => theme.space.medium};
  border: 1px solid ${({ theme }) => theme.color.inputBorder};
  border-radius: 6px;
  background-color: ${({ theme }) => theme.color.surface};
  color: ${({ theme }) => theme.color.text};
  box-shadow: inset 0 1px 2px ${({ theme }) => theme.color.shadow};
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;

  @media (max-width: ${({ theme }) => theme.size.small}) {
    border-width: 1.5px;
    border-color: ${({ theme }) => theme.color.inputBorderStrong};
  }

  &:focus {
    outline: 0;
    border-color: ${({ theme }) => theme.color.accent};
  }
`

export const selectChevronFieldStyles = css`
  appearance: none;
  background-image: ${selectChevron};
  background-repeat: no-repeat;
  background-position: right ${({ theme }) => theme.space.medium} center;
  background-size: 0.75rem;
  cursor: pointer;
`
