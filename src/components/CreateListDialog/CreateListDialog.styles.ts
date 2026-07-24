import styled from 'styled-components'
import {
  dialogFieldStyles,
  selectChevronFieldStyles,
} from '../../graphics'

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
  ${dialogFieldStyles}
`

export const Select = styled.select`
  ${dialogFieldStyles}
  ${selectChevronFieldStyles}
  padding-right: calc(${({ theme }) => theme.space.extraLarge} + 1.25rem);
`
