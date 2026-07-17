import type { FunctionComponent } from 'react'
import { useEffect, useId, useMemo, useState } from 'react'
import type { ListItem } from '../../api/graphql'
import { ActionMenu } from '../ActionMenu'
import { ConfirmDialog } from '../ConfirmDialog'
import { PlusIcon, RefreshIcon } from '../icons'
import { ErrorAlert } from '../ErrorAlert'
import { Loader } from '../Loader'
import { useInsertListItem } from '../../hooks/useInsertListItem'
import { useList } from '../../hooks/useList'
import { shuffleArray } from '../../utils/random'
import {
  AddItemInput,
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
  const insertListItemMutation = useInsertListItem(id)
  const [orderedItems, setOrderedItems] = useState<ListItem[]>([])
  const [dealCycle, setDealCycle] = useState(0)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [addItemName, setAddItemName] = useState('')
  const addItemInputId = useId()

  const menuActions = useMemo(
    () => [
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

  const onMenuAction = (actionId: string) => {
    if (actionId === 'add') {
      setAddItemName('')
      setIsAddDialogOpen(true)
      return
    }

    if (actionId === 'refresh-choice' && list.items.length > 0) {
      setDealCycle((c) => c + 1)
      setOrderedItems(shuffleArray([...list.items]))
    }
  }

  const addConfirmMessage = (
    <AddItemInput
      id={addItemInputId}
      aria-label={'Item name'}
      value={addItemName}
      disabled={insertListItemMutation.isPending}
      onChange={(event) => setAddItemName(event.target.value)}
    />
  )

  return (
    <>
      <RandomPickWrapper>
        <ListTitle>{list.name}</ListTitle>
        {list.items.length === 0 ? (
          <p>This list has no items.</p>
        ) : (
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
        )}
      </RandomPickWrapper>
      <ActionMenu actions={menuActions} onAction={onMenuAction} />
      <ConfirmDialog
        isOpen={isAddDialogOpen}
        title={'Add item'}
        message={addConfirmMessage}
        isConfirmPending={insertListItemMutation.isPending}
        confirmPendingAriaLabel={'Adding'}
        confirmVariant={'success'}
        closeOnConfirm={false}
        onClose={() => {
          if (!insertListItemMutation.isPending) {
            setIsAddDialogOpen(false)
          }
        }}
        onConfirm={() => {
          const trimmedName = addItemName.trim()
          if (trimmedName.length === 0) return

          insertListItemMutation.mutate(trimmedName, {
            onSuccess: () => setIsAddDialogOpen(false),
          })
        }}
      />
    </>
  )
}
