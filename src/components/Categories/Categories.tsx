import type { FormEvent, FunctionComponent } from 'react'
import { useId, useState } from 'react'
import { ConfirmDialog } from '../ConfirmDialog'
import { ErrorAlert } from '../ErrorAlert'
import { PlusIcon } from '../icons'
import { Loader } from '../Loader'
import { useInsertListItem } from '../../hooks/useInsertListItem'
import { useLists } from '../../hooks/useLists'
import {
  AddItemButton,
  AddItemForm,
  AddItemInput,
  ButtonList,
  CategoryLink,
  CategoryRow,
} from './Categories.styles'

type AddListTarget = {
  id: string
  name: string
}

function addItemButtonLabel(name: string, occurrence: number, total: number) {
  if (total < 2) return `Add item to ${name}`
  return `Add item to ${name} (${occurrence})`
}

function withAddItemLabels<T extends { name: string }>(lists: T[]) {
  const totals = new Map<string, number>()
  for (const list of lists) {
    totals.set(list.name, (totals.get(list.name) ?? 0) + 1)
  }

  const seen = new Map<string, number>()
  return lists.map((list) => {
    const occurrence = (seen.get(list.name) ?? 0) + 1
    seen.set(list.name, occurrence)
    return {
      ...list,
      addLabel: addItemButtonLabel(
        list.name,
        occurrence,
        totals.get(list.name)!,
      ),
    }
  })
}

export const Categories: FunctionComponent = () => {
  const { data: lists, isLoading, isError, error } = useLists()
  const [addTarget, setAddTarget] = useState<AddListTarget | null>(null)
  const [addItemName, setAddItemName] = useState('')
  const insertListItemMutation = useInsertListItem(addTarget?.id)
  const addItemInputId = useId()
  const rows = withAddItemLabels(lists ?? [])
  const addTargetLabel =
    rows.find((row) => row.id === addTarget?.id)?.addLabel ??
    (addTarget != null ? `Add item to ${addTarget.name}` : 'Add item')

  const closeAddDialog = () => {
    if (insertListItemMutation.isPending) return
    insertListItemMutation.reset()
    setAddTarget(null)
    setAddItemName('')
  }

  const confirmAddItem = () => {
    const trimmedName = addItemName.trim()
    if (
      trimmedName.length === 0 ||
      addTarget == null ||
      insertListItemMutation.isPending
    ) {
      return
    }

    insertListItemMutation.mutate(trimmedName, {
      onSuccess: () => {
        setAddTarget(null)
        setAddItemName('')
      },
    })
  }

  const onAddItemSubmit = (event: FormEvent) => {
    event.preventDefault()
    confirmAddItem()
  }

  if (isLoading) return <Loader text={'Loading lists'} />
  if (isError)
    return <ErrorAlert message={'Failed to load lists'} error={error} />
  if (lists == null || lists.length === 0) return null

  return (
    <>
      <ButtonList as={'ul'} role={'list'}>
        {rows.map(({ id, name, addLabel }) => (
          <CategoryRow key={id}>
            <CategoryLink to={`/list/${id}`}>{name}</CategoryLink>
            <AddItemButton
              type={'button'}
              aria-label={addLabel}
              onClick={() => {
                insertListItemMutation.reset()
                setAddItemName('')
                setAddTarget({ id, name })
              }}
            >
              <PlusIcon />
            </AddItemButton>
          </CategoryRow>
        ))}
      </ButtonList>
      <ConfirmDialog
        isOpen={addTarget != null}
        title={addTargetLabel}
        message={
          <AddItemForm onSubmit={onAddItemSubmit}>
            <AddItemInput
              id={addItemInputId}
              aria-label={'Item name'}
              autoFocus
              value={addItemName}
              disabled={insertListItemMutation.isPending}
              onChange={(event) => {
                if (insertListItemMutation.isError) {
                  insertListItemMutation.reset()
                }
                setAddItemName(event.target.value)
              }}
            />
            {insertListItemMutation.isError && (
              <ErrorAlert
                message={'Failed to add item'}
                error={insertListItemMutation.error}
              />
            )}
          </AddItemForm>
        }
        isConfirmPending={insertListItemMutation.isPending}
        confirmPendingAriaLabel={'Adding'}
        confirmVariant={'success'}
        closeOnConfirm={false}
        onClose={closeAddDialog}
        onConfirm={confirmAddItem}
      />
    </>
  )
}
