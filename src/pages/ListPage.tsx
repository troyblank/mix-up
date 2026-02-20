import { useParams } from 'react-router-dom'
import styled from 'styled-components'

const ListPageWrapper = styled.main`
  max-width: 40rem;
  margin: 0 auto;
`

export function ListPage() {
  const { listId } = useParams<{ listId: string }>()

  return (
    <ListPageWrapper>
      <h1>List</h1>
      <p>List ID: {listId}</p>
    </ListPageWrapper>
  )
}
