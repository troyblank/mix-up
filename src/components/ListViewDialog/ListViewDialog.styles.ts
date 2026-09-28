import styled from 'styled-components'

export const ListViewContainer = styled.div`
  width: min(100%, 32rem);
  max-height: min(80vh, 40rem);
  display: flex;
  flex-direction: column;
`

export const ListViewTitle = styled.h2`
  margin: 0 0 ${({ theme }) => theme.space.medium};
  font-size: ${({ theme }) => theme.font.sizeMedium};
  font-weight: ${({ theme }) => theme.font.weightSemibold};
  text-align: center;
`

// overflow-y: auto makes the list a scroll container, which clips outside
// markers that overflow the left padding. Reserve room for the widest number
// (one ch per digit) so "100." and beyond are never cut off.
export const ListViewItems = styled.ol<{ $digitCount: number }>`
  margin: 0;
  padding-left: calc(
    ${({ $digitCount }) => $digitCount}ch + ${({ theme }) => theme.space.extraSmall}
  );
  overflow-y: auto;
`

export const ListViewItem = styled.li`
  margin: ${({ theme }) => theme.space.small} 0;
  color: ${({ theme }) => theme.color.text};
`
