import styled from 'styled-components'

export const Alert = styled.div`
  display: flex;
  align-items: flex-start;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  padding: ${({ theme }) => theme.space.medium};
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background-color: color-mix(
    in srgb,
    ${({ theme }) => theme.color.danger} 30%,
    transparent
  );
  color: ${({ theme }) => theme.color.text};
  font-size: 0.875rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin: 0 0 ${({ theme }) => theme.space.medium};
`
