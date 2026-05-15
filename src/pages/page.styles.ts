import styled from 'styled-components'

export const PageWrapper = styled.main`
  max-width: 40rem;
  margin: 0 auto;
`

export const Title = styled.h1`
  font-size: ${({ theme }) => theme.font.sizeScreenLarge};
  font-weight: ${({ theme }) => theme.font.weightSemibold};
  margin: 0 0 ${({ theme }) => theme.space.large};
  text-align: center;
  text-transform: uppercase;
  color: ${({ theme }) => theme.color.text};
`
