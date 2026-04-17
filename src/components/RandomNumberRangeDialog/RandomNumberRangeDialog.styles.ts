import styled, { keyframes } from 'styled-components'

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

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.space.medium};
  box-sizing: border-box;
  pointer-events: auto;
`

export const Backdrop = styled.div`
  position: absolute;
  inset: 0;
  background: ${({ theme }) => theme.color.shadow};
  backdrop-filter: blur(2px);
`

export const Panel = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 22rem;
  padding: ${({ theme }) => theme.space.large} ${({ theme }) => theme.space.large}
    ${({ theme }) => theme.space.medium};
  border-radius: 0.75rem;
  background: ${({ theme }) => theme.color.surface};
  color: ${({ theme }) => theme.color.text};
  box-shadow: 0 8px 32px ${({ theme }) => theme.color.shadow};
`

export const DialogTitle = styled.h2`
  margin: 0 0 ${({ theme }) => theme.space.medium};
  font-size: 1.15rem;
  font-weight: 600;
  text-align: center;
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
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space.small};
  justify-content: center;
  margin-top: ${({ theme }) => theme.space.small};
`

const buttonBase = styled.button`
  padding: ${({ theme }) => theme.space.small} ${({ theme }) => theme.space.medium};
  border-radius: 0.35rem;
  font: inherit;
  font-size: 0.95rem;
  cursor: pointer;
  border: none;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.accent};
    outline-offset: 2px;
  }
`

export const PrimaryButton = styled(buttonBase)`
  background: ${({ theme }) => theme.color.accent};
  color: ${({ theme }) => theme.color.bg};

  &:hover {
    background: ${({ theme }) => theme.color.accentHover};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`

export const SecondaryButton = styled(buttonBase)`
  background: transparent;
  color: ${({ theme }) => theme.color.textMuted};

  &:hover {
    color: ${({ theme }) => theme.color.text};
  }
`
