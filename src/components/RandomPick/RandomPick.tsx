import type { FunctionComponent } from 'react'
import { useEffect, useId, useMemo, useState } from 'react'
import { ActionMenu } from '../ActionMenu'
import { ConfirmDialog } from '../ConfirmDialog'
import { DeleteIcon, PlusIcon, RefreshIcon } from '../icons'
import { ErrorAlert } from '../ErrorAlert'
import { Loader } from '../Loader'
import { useDeleteListItem } from '../../hooks/useDeleteListItem'
import { useInsertListItem } from '../../hooks/useInsertListItem'
import { useList } from '../../hooks/useList'
import { pickRandom } from '../../utils/random'
import {
  AddItemInput,
  DeleteItemSelect,
  EmptyListMessage,
  RandomPickWrapper,
  ListTitle,
  PickedItemDealing,
} from './RandomPick.styles'
import {
  itemDisplayName,
  resolveDeleteTargetId,
  sortItemsAlphabetically,
} from './utils'

type RandomPickProps = {
  id: string | undefined
}

export const RandomPick: FunctionComponent<RandomPickProps> = ({ id }) => {
  const { data: list, isLoading, isError, error } = useList(id)
  const deleteListItemMutation = useDeleteListItem(id)
  const insertListItemMutation = useInsertListItem(id)
  const [picked, setPicked] = useState<string | null>(null)
  const [dealCycle, setDealCycle] = useState(0)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [addItemName, setAddItemName] = useState('')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const addItemInputId = useId()
  const deleteItemSelectId = useId()

  const deleteItems = useMemo(
    () => (list?.items != null ? sortItemsAlphabetically(list.items) : []),
    [list?.items],
  )

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
      setPicked(null)
      return
    }

    let shouldAnimateDeal = false
    setPicked((current) => {
      const stillInList =
        current != null &&
        list.items.some((item) => item.name === current)
      if (stillInList) {
        return current
      }
      shouldAnimateDeal = true
      const item = pickRandom(list.items)
      return item?.name ?? null
    })
    if (shouldAnimateDeal) {
      setDealCycle((c) => c + 1)
    }
  }, [
    list?.id,
    list?.items?.length,
    (list?.items ?? [])
      .map((item) => item.id)
      .sort()
      .join('|'),
  ])

  const onMenuAction = (actionId: string) => {
    if (actionId === 'add') {
      setAddItemName('')
      setIsAddDialogOpen(true)
      return
    }

    if (actionId === 'delete') {
      setDeleteTargetId(resolveDeleteTargetId(list!.items, picked))
      setIsDeleteDialogOpen(true)
      return
    }

    if (actionId === 'refresh-choice' && list?.items?.length) {
      setDealCycle((c) => c + 1)
      const item = pickRandom(list.items)
      setPicked(item?.name ?? null)
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
    list != null && list.items.length > 0 && deleteTargetId != null ? (
      <>
        Are you sure you want to delete?
        <DeleteItemSelect
          id={deleteItemSelectId}
          aria-label={'Item to delete'}
          value={deleteTargetId}
          disabled={deleteListItemMutation.isPending}
          onChange={(event) => setDeleteTargetId(event.target.value)}
        >
          {deleteItems.map((item) => (
            <option key={item.id} value={item.id}>
              {itemDisplayName(item)}
            </option>
          ))}
        </DeleteItemSelect>
      </>
    ) : (
      'Are you sure you want to delete this item?'
    )

  if (!id) return null
  if (isLoading) return <Loader text={'Loading pick'} />
  if (isError)
    return <ErrorAlert message={'Failed to load pick'} error={error} />
  if (list == null) return null

  return (
    <>
      <RandomPickWrapper>
        <ListTitle>{list.name}</ListTitle>
        {list.items.length === 0 ? (
          <EmptyListMessage role={'status'}>
            This list has no items.
          </EmptyListMessage>
        ) : (
          <PickedItemDealing key={dealCycle}>{picked}</PickedItemDealing>
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
        title={'Delete item?'}
        message={deleteConfirmMessage}
        isConfirmPending={deleteListItemMutation.isPending}
        closeOnConfirm={false}
        onClose={() => {
          if (!deleteListItemMutation.isPending) {
            setIsDeleteDialogOpen(false)
          }
        }}
        onConfirm={() => {
          if (deleteTargetId != null) {
            deleteListItemMutation.mutate(deleteTargetId, {
              onSuccess: () => setIsDeleteDialogOpen(false),
            })
          }
        }}
      />
    </>
  )
}
