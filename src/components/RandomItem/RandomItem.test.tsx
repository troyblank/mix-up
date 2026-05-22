import type { ListWithItems } from '../../api/graphql'
import Chance from 'chance'
import { render, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createWrappersWithoutRouter } from '../../testing/wrappers'
import { mockListWithItems } from '../../testing/mocks/lists'
import { useDeleteListItem } from '../../hooks/useDeleteListItem'
import { useList } from '../../hooks/useList'
import { RandomItem } from './RandomItem'

jest.mock('../../hooks/useList')
jest.mock('../../hooks/useDeleteListItem')

const chance = new Chance()
const mockUseList = jest.mocked(useList)
const mockUseDeleteListItem = jest.mocked(useDeleteListItem)
const mockDeleteMutate = jest.fn()

function renderRandomItem(id: string | undefined) {
  return render(<RandomItem id={id} />, {
    wrapper: createWrappersWithoutRouter(),
  })
}

describe('RandomItem', () => {
  beforeEach(() => {
    mockDeleteMutate.mockImplementation(
      (_itemId: string, options?: { onSuccess?: () => void }) => {
        options?.onSuccess?.()
      },
    )
    mockUseDeleteListItem.mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteListItem>)
    mockUseList.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useList>)
  })

  it('Returns null when id is undefined.', () => {
    mockUseList.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useList>)

    const { container } = renderRandomItem(undefined)
    expect(container).toBeEmptyDOMElement()
  })

  it('Shows loading state when isLoading is true.', () => {
    mockUseList.mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useList>)

    const { getByText } = renderRandomItem('some-id')
    expect(getByText('Loading list')).toBeInTheDocument()
  })

  it('Shows error alert when isError is true.', () => {
    const error = new Error('Network failed')
    mockUseList.mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error,
    } as unknown as ReturnType<typeof useList>)

    const { getByRole } = renderRandomItem('some-id')
    const alert = getByRole('alert')
    expect(alert).toHaveTextContent(/failed to load list/i)
    expect(alert).toHaveTextContent('Network failed')
  })

  it('Shows unknown error when error is not an Error instance.', () => {
    mockUseList.mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error: 'string error',
    } as unknown as ReturnType<typeof useList>)

    const { getByRole } = renderRandomItem('some-id')
    const alert = getByRole('alert')
    expect(alert).toHaveTextContent(/failed to load list/i)
    expect(alert).toHaveTextContent('Unknown error')
  })

  it('Returns null when list data is null.', () => {
    mockUseList.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useList>)

    const { container } = renderRandomItem('some-id')
    expect(container).toBeEmptyDOMElement()
  })

  it('Renders RandomPick when list type is pick.', async () => {
    const listId = chance.guid()
    const itemName = chance.word()
    const pickList = mockListWithItems({
      id: listId,
      name: chance.sentence({ words: 2 }).replace(/\.$/, ''),
      type: 'pick',
      items: [{ id: chance.guid(), name: itemName }],
    })

    mockUseList.mockReturnValue({
      data: pickList,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useList>)

    const { findByText, findByRole } = renderRandomItem(listId)
    expect(await findByText(itemName)).toBeInTheDocument()
    expect(
      await findByRole('button', { name: /^add$/i }),
    ).toBeInTheDocument()
    expect(
      await findByRole('button', { name: /^refresh choice$/i }),
    ).toBeInTheDocument()
    expect(
      await findByRole('button', { name: /^delete$/i }),
    ).toBeInTheDocument()
  })

  it('Renders RandomList when list type is list.', async () => {
    const listId = chance.guid()
    const itemName = chance.word()
    const listList = mockListWithItems({
      id: listId,
      name: chance.sentence({ words: 2 }).replace(/\.$/, ''),
      type: 'list',
      items: [{ id: chance.guid(), name: itemName }],
    })

    mockUseList.mockReturnValue({
      data: listList,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useList>)

    const { findByText, findByRole, queryByText, queryByRole } =
      renderRandomItem(listId)
    expect(queryByText('Loading list')).not.toBeInTheDocument()
    expect(queryByRole('alert')).not.toBeInTheDocument()
    expect(
      await findByRole('heading', { name: listList.name }),
    ).toBeInTheDocument()
    expect(await findByText(itemName)).toBeInTheDocument()
    expect(
      await findByRole('button', { name: /^refresh choice$/i }),
    ).toBeInTheDocument()
    expect(queryByRole('button', { name: /^add$/i })).not.toBeInTheDocument()
    expect(queryByRole('button', { name: /^delete$/i })).not.toBeInTheDocument()
  })

  it('Returns null when list type is neither pick nor list.', () => {
    const listId = chance.guid()
    const invalidList = {
      ...mockListWithItems({ id: listId, type: 'pick' }),
      type: 'invalid',
    } as unknown as ListWithItems

    mockUseList.mockReturnValue({
      data: invalidList,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useList>)

    const { container } = renderRandomItem(listId)
    expect(container).toBeEmptyDOMElement()
  })

  it('Opening delete shows a confirmation dialog for the random item.', async () => {
    const user = userEvent.setup()
    const listId = chance.guid()
    const listName = chance.sentence({ words: 2 }).replace(/\.$/, '')
    const itemName = chance.word()
    const pickList = mockListWithItems({
      id: listId,
      name: listName,
      type: 'pick',
      items: [{ id: chance.guid(), name: itemName }],
    })

    mockUseList.mockReturnValue({
      data: pickList,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useList>)

    const { findByRole, getByRole, queryByRole } = renderRandomItem(listId)

    await user.click(await findByRole('button', { name: /^delete$/i }))

    expect(
      getByRole('dialog', { name: /^delete item\?$/i }),
    ).toBeInTheDocument()
    const itemSelect = getByRole('combobox', { name: /^item to delete$/i })
    expect(itemSelect).toHaveValue(pickList.items[0].id)
    expect(itemSelect).toHaveTextContent(itemName)

    await user.click(getByRole('button', { name: /^cancel$/i }))
    expect(
      queryByRole('dialog', { name: /^delete item\?$/i }),
    ).not.toBeInTheDocument()
  })

  it('Shows unnamed item in the delete dropdown when the picked item has no name.', async () => {
    const user = userEvent.setup()
    const listId = chance.guid()
    const unnamedItemId = chance.guid()
    const pickList = {
      ...mockListWithItems({ id: listId, type: 'pick', items: [] }),
      items: [{ id: unnamedItemId }],
    } as ListWithItems

    mockUseList.mockReturnValue({
      data: pickList,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useList>)

    const { findByRole, getByRole } = renderRandomItem(listId)

    await user.click(await findByRole('button', { name: /^delete$/i }))

    const itemSelect = getByRole('combobox', { name: /^item to delete$/i })
    expect(itemSelect).toHaveValue(unnamedItemId)
    expect(itemSelect).toHaveTextContent('Unnamed item')
  })

  it('Lets you choose a different item to delete from the dropdown.', async () => {
    const user = userEvent.setup()
    const listId = chance.guid()
    const firstItem = { id: chance.guid(), name: chance.word() }
    const secondItem = { id: chance.guid(), name: chance.word() }
    const pickList = mockListWithItems({
      id: listId,
      type: 'pick',
      items: [firstItem, secondItem],
    })

    mockUseList.mockReturnValue({
      data: pickList,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useList>)

    const { findByRole, getByRole } = renderRandomItem(listId)

    await user.click(await findByRole('button', { name: /^delete$/i }))

    const itemSelect = getByRole('combobox', { name: /^item to delete$/i })
    await user.selectOptions(itemSelect, secondItem.id)

    expect(itemSelect).toHaveValue(secondItem.id)
  })

  it('Confirming in the delete dialog closes it.', async () => {
    const user = userEvent.setup()
    const listId = chance.guid()
    const pickList = mockListWithItems({
      id: listId,
      name: chance.word(),
      type: 'pick',
      items: [{ id: chance.guid(), name: chance.word() }],
    })

    mockUseList.mockReturnValue({
      data: pickList,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useList>)

    const { findByRole, getByRole, queryByRole } = renderRandomItem(listId)

    await user.click(await findByRole('button', { name: /^delete$/i }))

    const dialog = getByRole('dialog', { name: /^delete item\?$/i })
    await user.click(
      within(dialog).getByRole('button', { name: /^confirm$/i }),
    )

    expect(
      queryByRole('dialog', { name: /^delete item\?$/i }),
    ).not.toBeInTheDocument()
  })
})
