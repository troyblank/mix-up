import type { FunctionComponent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import type { ListItem } from '../../api/graphql'
import { ActionMenu } from '../ActionMenu'
import { RefreshIcon } from '../icons'
import { ErrorAlert } from '../ErrorAlert'
import { Loader } from '../Loader'
import { useList } from '../../hooks/useList'
import { shuffleArray } from '../../utils/random'
import {
  ListTitle,
  RandomPickWrapper,
  ShuffledList,
  ShuffledListItemDealing,
} from '../RandomPick/RandomPick.styles'

type RandomListProps = {
  id: string | undefined
}

export const RandomList: FunctionComponent<RandomListProps> = ({ id }) => {
  const { data: list, isLoading, isError, error } = useList(id)
  const [orderedItems, setOrderedItems] = useState<ListItem[]>([])
  const [dealCycle, setDealCycle] = useState(0)

  const menuActions = useMemo(
    () => [
      {
        id: 'refresh-choice',
        ariaLabel: 'Refresh choice',
        icon: <RefreshIcon />,
      },
    ],
    [],
  )

  useEffect(() => {
    if (!list?.items?.length) {
      setOrderedItems([])
      return
    }

    setDealCycle((c) => c + 1)
    setOrderedItems(shuffleArray([...list.items]))
  }, [
    list?.id,
    list?.items?.length,
    (list?.items ?? [])
      .map((item) => item.id)
      .sort()
      .join('|'),
  ])

  if (!id) return null
  if (isLoading) return <Loader text={'Loading list'} />
  if (isError)
    return <ErrorAlert message={'Failed to load list'} error={error} />
  if (list == null) return null
  if (list.items.length === 0) {
    return <p>This list has no items.</p>
  }

  return (
    <>
      <RandomPickWrapper>
        <ListTitle>{list.name}</ListTitle>
        <ShuffledList>
          {orderedItems.map((item, index) => (
            <ShuffledListItemDealing
              key={`${item.id}-${dealCycle}`}
              $dealIndex={index}
            >
              {item.name ?? ''}
            </ShuffledListItemDealing>
          ))}
        </ShuffledList>
      </RandomPickWrapper>
      <ActionMenu
        actions={menuActions}
        onAction={() => {
          setDealCycle((c) => c + 1)
          setOrderedItems(shuffleArray([...list.items]))
        }}
      />
    </>
  )
}
