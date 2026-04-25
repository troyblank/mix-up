import type { ListWithItems } from '../../api/graphql'
import Chance from 'chance'
import { render, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createWrappersWithoutRouter } from '../../testing/wrappers'
import { mockListWithItems } from '../../testing/mocks/lists'
import { useList } from '../../hooks/useList'
import { RandomItem } from './RandomItem'

jest.mock('../../hooks/useList')

const chance = new Chance()
const mockUseList = jest.mocked(useList)

function renderRandomItem(id: string | undefined) {
  return render(<RandomItem id={id} />, {
    wrapper: createWrappersWithoutRouter(),
  })
}

describe('RandomItem', () => {
  beforeEach(() => {
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

  it('Renders RandomList when list type is list.', () => {
    const listId = chance.guid()
    const listList = mockListWithItems({
      id: listId,
      name: chance.sentence({ words: 2 }).replace(/\.$/, ''),
      type: 'list',
      items: [{ id: chance.guid(), name: chance.word() }],
    })

    mockUseList.mockReturnValue({
      data: listList,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useList>)

    const { queryByText, queryByRole } = renderRandomItem(listId)
    expect(queryByText('Loading list')).not.toBeInTheDocument()
    expect(queryByRole('alert')).not.toBeInTheDocument()
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

    const { findByRole, getByRole, getByText, queryByRole } =
      renderRandomItem(listId)

    await user.click(await findByRole('button', { name: /^delete$/i }))

    expect(
      getByRole('dialog', { name: /^delete item\?$/i }),
    ).toBeInTheDocument()
    expect(getByText(/Are you sure you want to delete/)).toHaveTextContent(
      itemName,
    )

    await user.click(getByRole('button', { name: /^cancel$/i }))
    expect(
      queryByRole('dialog', { name: /^delete item\?$/i }),
    ).not.toBeInTheDocument()
  })

  it('Uses generic delete copy when the picked item has no name.', async () => {
    const user = userEvent.setup()
    const listId = chance.guid()
    const pickList = {
      ...mockListWithItems({ id: listId, type: 'pick', items: [] }),
      items: [{ id: chance.guid() }],
    } as ListWithItems

    mockUseList.mockReturnValue({
      data: pickList,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useList>)

    const { findByRole, getByText } = renderRandomItem(listId)

    await user.click(await findByRole('button', { name: /^delete$/i }))

    expect(
      getByText('Are you sure you want to delete this item?'),
    ).toBeInTheDocument()
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
