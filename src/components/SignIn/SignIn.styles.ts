import styled, { keyframes } from 'styled-components'

import { AppButton } from '../AppButton'

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`

export const FormWrap = styled.div`
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  min-width: 0;

  @media (max-width: ${({ theme }) => theme.size.small}) {
    max-width: 100%;
  }
`

export const SignInHeader = styled.header`
  margin: ${({ theme }) => theme.space.maximum} 0;
  text-align: right;

  @media (max-width: ${({ theme }) => theme.size.small}) {
    margin-bottom: ${({ theme }) => theme.space.extraLarge};
  }
`

export const IconLogo = styled.div`
  width: 100px;
  height: 100px;
  margin: 0 auto;
  float: none;
  color: ${({ theme }) => theme.color.accent};
`

export const Form = styled.form`
  width: 100%;
  max-width: 100%;
  min-width: 0;
  padding-bottom: ${({ theme }) => theme.space.extraLarge};
`

export const FieldRow = styled.div`
  width: 100%;
  min-width: 0;

  label {
    display: block;
  }
`

export const AlertError = styled.div`
  display: flex;
  align-items: flex-start;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  padding: ${({ theme }) => theme.space.medium};
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background-color: color-mix(
    in srgb,
    ${({ theme }) => theme.color.danger} 30%,
    transparent
  );

  color: ${({ theme }) => theme.color.text};
  font-size: 0.875rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: ${({ theme }) => theme.space.extraSmall};
`

export const IconAlertError = styled.div`
  position: relative;
  top: 2px;
  width: 15px;
  height: 15px;
  margin-right: ${({ theme }) => theme.space.small};
  flex-shrink: 0;
  color: ${({ theme }) => theme.color.text};
`

export const SubmitRow = styled.div`
  width: 100%;
  min-width: 0;
`

export const SubmitButton = styled(AppButton).attrs({
  type: 'submit',
  $variant: 'primary',
  $layout: 'form',
})`
  && {
    &:disabled {
      cursor: wait;
      opacity: 0.75;
    }
  }
`

export const SubmitButtonSpinner = styled.span`
  width: 1rem;
  height: 1rem;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: ${spin} 0.75s linear infinite;
  flex-shrink: 0;
`

export const ForgotPasswordLink = styled.div`
  text-align: right;

  a {
    color: ${({ theme }) => theme.color.textMuted};
    text-decoration: none;
    cursor: pointer;
    transition: color 0.15s ease;

    &:hover {
      color: ${({ theme }) => theme.color.accent};
    }

    &:focus-visible {
      outline: 2px solid ${({ theme }) => theme.color.accent};
      outline-offset: 2px;
      border-radius: 2px;
    }
  }
`
