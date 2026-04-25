import type { ComponentProps } from 'react'
import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'

export type AppButtonVariant = 'primary' | 'secondary' | 'danger'
export type AppButtonLayout = 'inline' | 'navigation' | 'form'

type AppButtonTransientProps = {
  $variant?: AppButtonVariant
  $layout?: AppButtonLayout
}

const shouldForwardAppButtonProp = (prop: PropertyKey) =>
  prop !== '$variant' && prop !== '$layout'

const focusRing = css`
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.accent};
    outline-offset: ${({ theme }) => theme.space.extraSmall};
  }
`

const typography = css`
  font-family: inherit;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  line-height: 0;
`

const surfaceTransition = css`
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    filter 0.2s ease;
`

const layoutInline = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.space.small};
  padding: calc(${({ theme }) => theme.space.small} + 1px)
    ${({ theme }) => theme.space.large}
    calc(${({ theme }) => theme.space.small} - 1px);
  border-radius: 6px;
  font-size: 0.95rem;
`

const layoutNavigation = css`
  display: block;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: calc(${({ theme }) => theme.space.large} + 1px)
    ${({ theme }) => theme.space.large}
    calc(${({ theme }) => theme.space.large} - 1px);
  border-radius: 6px;
  font-size: 1rem;
  text-align: center;
`

const layoutForm = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.space.small};
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  margin-top: ${({ theme }) => theme.space.large};
  margin-bottom: ${({ theme }) => theme.space.large};
  padding: calc(${({ theme }) => theme.space.medium} + 1px)
    ${({ theme }) => theme.space.medium}
    calc(${({ theme }) => theme.space.medium} - 1px);
  border-radius: 6px;
  font-size: inherit;
  min-height: ${({ theme }) => theme.space.maximum};
`

const variantPrimary = css`
  background: ${({ theme }) => theme.color.accent};
  color: ${({ theme }) => theme.color.bg};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.color.accentHover};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`

const variantSecondary = css`
  background: transparent;
  color: ${({ theme }) => theme.color.textMuted};

  &:hover {
    color: ${({ theme }) => theme.color.text};
  }
`

const variantDanger = css`
  background: ${({ theme }) => theme.color.danger};
  color: ${({ theme }) => theme.color.bg};

  &:hover:not(:disabled) {
    filter: brightness(1.12);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`

export const AppButton = styled.button
  .withConfig({ shouldForwardProp: shouldForwardAppButtonProp })
  .attrs((props: ComponentProps<'button'> & AppButtonTransientProps) => ({
    type: props.type !== undefined ? props.type : 'button',
  }))
  <AppButtonTransientProps>`
  border: none;
  cursor: pointer;
  -webkit-appearance: none;
  ${typography}
  ${focusRing}
  ${surfaceTransition}

  ${({ $layout = 'inline' }) =>
    $layout === 'navigation'
      ? layoutNavigation
      : $layout === 'form'
        ? layoutForm
        : layoutInline}

  ${({ $variant = 'primary' }) =>
    $variant === 'secondary'
      ? variantSecondary
      : $variant === 'danger'
        ? variantDanger
        : variantPrimary}
`

/** Home list links — same primary surface as {@link PrimaryButton}. */
export const AppButtonLink = styled(Link)`
  ${typography}
  ${layoutNavigation}
  ${variantPrimary}
  ${focusRing}
  ${surfaceTransition}
  border: none;
  cursor: pointer;
  text-decoration: none;
`

export const PrimaryButton = styled(AppButton).attrs({
  $variant: 'primary',
  $layout: 'navigation',
})``

export const SecondaryButton = styled(AppButton).attrs({
  $variant: 'secondary',
  $layout: 'navigation',
})``

export const DangerButton = styled(AppButton).attrs({
  $variant: 'danger',
  $layout: 'navigation',
})``
