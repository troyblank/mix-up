import styled from 'styled-components'

export const Message = styled.p`
  margin: 0 0 ${({ theme }) => theme.space.medium};
  font-size: 0.95rem;
  line-height: 1.45;
  text-align: center;
  color: ${({ theme }) => theme.color.text};
`

export const MessageEmphasis = styled.span`
  display: block;
  margin-top: ${({ theme }) => theme.space.small};
  font-weight: 600;
`
