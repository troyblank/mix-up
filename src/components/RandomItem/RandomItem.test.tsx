import type { ListWithItems } from '../../api/graphql'
import Chance from 'chance'
import { render } from '@testing-library/react'
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

    const { findByText } = renderRandomItem(listId)
    expect(await findByText(itemName)).toBeInTheDocument()
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
})
