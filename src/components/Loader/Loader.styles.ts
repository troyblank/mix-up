import styled, { keyframes } from 'styled-components'

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`

export const LoaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
`

export const Spinner = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid ${({ theme }) => theme.color.textMuted};
  border-top-color: ${({ theme }) => theme.color.accent};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`

export const LoaderLabel = styled.span`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`
