import type { FunctionComponent } from 'react'
import { useId, useMemo } from 'react'
import type { ListItem } from '../../api/graphql'
import { Dialog } from '../Dialog'
import { EmptyListMessage } from '../RandomPick/RandomPick.styles'
import { itemDisplayName, sortItemsAlphabetically } from '../RandomPick/utils'
import {
  ListViewContainer,
  ListViewItem,
  ListViewItems,
  ListViewTitle,
} from './ListViewDialog.styles'

export type ListViewDialogProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  items: ListItem[]
}

export const ListViewDialog: FunctionComponent<ListViewDialogProps> = ({
  isOpen,
  onClose,
  title,
  items,
}) => {
  const titleId = useId()
  const sortedItems = useMemo(
    () => sortItemsAlphabetically(items),
    [items],
  )

  return (
    <Dialog isOpen={isOpen} onClose={onClose} ariaLabelledBy={titleId}>
      <ListViewContainer>
        <ListViewTitle id={titleId}>{title}</ListViewTitle>
        {sortedItems.length === 0 ? (
          <EmptyListMessage role={'status'}>This list has no items.</EmptyListMessage>
        ) : (
          <ListViewItems>
            {sortedItems.map((item) => (
              <ListViewItem key={item.id}>{itemDisplayName(item)}</ListViewItem>
            ))}
          </ListViewItems>
        )}
      </ListViewContainer>
    </Dialog>
  )
}
