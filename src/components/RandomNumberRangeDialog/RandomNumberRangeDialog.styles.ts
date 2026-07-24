import styled, { keyframes } from 'styled-components'
import { dialogFieldStyles } from '../../graphics'

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

export const CheckboxField = styled(Field)`
  display: flex;
  justify-content: center;
`

export const CheckboxLabel = styled.label`
  display: table;
  margin: 0;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.color.textMuted};
  cursor: pointer;
  line-height: 1.25;
`

export const CheckboxControl = styled.span`
  display: table-cell;
  vertical-align: middle;
  width: 0;
  padding-right: ${({ theme }) => theme.space.small};
  line-height: 0;
`

export const CheckboxText = styled.span`
  display: table-cell;
  vertical-align: middle;
  margin: 0;
  padding: 0;
  line-height: 1.25;
  position: relative;
  top: 2px;
`

export const CheckboxInput = styled.input.attrs({ type: 'checkbox' })`
  margin: 0;
  display: block;
  width: 1.125em;
  height: 1.125em;
  accent-color: ${({ theme }) => theme.color.accent};
  cursor: pointer;
`

export const Label = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.space.small};
  font-size: 0.9rem;
  color: ${({ theme }) => theme.color.textMuted};
`

const dividerLine = `
  border: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`

export const Divider = styled.hr`
  ${dividerLine}
  margin: 0 0 ${({ theme }) => theme.space.medium};
`

export const Input = styled.input`
  ${dialogFieldStyles}
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
