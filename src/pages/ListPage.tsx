import type { FunctionComponent } from 'react'
import { useParams } from 'react-router-dom'
import { RandomItem } from '../components'

import { PageWrapper } from './page.styles'

export const ListPage: FunctionComponent = () => {
  const { listId } = useParams<{ listId: string }>()

  return (
    <PageWrapper as={'main'}>
      <RandomItem id={listId} />
    </PageWrapper>
  )
}
