import styled from 'styled-components'
import {
  selectChevronFieldStyles,
  surfaceFieldStyles,
} from '../../graphics'

export const ListSelect = styled.select`
  ${surfaceFieldStyles}
  ${selectChevronFieldStyles}
  padding: ${({ theme }) => theme.space.medium}
    calc(${({ theme }) => theme.space.extraLarge} + 1.25rem)
    ${({ theme }) => theme.space.medium}
    ${({ theme }) => theme.space.medium};
`
