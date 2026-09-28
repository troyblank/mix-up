import { render, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Chance from 'chance'
import { mockListItem } from '../../testing/mocks/lists'
import { createAllWrappersWithoutAuth } from '../../testing/wrappers'
import { ListViewDialog } from './ListViewDialog'

const chance = new Chance()

describe('ListViewDialog', () => {
  const title = chance.sentence({ words: 2 }).replace(/\.$/, '')
  const items = [
    mockListItem({ name: 'Zebra' }),
    mockListItem({ name: 'Alpha' }),
    mockListItem({ name: 'Middle' }),
  ]

  it('Renders nothing when closed.', () => {
    const { container } = render(
      <ListViewDialog
        isOpen={false}
        onClose={jest.fn()}
        title={title}
        items={items}
      />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    expect(container.firstChild).toBeNull()
  })

  it('Shows every item in alphabetical order when open.', () => {
    const { getByRole } = render(
      <ListViewDialog
        isOpen={true}
        onClose={jest.fn()}
        title={title}
        items={items}
      />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    const dialog = getByRole('dialog', { name: new RegExp(`^${title}$`, 'i') })
    const listInDialog = within(dialog).getByRole('list')
    const renderedItems = within(listInDialog)
      .getAllByRole('listitem')
      .map((listItem) => listItem.textContent)

    expect(renderedItems).toEqual(['Alpha', 'Middle', 'Zebra'])
  })

  it('Leaves room for three-digit numbering so long lists are not cut off.', () => {
    const manyItems = Array.from({ length: 120 }, (_, index) =>
      mockListItem({ name: `Item ${String(index).padStart(3, '0')}` }),
    )

    const { getByRole } = render(
      <ListViewDialog
        isOpen={true}
        onClose={jest.fn()}
        title={title}
        items={manyItems}
      />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    const list = within(getByRole('dialog')).getByRole('list')

    expect(list).toHaveStyle({ paddingLeft: 'calc(3ch + 0.25rem)' })
  })

  it('Shows an empty message when there are no items.', () => {
    const { getByRole, getByText } = render(
      <ListViewDialog
        isOpen={true}
        onClose={jest.fn()}
        title={title}
        items={[]}
      />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    expect(getByRole('dialog', { name: new RegExp(`^${title}$`, 'i') })).toBeInTheDocument()
    expect(getByText(/this list has no items/i)).toBeInTheDocument()
  })

  it('Closes when escape is pressed.', async () => {
    const user = userEvent.setup()
    const handleClose = jest.fn()

    const { getByRole } = render(
      <ListViewDialog
        isOpen={true}
        onClose={handleClose}
        title={title}
        items={items}
      />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    expect(getByRole('dialog', { name: new RegExp(`^${title}$`, 'i') })).toBeInTheDocument()

    await user.keyboard('{Escape}')

    await waitFor(() => {
      expect(handleClose).toHaveBeenCalledTimes(1)
    })
  })
})
