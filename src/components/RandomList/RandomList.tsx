import type { FunctionComponent } from 'react'
import { useEffect, useId, useMemo, useState } from 'react'
import type { ListItem } from '../../api/graphql'
import { ActionMenu } from '../ActionMenu'
import { ConfirmDialog } from '../ConfirmDialog'
import { DeleteIcon, PlusIcon, RefreshIcon } from '../icons'
import { ErrorAlert } from '../ErrorAlert'
import { Loader } from '../Loader'
import { useDeleteListItems } from '../../hooks/useDeleteListItems'
import { useInsertListItem } from '../../hooks/useInsertListItem'
import { useList } from '../../hooks/useList'
import { shuffleArray } from '../../utils/random'
import { itemDisplayName } from '../RandomPick/utils'
import {
  AddItemInput,
  DeleteItemCheckboxField,
  DeleteItemCheckboxInput,
  DeleteItemCheckboxLabel,
  DeleteItemCheckboxList,
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
  const deleteListItemsMutation = useDeleteListItems(id)
  const insertListItemMutation = useInsertListItem(id)
  const [orderedItems, setOrderedItems] = useState<ListItem[]>([])
  const [dealCycle, setDealCycle] = useState(0)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [addItemName, setAddItemName] = useState('')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedDeleteIds, setSelectedDeleteIds] = useState<Set<string>>(
    () => new Set(),
  )
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
      {
        id: 'delete',
        ariaLabel: 'Delete',
        icon: <DeleteIcon />,
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

  const toggleDeleteSelection = (itemId: string) => {
    setSelectedDeleteIds((current) => {
      const next = new Set(current)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }

  const onMenuAction = (actionId: string) => {
    if (actionId === 'add') {
      setAddItemName('')
      setIsAddDialogOpen(true)
      return
    }

    if (actionId === 'delete') {
      setSelectedDeleteIds(new Set())
      setIsDeleteDialogOpen(true)
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

  const deleteConfirmMessage =
    list.items.length > 0 ? (
      <>
        Select items to delete:
        <DeleteItemCheckboxList>
          {list.items.map((item) => (
            <DeleteItemCheckboxField key={item.id}>
              <DeleteItemCheckboxLabel>
                <DeleteItemCheckboxInput
                  checked={selectedDeleteIds.has(item.id)}
                  disabled={deleteListItemsMutation.isPending}
                  onChange={() => toggleDeleteSelection(item.id)}
                  aria-label={itemDisplayName(item)}
                />
                {itemDisplayName(item)}
              </DeleteItemCheckboxLabel>
            </DeleteItemCheckboxField>
          ))}
        </DeleteItemCheckboxList>
      </>
    ) : (
      'Are you sure you want to delete these items?'
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
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title={'Delete items?'}
        message={deleteConfirmMessage}
        isConfirmPending={deleteListItemsMutation.isPending}
        closeOnConfirm={false}
        onClose={() => {
          if (!deleteListItemsMutation.isPending) {
            setIsDeleteDialogOpen(false)
          }
        }}
        onConfirm={() => {
          if (selectedDeleteIds.size === 0) return

          deleteListItemsMutation.mutate(Array.from(selectedDeleteIds), {
            onSuccess: () => {
              setIsDeleteDialogOpen(false)
              setSelectedDeleteIds(new Set())
            },
          })
        }}
      />
    </>
  )
}
