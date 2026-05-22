import styled from 'styled-components'
import { DangerButton } from '../AppButton'
import { Spinner } from '../Loader/Loader.styles'

export const ConfirmDangerButton = styled(DangerButton)`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(1em + 2 * ${({ theme }) => theme.space.medium});

  &[aria-busy='true'] {
    padding: ${({ theme }) => theme.space.none};
  }
`

export const ConfirmButtonSpinner = styled(Spinner).attrs({
  $inButton: true,
})``

export const Message = styled.div`
  margin: 0 0 ${({ theme }) => theme.space.medium};
  font-size: 0.95rem;
  line-height: 1.45;
  text-align: center;
  color: ${({ theme }) => theme.color.text};
`

export const MessageEmphasis = styled.span`
  display: block;
  margin-top: ${({ theme }) => theme.space.small};
  font-weight: 600;
`
