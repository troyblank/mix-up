import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import Chance from 'chance'
import type { ReactNode } from 'react'
import type { ListItem } from '../api/graphql'
import { deleteListItems } from '../api/graphql'
import { mockListItem, mockListWithItems } from '../testing/mocks/lists'
import { listQueryKey } from './useList'
import { useDeleteListItems } from './useDeleteListItems'

jest.mock('../api/graphql', () => ({
  deleteListItems: jest.fn(),
}))

const chance = new Chance()
const mockDeleteListItems = jest.mocked(deleteListItems)

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

describe('useDeleteListItems', () => {
  let listId: string
  let firstItem: ListItem
  let secondItem: ListItem
  let thirdItem: ListItem
  let queryClient: QueryClient

  beforeEach(() => {
    listId = chance.guid()
    firstItem = mockListItem()
    secondItem = mockListItem()
    thirdItem = mockListItem()
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    mockDeleteListItems.mockReset()
  })

  it('Removes deleted items from the list cache after a successful delete.', async () => {
    const list = mockListWithItems({
      id: listId,
      items: [firstItem, secondItem, thirdItem],
    })
    queryClient.setQueryData(listQueryKey(listId), list)
    mockDeleteListItems.mockResolvedValue(2)

    const { result } = renderHook(() => useDeleteListItems(listId), {
      wrapper: createWrapper(queryClient),
    })

    result.current.mutate([firstItem.id, thirdItem.id])

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockDeleteListItems).toHaveBeenCalledWith({
      itemIds: [firstItem.id, thirdItem.id],
    })
    expect(queryClient.getQueryData(listQueryKey(listId))).toEqual({
      ...list,
      items: [secondItem],
    })
  })

  it('Leaves the list cache unchanged when delete fails.', async () => {
    const list = mockListWithItems({
      id: listId,
      items: [firstItem, secondItem],
    })
    queryClient.setQueryData(listQueryKey(listId), list)
    mockDeleteListItems.mockRejectedValue(new Error(chance.sentence()))

    const { result } = renderHook(() => useDeleteListItems(listId), {
      wrapper: createWrapper(queryClient),
    })

    result.current.mutate([firstItem.id])

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(queryClient.getQueryData(listQueryKey(listId))).toEqual(list)
  })

  it('Skips cache updates when listId is undefined.', async () => {
    mockDeleteListItems.mockResolvedValue(1)

    const { result } = renderHook(() => useDeleteListItems(undefined), {
      wrapper: createWrapper(queryClient),
    })

    result.current.mutate([firstItem.id])

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockDeleteListItems).toHaveBeenCalledWith({ itemIds: [firstItem.id] })
    expect(queryClient.getQueryData(listQueryKey(listId))).toBeUndefined()
  })

  it('Leaves the list cache unchanged when it is null after a successful delete.', async () => {
    queryClient.setQueryData(listQueryKey(listId), null)
    mockDeleteListItems.mockResolvedValue(1)

    const { result } = renderHook(() => useDeleteListItems(listId), {
      wrapper: createWrapper(queryClient),
    })

    result.current.mutate([firstItem.id])

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(queryClient.getQueryData(listQueryKey(listId))).toBeNull()
  })
})
