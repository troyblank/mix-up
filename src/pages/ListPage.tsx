import type { FunctionComponent } from 'react'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import {
  ActionMenu,
  DeleteIcon,
  PlusIcon,
  RandomItem,
  RefreshIcon,
} from '../components'
import { useList } from '../hooks/useList'

import { PageWrapper } from './page.styles'

export const ListPage: FunctionComponent = () => {
  const { listId } = useParams<{ listId: string }>()
  const { data: list, isLoading, isError } = useList(listId)

  const hasBottomMenu = Boolean(
    listId && !isLoading && !isError && list,
  )

  const menuActions = useMemo(
    () =>
      hasBottomMenu
        ? [
            {
              id: 'add',
              ariaLabel: 'Add',
              icon: <PlusIcon />,
            },
            {
              id: 'refresh-choice',
              ariaLabel: 'Refresh choice',
              icon: <RefreshIcon />,
            },
            {
              id: 'delete',
              ariaLabel: 'Delete',
              icon: <DeleteIcon />,
            },
          ]
        : [],
    [hasBottomMenu],
  )

  return (
    <PageWrapper as={'main'}>
      <RandomItem id={listId} />
      <ActionMenu actions={menuActions} onAction={() => {}} />
    </PageWrapper>
  )
}
