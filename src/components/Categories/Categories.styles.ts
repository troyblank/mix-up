import styled from 'styled-components'

export { AppButtonLink as ButtonLink } from '../AppButton'

export const ButtonList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.medium};
`
