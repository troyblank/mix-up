import styled from 'styled-components'

export const ActionMenuBar = styled.nav`
  position: fixed;
  z-index: 10;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${({ theme }) => theme.space.medium};
  padding: ${({ theme }) => theme.space.medium};
  padding-bottom: ${({ theme }) => theme.space.safeBottomNavigation};
  background: linear-gradient(
    to top,
    color-mix(in srgb, ${({ theme }) => theme.color.bg} 95%, transparent) 0%,
    color-mix(in srgb, ${({ theme }) => theme.color.bg} 60%, transparent) 55%,
    transparent 100%
  );
  pointer-events: none;

  & > * {
    pointer-events: auto;
  }
`

export const ActionMenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  padding: 0;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  background: ${({ theme }) => theme.color.surface};
  color: ${({ theme }) => theme.color.text};
  box-shadow: 0 4px 14px ${({ theme }) => theme.color.shadow};
  transition:
    background-color 0.5s ease,
    color 0.5s ease,
    transform 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.color.accent};
    color: ${({ theme }) => theme.color.bg};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.accent};
    outline-offset: ${({ theme }) => theme.space.extraSmall};
  }
`
