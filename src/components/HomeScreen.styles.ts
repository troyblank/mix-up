import styled from 'styled-components'

export const HomeScreenWrapper = styled.div`
  max-width: 40rem;
  margin: 0 auto;
`

export const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  margin: 0 0 1.5rem;
  text-align: center;
  text-transform: uppercase;
  color: ${({ theme }) => theme.color.text};
`

export const ButtonList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

export const Button = styled.button`
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-family: inherit;
  color: ${({ theme }) => theme.color.bg};
  background-color: ${({ theme }) => theme.color.accent};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: ${({ theme }) => theme.color.accentHover};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.accent};
    outline-offset: 2px;
  }
`
