import styled from 'styled-components'

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.space.medium};
  box-sizing: border-box;
  pointer-events: auto;
`

export const Backdrop = styled.div`
  position: absolute;
  inset: 0;
  background: ${({ theme }) => theme.color.shadow};
  backdrop-filter: blur(2px);
`

export const Panel = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 22rem;
  padding: ${({ theme }) => theme.space.large} ${({ theme }) => theme.space.large}
    ${({ theme }) => theme.space.medium};
  border-radius: 0.75rem;
  background: ${({ theme }) => theme.color.surface};
  color: ${({ theme }) => theme.color.text};
  box-shadow: 0 8px 32px ${({ theme }) => theme.color.shadow};
`

export const DialogTitle = styled.h2`
  margin: 0 0 ${({ theme }) => theme.space.medium};
  font-size: 1.15rem;
  font-weight: 600;
  text-align: center;
`
