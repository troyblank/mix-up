import styled, { keyframes } from 'styled-components'
import {
  selectChevronFieldStyles,
  surfaceFieldStyles,
} from '../../graphics'

const dealCardIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(1rem) scale(0.92)
      rotate(var(--deal-from-rotate, -2deg));
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1) rotate(0deg);
  }
`

export const RandomPickWrapper = styled.div`
  margin-top: ${({ theme }) => theme.space.large};
`

export const ListTitle = styled.h1`
  font-size: ${({ theme }) => theme.font.sizeScreenLarge};
  font-weight: ${({ theme }) => theme.font.weightSemibold};
  margin: 0 0 ${({ theme }) => theme.space.large};
  text-align: center;
  text-transform: uppercase;
  color: ${({ theme }) => theme.color.text};
`

export const PickedItem = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.font.sizeMedium};
  font-weight: ${({ theme }) => theme.font.weightSemibold};
  text-align: center;
  color: ${({ theme }) => theme.color.text};
`

export const PickedItemDealing = styled(PickedItem)`
  --deal-from-rotate: -2.5deg;
  animation: ${dealCardIn} 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 1;
    transform: none;
  }
`

export const EmptyListMessage = styled.p`
  margin: 0;
  padding: ${({ theme }) => theme.space.medium}
    ${({ theme }) => theme.space.large};
  border: 1px solid
    color-mix(
      in srgb,
      ${({ theme }) => theme.color.warning} 45%,
      transparent
    );
  border-radius: 6px;
  background-color: color-mix(
    in srgb,
    ${({ theme }) => theme.color.warning} 10%,
    transparent
  );
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  color: ${({ theme }) => theme.color.warning};
  font-size: 0.95rem;
  font-weight: ${({ theme }) => theme.font.weightSemibold};
  text-align: center;
  line-height: 1.45;
`

export const ShuffledList = styled.ol`
  padding: 0;
  list-style-position: inside;
`

export const ShuffledListItem = styled.li`
  margin: ${({ theme }) => theme.space.small} 0;
  font-size: ${({ theme }) => theme.font.sizeMedium};
  font-weight: ${({ theme }) => theme.font.weightSemibold};
  text-align: center;
  color: ${({ theme }) => theme.color.text};
`

export const AddItemInput = styled.input`
  ${surfaceFieldStyles}
`

export const DeleteItemSelect = styled.select`
  ${surfaceFieldStyles}
  ${selectChevronFieldStyles}
  padding: ${({ theme }) => theme.space.medium}
    calc(${({ theme }) => theme.space.extraLarge} + 1.25rem)
    ${({ theme }) => theme.space.medium}
    ${({ theme }) => theme.space.medium};
`

export const DeleteItemCheckboxList = styled.ul`
  list-style: none;
  padding: 0;
  margin: ${({ theme }) => theme.space.small} 0 0;
  max-height: 12rem;
  overflow-y: auto;
`

export const DeleteItemCheckboxField = styled.li`
  margin: ${({ theme }) => theme.space.small} 0;
`

export const DeleteItemCheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.small};
  cursor: pointer;
  font-size: inherit;
  color: ${({ theme }) => theme.color.text};
`

export const DeleteItemCheckboxInput = styled.input.attrs({ type: 'checkbox' })`
  margin: 0;
  width: 1.125em;
  height: 1.125em;
  accent-color: ${({ theme }) => theme.color.accent};
  cursor: pointer;
  flex-shrink: 0;
`

export const ShuffledListItemDealing = styled(ShuffledListItem)<{
  $dealIndex: number
}>`
  --deal-from-rotate: ${({ $dealIndex }) =>
    $dealIndex % 2 === 0 ? '-2.5deg' : '2deg'};
  animation: ${dealCardIn} 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  animation-delay: ${({ $dealIndex }) => $dealIndex * 55}ms;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 1;
    transform: none;
  }
`
