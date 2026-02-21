import styled from 'styled-components'

export const RandomPickWrapper = styled.div`
  margin-top: 1.5rem;
`

export const ListTitle = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  margin: 0 0 1.5rem;
  text-align: center;
  text-transform: uppercase;
  color: ${({ theme }) => theme.color.text};
`

export const PickedItem = styled.p`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
  color: ${({ theme }) => theme.color.text};
`
