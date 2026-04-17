import type { FunctionComponent } from 'react'
import { useState } from 'react'
import {
  ActionMenu,
  Categories,
  RandomNumberRangeDialog,
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
]

export const HomePage: FunctionComponent = () => {
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
              // coming soon
              break
            case 'random-from-range':
              setRandomRangeOpen(true)
              break
          }
        }}
      />
      <RandomNumberRangeDialog
        isOpen={isRandomRangeOpen}
        onClose={() => setRandomRangeOpen(false)}
      />
    </PageWrapper>
  )
}
