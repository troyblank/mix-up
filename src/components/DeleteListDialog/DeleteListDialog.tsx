import type { FunctionComponent } from 'react'
import { useEffect, useId, useMemo, useState } from 'react'

import { useDeleteList } from '../../hooks/useDeleteList'
import { useLists } from '../../hooks/useLists'
import { ConfirmDialog } from '../ConfirmDialog'
import { ErrorAlert } from '../ErrorAlert'
import { ListSelect } from './DeleteListDialog.styles'

export type DeleteListDialogProps = {
  isOpen: boolean
  onClose: () => void
}

export const DeleteListDialog: FunctionComponent<DeleteListDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const listSelectId = useId()
  const { data: lists } = useLists()
  const deleteListMutation = useDeleteList()
  const [selectedListId, setSelectedListId] = useState('')

  const sortedLists = useMemo(
    () =>
      lists != null
        ? [...lists].sort((a, b) => a.name.localeCompare(b.name))
        : [],
    [lists],
  )

  useEffect(() => {
    if (!isOpen) return

    setSelectedListId(sortedLists[0]?.id ?? '')
  }, [isOpen, sortedLists])

  const handleClose = () => {
    if (!deleteListMutation.isPending) {
      onClose()
    }
  }

  const deleteConfirmMessage =
    sortedLists.length > 0 ? (
      <>
        {deleteListMutation.isError && (
          <ErrorAlert
            message={'Failed to delete list'}
            error={deleteListMutation.error}
          />
        )}
        Are you sure you want to delete?
        <ListSelect
          id={listSelectId}
          aria-label={'List to delete'}
          value={selectedListId}
          disabled={deleteListMutation.isPending}
          onChange={(event) => setSelectedListId(event.target.value)}
        >
          {sortedLists.map((list) => (
            <option key={list.id} value={list.id}>
              {list.name}
            </option>
          ))}
        </ListSelect>
      </>
    ) : (
      'No lists to delete.'
    )

  return (
    <ConfirmDialog
      isOpen={isOpen}
      title={'Delete list?'}
      message={deleteConfirmMessage}
      isConfirmPending={deleteListMutation.isPending}
      closeOnConfirm={false}
      onClose={handleClose}
      onConfirm={() => {
        if (selectedListId.length === 0) return

        deleteListMutation.mutate(selectedListId, {
          onSuccess: () => onClose(),
        })
      }}
    />
  )
}
