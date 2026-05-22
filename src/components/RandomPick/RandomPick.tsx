import type { FunctionComponent } from 'react'
import { useEffect, useId, useMemo, useState } from 'react'
import { ActionMenu } from '../ActionMenu'
import { ConfirmDialog } from '../ConfirmDialog'
import { DeleteIcon, PlusIcon, RefreshIcon } from '../icons'
import { ErrorAlert } from '../ErrorAlert'
import { Loader } from '../Loader'
import { useList } from '../../hooks/useList'
import { pickRandom } from '../../utils/random'
import {
  DeleteItemSelect,
  RandomPickWrapper,
  ListTitle,
  PickedItemDealing,
} from './RandomPick.styles'
import { itemDisplayName, resolveDeleteTargetId } from './utils'

type RandomPickProps = {
  id: string | undefined
}

export const RandomPick: FunctionComponent<RandomPickProps> = ({ id }) => {
  const { data: list, isLoading, isError, error } = useList(id)
  const [picked, setPicked] = useState<string | null>(null)
  const [dealCycle, setDealCycle] = useState(0)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const deleteItemSelectId = useId()

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

  const deleteConfirmMessage =
    list != null && list.items.length > 0 && deleteTargetId != null ? (
      <>
        Are you sure you want to delete?
        <DeleteItemSelect
          id={deleteItemSelectId}
          aria-label={'Item to delete'}
          value={deleteTargetId}
          onChange={(event) => setDeleteTargetId(event.target.value)}
        >
          {list.items.map((item) => (
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
  if (list.items.length === 0) {
    return <p>This list has no items.</p>
  }

  return (
    <>
      <RandomPickWrapper>
        <ListTitle>{list.name}</ListTitle>
        <PickedItemDealing key={dealCycle}>{picked}</PickedItemDealing>
      </RandomPickWrapper>
      <ActionMenu actions={menuActions} onAction={onMenuAction} />
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title={'Delete item?'}
        message={deleteConfirmMessage}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => setIsDeleteDialogOpen(false)}
      />
    </>
  )
}
