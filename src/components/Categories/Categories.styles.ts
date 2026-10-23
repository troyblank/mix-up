import styled from 'styled-components'
import { surfaceFieldStyles } from '../../graphics'
import { AppButton, AppButtonLink } from '../AppButton'

export const ButtonList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.medium};
`

export const CategoryRow = styled.li`
  display: flex;
  align-items: stretch;
  gap: ${({ theme }) => theme.space.small};
`

export const CategoryLink = styled(AppButtonLink)`
  && {
    flex: 1 1 auto;
    width: auto;
    min-width: 0;
  }
`

export const AddItemButton = styled(AppButton).attrs({
  $variant: 'primary',
  $layout: 'inline',
})`
  && {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 ${({ theme }) => theme.space.maximum};
    width: ${({ theme }) => theme.space.maximum};
    align-self: stretch;
    padding: 0;
  }
`

export const AddItemForm = styled.form`
  margin: 0;
  width: 100%;
`

export const AddItemInput = styled.input`
  ${surfaceFieldStyles}
`
