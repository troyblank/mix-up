import type { FunctionComponent } from 'react'
import { useState } from 'react'
import {
  ActionMenu,
  Categories,
  CreateListDialog,
  DeleteListDialog,
  RandomNumberRangeDialog,
  DeleteIcon,
  PlusIcon,
  ShuffleIcon,
} from '../components'
import { PageWrapper, Title } from './page.styles'

const homeMenuActions = [
  {
    id: 'add',
    ariaLabel: 'Add',
    icon: <PlusIcon />,
  },
  {
    id: 'random-from-range',
    ariaLabel: 'Random from range',
    icon: <ShuffleIcon />,
  },
  {
    id: 'delete',
    ariaLabel: 'Delete',
    icon: <DeleteIcon />,
  },
]

export const HomePage: FunctionComponent = () => {
  const [isCreateListOpen, setCreateListOpen] = useState(false)
  const [isDeleteListOpen, setDeleteListOpen] = useState(false)
  const [isRandomRangeOpen, setRandomRangeOpen] = useState(false)

  return (
    <PageWrapper>
      <Title>Mix Up</Title>
      <Categories />
      <ActionMenu
        actions={homeMenuActions}
        onAction={(actionId) => {
          switch (actionId) {
            case 'add':
              setCreateListOpen(true)
              break
            case 'random-from-range':
              setRandomRangeOpen(true)
              break
            case 'delete':
              setDeleteListOpen(true)
              break
          }
        }}
      />
      <CreateListDialog
        isOpen={isCreateListOpen}
        onClose={() => setCreateListOpen(false)}
      />
      <DeleteListDialog
        isOpen={isDeleteListOpen}
        onClose={() => setDeleteListOpen(false)}
      />
      <RandomNumberRangeDialog
        isOpen={isRandomRangeOpen}
        onClose={() => setRandomRangeOpen(false)}
      />
    </PageWrapper>
  )
}
