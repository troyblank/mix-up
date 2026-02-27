import type { FunctionComponent } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { RandomItem } from '../components/RandomItem'

const ListPageWrapper = styled.main`
  max-width: 40rem;
  margin: 0 auto;
`

export const ListPage: FunctionComponent = () => {
  const { listId } = useParams<{ listId: string }>()

  return (
    <ListPageWrapper>
      <RandomItem id={listId} />
    </ListPageWrapper>
  )
}
