import styled, { keyframes } from 'styled-components'

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`

export const LoaderWrapper = styled.div<{ $inButton?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme, $inButton }) =>
    $inButton ? theme.space.none : theme.space.medium};
  padding: ${({ theme, $inButton }) =>
    $inButton ? theme.space.none : theme.space.extraLarge};
`

export const Spinner = styled.div<{ $inButton?: boolean }>`
  width: ${({ $inButton }) => ($inButton ? '1em' : '2.5rem')};
  height: ${({ $inButton }) => ($inButton ? '1em' : '2.5rem')};
  border: ${({ $inButton }) => ($inButton ? '2px' : '3px')} solid
    ${({ theme, $inButton }) =>
      $inButton ? 'currentColor' : theme.color.textMuted};
  border-top-color: ${({ theme, $inButton }) =>
    $inButton ? 'transparent' : theme.color.accent};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
  flex-shrink: ${({ $inButton }) => ($inButton ? 0 : undefined)};
  padding: ${({ $inButton, theme }) =>
    $inButton ? theme.space.none : undefined};
  margin: ${({ $inButton, theme }) =>
    $inButton ? theme.space.none : undefined};
  box-sizing: border-box;
`

export const LoaderLabel = styled.span`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`
