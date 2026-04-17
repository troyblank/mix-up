import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'

export const ButtonList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.medium};
`

const buttonStyles = css`
  display: block;
  padding: ${({ theme }) => theme.space.medium};
  font-size: 1rem;
  font-family: inherit;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.15s ease;
  text-decoration: none;
  text-align: center;
`

export const ButtonLink = styled(Link)`
  ${buttonStyles}
  color: ${({ theme }) => theme.color.bg};
  background-color: ${({ theme }) => theme.color.accent};

  &:hover {
    background-color: ${({ theme }) => theme.color.accentHover};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.accent};
    outline-offset: ${({ theme }) => theme.space.extraSmall};
  }
`
