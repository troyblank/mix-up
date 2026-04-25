import styled, { keyframes } from 'styled-components'

export { PrimaryButton, SecondaryButton } from '../AppButton'

const resultPickPulse = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.45);
    filter: blur(4px);
  }
  35% {
    opacity: 1;
    transform: scale(1.28);
    filter: blur(0);
  }
  55% {
    transform: scale(0.9);
  }
  75% {
    transform: scale(1.08);
  }
  100% {
    opacity: 1;
    transform: scale(1);
    filter: blur(0);
  }
`

export const Field = styled.div`
  margin-bottom: ${({ theme }) => theme.space.medium};
`

export const Label = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.space.small};
  font-size: 0.9rem;
  color: ${({ theme }) => theme.color.textMuted};
`

export const Input = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: ${({ theme }) => theme.space.small}
    ${({ theme }) => theme.space.medium};
  border: 1px solid ${({ theme }) => theme.color.textMuted};
  border-radius: 0.35rem;
  font: inherit;
  color: ${({ theme }) => theme.color.text};
  background: ${({ theme }) => theme.color.bg};

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.accent};
    outline-offset: 2px;
  }
`

export const ErrorText = styled.p`
  margin: 0 0 ${({ theme }) => theme.space.medium};
  font-size: 0.85rem;
  color: ${({ theme }) => theme.color.danger};
`

export const Result = styled.p`
  margin: 0 0 ${({ theme }) => theme.space.medium};
  font-size: clamp(2rem, 12vw, 3rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  text-align: center;
  color: ${({ theme }) => theme.color.accent};
  transform-origin: center center;
  animation: ${resultPickPulse} 0.85s cubic-bezier(0.22, 1.35, 0.36, 1);

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

export const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.small};
  width: 100%;
  margin-top: ${({ theme }) => theme.space.small};
`
