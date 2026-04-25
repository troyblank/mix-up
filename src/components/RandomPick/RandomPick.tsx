import type { FunctionComponent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { ActionMenu } from '../ActionMenu'
import { ConfirmDialog } from '../ConfirmDialog'
import { MessageEmphasis } from '../ConfirmDialog/ConfirmDialog.styles'
import { DeleteIcon, PlusIcon, RefreshIcon } from '../icons'
import { ErrorAlert } from '../ErrorAlert'
import { Loader } from '../Loader'
import { useList } from '../../hooks/useList'
import { pickRandom } from '../../utils/utils'
import { RandomPickWrapper, ListTitle, PickedItem } from './RandomPick.styles'

type RandomPickProps = {
  id: string | undefined
}

export const RandomPick: FunctionComponent<RandomPickProps> = ({ id }) => {
  const { data: list, isLoading, isError, error } = useList(id)
  const [picked, setPicked] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

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
    const item = pickRandom(list.items)
    setPicked(item?.name ?? null)
  }, [list])

  const onMenuAction = (actionId: string) => {
    if (actionId === 'delete') {
      setIsDeleteDialogOpen(true)
      return
    }

    if (actionId === 'refresh-choice' && list?.items?.length) {
      const item = pickRandom(list.items)
      setPicked(item?.name ?? null)
    }
  }

  const deleteConfirmMessage =
    picked != null && picked !== '' ? (
      <>
        Are you sure you want to delete?
        <MessageEmphasis>{`“${picked}”`}</MessageEmphasis>
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
        <PickedItem>{picked}</PickedItem>
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
