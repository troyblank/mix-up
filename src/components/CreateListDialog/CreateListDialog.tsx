import type { FormEvent, FunctionComponent } from 'react'
import { useEffect, useId, useState } from 'react'

import type { ListType } from '../../api/graphql'
import { useCreateList } from '../../hooks/useCreateList'
import { PrimaryButton, SecondaryButton } from '../AppButton'
import { Actions, Dialog, DialogTitle } from '../Dialog'
import { ErrorAlert } from '../ErrorAlert'
import { Field, Input, Label, Select } from './CreateListDialog.styles'

const LIST_TYPE_OPTIONS: { value: ListType; label: string }[] = [
  { value: 'pick', label: 'Pick one' },
  { value: 'list', label: 'Shuffle list' },
]

export type CreateListDialogProps = {
  isOpen: boolean
  onClose: () => void
}

export const CreateListDialog: FunctionComponent<CreateListDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const titleId = useId()
  const nameId = useId()
  const typeId = useId()
  const [name, setName] = useState('')
  const [type, setType] = useState<ListType>('pick')
  const createListMutation = useCreateList()

  useEffect(() => {
    if (!isOpen) return

    setName('')
    setType('pick')
  }, [isOpen])

  const handleClose = () => {
    if (!createListMutation.isPending) {
      onClose()
    }
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const trimmedName = name.trim()
    if (trimmedName.length === 0) return

    createListMutation.mutate(
      { name: trimmedName, type },
      { onSuccess: () => onClose() },
    )
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      ariaLabelledBy={titleId}
      backdropTestId={'create-list-backdrop'}
    >
      <DialogTitle id={titleId}>New list</DialogTitle>
      <form onSubmit={onSubmit}>
        <Field>
          <Label htmlFor={nameId}>Name</Label>
          <Input
            id={nameId}
            type={'text'}
            value={name}
            disabled={createListMutation.isPending}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>
        <Field>
          <Label htmlFor={typeId}>Type</Label>
          <Select
            id={typeId}
            value={type}
            disabled={createListMutation.isPending}
            onChange={(event) => setType(event.target.value as ListType)}
          >
            {LIST_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
        {createListMutation.isError && (
          <ErrorAlert
            message={'Failed to create list'}
            error={createListMutation.error}
          />
        )}
        <Actions>
          <PrimaryButton
            type={'submit'}
            disabled={createListMutation.isPending}
          >
            Create
          </PrimaryButton>
          <SecondaryButton
            type={'button'}
            disabled={createListMutation.isPending}
            onClick={handleClose}
          >
            Cancel
          </SecondaryButton>
        </Actions>
      </form>
    </Dialog>
  )
}
