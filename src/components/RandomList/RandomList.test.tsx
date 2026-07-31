import type { ListWithItems } from '../../api/graphql'
import { render, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Chance from 'chance'
import { mockListItem, mockListWithItems } from '../../testing/mocks/lists'
import * as randomUtils from '../../utils/random'
import { createAllWrappersWithoutAuth } from '../../testing/wrappers'
import { useDeleteListItems } from '../../hooks/useDeleteListItems'
import { useInsertListItem } from '../../hooks/useInsertListItem'
import { useList } from '../../hooks/useList'
import { ConfirmDialog } from '../ConfirmDialog'
import { RandomList } from './RandomList'

jest.mock('../../hooks/useList')
jest.mock('../../hooks/useDeleteListItems')
jest.mock('../../hooks/useInsertListItem')
jest.mock('../ConfirmDialog', () => {
  const actual = jest.requireActual('../ConfirmDialog')
  return {
    ...actual,
    ConfirmDialog: jest.fn((props) => actual.ConfirmDialog(props)),
  }
})

const chance = new Chance()
const mockUseList = jest.mocked(useList)
const mockUseDeleteListItems = jest.mocked(useDeleteListItems)
const mockUseInsertListItem = jest.mocked(useInsertListItem)
const mockConfirmDialog = jest.mocked(ConfirmDialog)
const mockDeleteMutate = jest.fn()
const mockInsertMutate = jest.fn()

describe('RandomList', () => {
  let listWithItems: ReturnType<typeof mockListWithItems>
  let listId: string

  beforeEach(() => {
    mockUseList.mockReset()
    mockConfirmDialog.mockImplementation(
      jest.requireActual('../ConfirmDialog').ConfirmDialog,
    )
    mockDeleteMutate.mockReset()
    mockDeleteMutate.mockImplementation(
      (_itemIds: string[], options?: { onSuccess?: () => void }) => {
        options?.onSuccess?.()
      },
    )
    mockUseDeleteListItems.mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteListItems>)
    mockInsertMutate.mockReset()
    mockInsertMutate.mockImplementation(
      (_name: string, options?: { onSuccess?: () => void }) => {
        options?.onSuccess?.()
      },
    )
    mockUseInsertListItem.mockReturnValue({
      mutate: mockInsertMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useInsertListItem>)
    listId = chance.guid()
    listWithItems = mockListWithItems({
      id: listId,
      type: 'list',
    })
    mockUseList.mockReturnValue({
      data: listWithItems,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useList>)
  })

  it('Returns null when id is undefined.', () => {
    mockUseList.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useList>)

    const { container } = render(<RandomList id={undefined} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    expect(container).toBeEmptyDOMElement()
  })

  it('Shows loading state.', () => {
    mockUseList.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as ReturnType<typeof useList>)

    const { getByText } = render(<RandomList id={listId} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    expect(getByText('Loading list')).toBeInTheDocument()
  })

  it('Shows every list item in a shuffled order when the list loads.', async () => {
    const shuffleSpy = jest
      .spyOn(randomUtils, 'shuffleArray')
      .mockImplementation((items) => [...items].reverse())

    const { findByRole, findAllByRole } = render(<RandomList id={listId} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    expect(await findByRole('heading', { name: listWithItems.name })).toBeInTheDocument()

    const expectedOrder = [...listWithItems.items].reverse()
    const listItems = await findAllByRole('listitem')
    expect(listItems.map((node) => node.textContent)).toEqual(
      expectedOrder.map((item) => item.name),
    )

    shuffleSpy.mockRestore()
  })

  it('Keeps the same shuffled order when the component re-renders with the same list data.', async () => {
    const shuffleSpy = jest
      .spyOn(randomUtils, 'shuffleArray')
      .mockImplementation((items) => [...items].reverse())

    const { findAllByRole, rerender } = render(<RandomList id={listId} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    const firstPass = await findAllByRole('listitem')
    const shuffleCallsAfterLoad = shuffleSpy.mock.calls.length
    expect(shuffleCallsAfterLoad).toBeGreaterThanOrEqual(1)

    rerender(<RandomList id={listId} />)

    expect(shuffleSpy.mock.calls.length).toBe(shuffleCallsAfterLoad)
    const secondPass = await findAllByRole('listitem')
    expect(secondPass.map((node) => node.textContent)).toEqual(
      firstPass.map((node) => node.textContent),
    )

    shuffleSpy.mockRestore()
  })

  it('Reshuffles when the user taps refresh choice.', async () => {
    const user = userEvent.setup()
    const shuffleSpy = jest.spyOn(randomUtils, 'shuffleArray')

    const { findByRole } = render(<RandomList id={listId} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    await findByRole('heading', { name: listWithItems.name })
    const callsAfterLoad = shuffleSpy.mock.calls.length

    await user.click(await findByRole('button', { name: /^refresh choice$/i }))

    expect(shuffleSpy.mock.calls.length).toBeGreaterThan(callsAfterLoad)

    shuffleSpy.mockRestore()
  })

  it('Shows error when API fails.', async () => {
    mockUseList.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Server error'),
    } as ReturnType<typeof useList>)

    const { findByRole } = render(<RandomList id={listId} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })
    const alert = await findByRole('alert')

    expect(alert).toHaveTextContent(/failed to load list/i)
  })

  it('Handles item with undefined name.', async () => {
    const listWithItemNoName = {
      ...mockListWithItems({ type: 'list' }),
      items: [{ id: chance.guid() }],
    } as ListWithItems

    mockUseList.mockReturnValue({
      data: listWithItemNoName,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useList>)

    const { findByRole } = render(<RandomList id={listId} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    expect(
      await findByRole('heading', { name: listWithItemNoName.name }),
    ).toBeInTheDocument()
    const rows = await findByRole('list')
    expect(within(rows).getAllByRole('listitem')).toHaveLength(1)
  })

  it('Returns null when list loads as null.', () => {
    mockUseList.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useList>)

    const { container } = render(<RandomList id={listId} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    expect(container).toBeEmptyDOMElement()
  })

  it('Shows empty message when list has no items.', async () => {
    const emptyList = mockListWithItems({ items: [], type: 'list' })
    mockUseList.mockReturnValue({
      data: emptyList,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useList>)

    const { findByText, findByRole } = render(<RandomList id={listId} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    expect(await findByText(/this list has no items/i)).toBeInTheDocument()
    expect(
      await findByRole('button', { name: /^add$/i }),
    ).toBeInTheDocument()
  })

  it('Does not reshuffle when refresh choice is used on an empty list.', async () => {
    const user = userEvent.setup()
    const shuffleSpy = jest.spyOn(randomUtils, 'shuffleArray')
    const emptyList = mockListWithItems({ items: [], type: 'list' })
    mockUseList.mockReturnValue({
      data: emptyList,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useList>)

    const { findByRole } = render(<RandomList id={listId} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    await findByRole('button', { name: /^refresh choice$/i })
    const callsBefore = shuffleSpy.mock.calls.length

    await user.click(await findByRole('button', { name: /^refresh choice$/i }))

    expect(shuffleSpy.mock.calls.length).toBe(callsBefore)

    shuffleSpy.mockRestore()
  })

  it('Closes the add dialog when cancel is clicked before submit.', async () => {
    const user = userEvent.setup()
    const { findByRole, getByRole, queryByRole } = render(
      <RandomList id={listId} />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    await user.click(await findByRole('button', { name: /^add$/i }))
    await user.click(getByRole('button', { name: /^cancel$/i }))

    expect(
      queryByRole('dialog', { name: /^add item$/i }),
    ).not.toBeInTheDocument()
  })

  it('Adds an item when add is confirmed.', async () => {
    const user = userEvent.setup()
    const newItemName = chance.sentence({ words: 2 })
    const { findByRole, getByRole, queryByRole } = render(
      <RandomList id={listId} />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    await user.click(await findByRole('button', { name: /^add$/i }))

    const dialog = getByRole('dialog', { name: /^add item$/i })
    await user.type(
      within(dialog).getByRole('textbox', { name: /^item name$/i }),
      newItemName,
    )
    await user.click(
      within(dialog).getByRole('button', { name: /^confirm$/i }),
    )

    expect(mockInsertMutate).toHaveBeenCalledWith(
      newItemName,
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    )
    await waitFor(() => {
      expect(
        queryByRole('dialog', { name: /^add item$/i }),
      ).not.toBeInTheDocument()
    })
  })

  it('Does not add when the item name is blank.', async () => {
    const user = userEvent.setup()
    const { findByRole, getByRole } = render(<RandomList id={listId} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    await user.click(await findByRole('button', { name: /^add$/i }))

    const dialog = getByRole('dialog', { name: /^add item$/i })
    await user.click(
      within(dialog).getByRole('button', { name: /^confirm$/i }),
    )

    expect(mockInsertMutate).not.toHaveBeenCalled()
  })

  it('Ignores close requests while add is pending.', async () => {
    mockConfirmDialog.mockImplementation(
      ({ isOpen, onClose, onConfirm, message, title }) =>
        isOpen ? (
          <div role="dialog" aria-label={title}>
            {message}
            <button type="button" onClick={onClose}>
              Force close
            </button>
            <button type="button" onClick={onConfirm}>
              Confirm
            </button>
          </div>
        ) : null,
    )

    const user = userEvent.setup()
    mockUseInsertListItem
      .mockReturnValueOnce({
        mutate: mockInsertMutate,
        isPending: false,
      } as unknown as ReturnType<typeof useInsertListItem>)
      .mockReturnValue({
        mutate: mockInsertMutate,
        isPending: true,
      } as unknown as ReturnType<typeof useInsertListItem>)

    const { findByRole, getByRole, rerender } = render(
      <RandomList id={listId} />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    await user.click(await findByRole('button', { name: /^add$/i }))

    const dialog = getByRole('dialog', { name: /^add item$/i })
    await user.type(
      within(dialog).getByRole('textbox', { name: /^item name$/i }),
      chance.word(),
    )
    await user.click(
      within(dialog).getByRole('button', { name: /^confirm$/i }),
    )

    rerender(<RandomList id={listId} />)

    await user.click(
      within(getByRole('dialog', { name: /^add item$/i })).getByRole(
        'button',
        { name: /^force close$/i },
      ),
    )

    expect(getByRole('dialog', { name: /^add item$/i })).toBeInTheDocument()
  })

  it('Reshuffles when the item count changes.', async () => {
    const firstItem = mockListItem({ name: 'StillHere' })
    const secondItem = mockListItem()
    const listTwoItems = mockListWithItems({
      id: listId,
      type: 'list',
      items: [firstItem, secondItem],
    })
    const listThreeItems = mockListWithItems({
      id: listId,
      type: 'list',
      items: [firstItem, secondItem, mockListItem()],
    })

    let currentList: ListWithItems = listTwoItems
    mockUseList.mockImplementation(
      () =>
        ({
          data: currentList,
          isLoading: false,
          isError: false,
          error: null,
        }) as ReturnType<typeof useList>,
    )

    const shuffleSpy = jest
      .spyOn(randomUtils, 'shuffleArray')
      .mockImplementation((items) => [...items].reverse())

    const wrapper = createAllWrappersWithoutAuth()
    const { findAllByRole, container, rerender } = render(
      <RandomList id={listId} />,
      { wrapper },
    )

    const twoRowPass = await findAllByRole('listitem')
    expect(twoRowPass).toHaveLength(2)
    const shuffleCallsAfterTwoItems = shuffleSpy.mock.calls.length
    expect(shuffleCallsAfterTwoItems).toBeGreaterThanOrEqual(1)

    currentList = listThreeItems
    rerender(<RandomList id={listId} />)

    await waitFor(() => {
      expect(container.querySelectorAll('li')).toHaveLength(3)
    })

    expect(shuffleSpy.mock.calls.length).toBeGreaterThan(shuffleCallsAfterTwoItems)

    shuffleSpy.mockRestore()
  })

  it('Shows a delete dialog with checkboxes for each item.', async () => {
    const user = userEvent.setup()
    const { findByRole, getByRole, queryByRole } = render(
      <RandomList id={listId} />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    await user.click(await findByRole('button', { name: /^delete$/i }))

    const dialog = getByRole('dialog', { name: /^delete items\?$/i })
    const checkboxes = within(dialog).getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(listWithItems.items.length)
    checkboxes.forEach((checkbox) => {
      expect(checkbox).not.toBeChecked()
    })

    await user.click(getByRole('button', { name: /^cancel$/i }))
    expect(
      queryByRole('dialog', { name: /^delete items\?$/i }),
    ).not.toBeInTheDocument()
  })

  it('Shows items in alphabetical order in the delete checkboxes.', async () => {
    const user = userEvent.setup()
    const items = [
      mockListItem({ name: 'Zebra' }),
      mockListItem({ name: 'Alpha' }),
      mockListItem({ name: 'Middle' }),
    ]
    const list = mockListWithItems({
      id: listId,
      type: 'list',
      items,
    })
    mockUseList.mockReturnValue({
      data: list,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useList>)

    const { findByRole, getByRole } = render(<RandomList id={listId} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    await user.click(await findByRole('button', { name: /^delete$/i }))

    const dialog = getByRole('dialog', { name: /^delete items\?$/i })
    const checkboxLabels = within(dialog)
      .getAllByRole('checkbox')
      .map((checkbox) => checkbox.getAttribute('aria-label'))
    expect(checkboxLabels).toEqual(['Alpha', 'Middle', 'Zebra'])
  })

  it('Lets you uncheck a selected item in the delete dialog.', async () => {
    const user = userEvent.setup()
    const items = [
      mockListItem({ name: 'Alpha' }),
      mockListItem({ name: 'Beta' }),
    ]
    const list = mockListWithItems({
      id: listId,
      type: 'list',
      items,
    })
    mockUseList.mockReturnValue({
      data: list,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useList>)

    const { findByRole, getByRole } = render(<RandomList id={listId} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    await user.click(await findByRole('button', { name: /^delete$/i }))

    const dialog = getByRole('dialog', { name: /^delete items\?$/i })
    const alphaCheckbox = within(dialog).getByRole('checkbox', {
      name: /^alpha$/i,
    })
    await user.click(alphaCheckbox)
    expect(alphaCheckbox).toBeChecked()

    await user.click(alphaCheckbox)
    expect(alphaCheckbox).not.toBeChecked()
  })

  it('Deletes the selected items when delete is confirmed.', async () => {
    const user = userEvent.setup()
    const items = [
      mockListItem({ name: 'Alpha' }),
      mockListItem({ name: 'Beta' }),
      mockListItem({ name: 'Gamma' }),
    ]
    const list = mockListWithItems({
      id: listId,
      type: 'list',
      items,
    })
    mockUseList.mockReturnValue({
      data: list,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useList>)

    const { findByRole, getByRole, queryByRole } = render(
      <RandomList id={listId} />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    await user.click(await findByRole('button', { name: /^delete$/i }))

    const dialog = getByRole('dialog', { name: /^delete items\?$/i })
    await user.click(
      within(dialog).getByRole('checkbox', { name: /^alpha$/i }),
    )
    await user.click(
      within(dialog).getByRole('checkbox', { name: /^gamma$/i }),
    )
    await user.click(
      within(dialog).getByRole('button', { name: /^confirm$/i }),
    )

    expect(mockDeleteMutate).toHaveBeenCalledWith(
      [items[0].id, items[2].id],
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    )
    await waitFor(() => {
      expect(
        queryByRole('dialog', { name: /^delete items\?$/i }),
      ).not.toBeInTheDocument()
    })
  })

  it('Does not delete when no items are selected.', async () => {
    const user = userEvent.setup()
    const { findByRole, getByRole } = render(<RandomList id={listId} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    await user.click(await findByRole('button', { name: /^delete$/i }))

    const dialog = getByRole('dialog', { name: /^delete items\?$/i })
    await user.click(
      within(dialog).getByRole('button', { name: /^confirm$/i }),
    )

    expect(mockDeleteMutate).not.toHaveBeenCalled()
  })

  it('Ignores close requests while delete is pending.', async () => {
    mockConfirmDialog.mockImplementation(
      ({ isOpen, onClose, onConfirm, message, title }) =>
        isOpen ? (
          <div role="dialog" aria-label={title}>
            {message}
            <button type="button" onClick={onClose}>
              Force close
            </button>
            <button type="button" onClick={onConfirm}>
              Confirm
            </button>
          </div>
        ) : null,
    )

    const user = userEvent.setup()
    mockUseDeleteListItems
      .mockReturnValueOnce({
        mutate: mockDeleteMutate,
        isPending: false,
      } as unknown as ReturnType<typeof useDeleteListItems>)
      .mockReturnValue({
        mutate: mockDeleteMutate,
        isPending: true,
      } as unknown as ReturnType<typeof useDeleteListItems>)

    const { findByRole, getByRole, rerender } = render(
      <RandomList id={listId} />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    await user.click(await findByRole('button', { name: /^delete$/i }))

    const dialog = getByRole('dialog', { name: /^delete items\?$/i })
    await user.click(
      within(dialog).getByRole('checkbox', {
        name: listWithItems.items[0].name,
      }),
    )
    await user.click(
      within(dialog).getByRole('button', { name: /^confirm$/i }),
    )

    rerender(<RandomList id={listId} />)

    await user.click(
      within(getByRole('dialog', { name: /^delete items\?$/i })).getByRole(
        'button',
        { name: /^force close$/i },
      ),
    )

    expect(getByRole('dialog', { name: /^delete items\?$/i })).toBeInTheDocument()
  })
})
