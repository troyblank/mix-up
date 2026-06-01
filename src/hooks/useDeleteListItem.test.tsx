import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import Chance from 'chance'
import type { ReactNode } from 'react'
import type { ListItem, ListWithItems } from '../api/graphql'
import { deleteListItem } from '../api/graphql'
import { mockListItem, mockListWithItems } from '../testing/mocks/lists'
import { listQueryKey } from './useList'
import { useDeleteListItem } from './useDeleteListItem'

jest.mock('../api/graphql', () => ({
  deleteListItem: jest.fn(),
}))

const chance = new Chance()
const mockDeleteListItem = jest.mocked(deleteListItem)

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

describe('useDeleteListItem', () => {
  let listId: string
  let itemToDelete: ListItem
  let remainingItem: ListItem
  let queryClient: QueryClient

  beforeEach(() => {
    listId = chance.guid()
    itemToDelete = mockListItem()
    remainingItem = mockListItem()
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    mockDeleteListItem.mockReset()
  })

  it('Leaves the list cache unchanged while delete is pending.', async () => {
    const list = mockListWithItems({
      id: listId,
      items: [itemToDelete, remainingItem],
    })
    queryClient.setQueryData(listQueryKey(listId), list)
    mockDeleteListItem.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(true), 50)),
    )

    const { result } = renderHook(() => useDeleteListItem(listId), {
      wrapper: createWrapper(queryClient),
    })

    result.current.mutate(itemToDelete.id)

    expect(queryClient.getQueryData(listQueryKey(listId))).toEqual(list)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(queryClient.getQueryData(listQueryKey(listId))).toEqual({
      ...list,
      items: [remainingItem],
    })
  })

  it('Leaves the list cache unchanged when delete fails.', async () => {
    const list = mockListWithItems({
      id: listId,
      items: [itemToDelete, remainingItem],
    })
    queryClient.setQueryData(listQueryKey(listId), list)
    mockDeleteListItem.mockRejectedValue(new Error(chance.sentence()))

    const { result } = renderHook(() => useDeleteListItem(listId), {
      wrapper: createWrapper(queryClient),
    })

    result.current.mutate(itemToDelete.id)

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(queryClient.getQueryData(listQueryKey(listId))).toEqual(list)
  })

  it('Skips cache updates when listId is undefined.', async () => {
    mockDeleteListItem.mockResolvedValue(true)

    const { result } = renderHook(() => useDeleteListItem(undefined), {
      wrapper: createWrapper(queryClient),
    })

    result.current.mutate(itemToDelete.id)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockDeleteListItem).toHaveBeenCalledWith({ itemId: itemToDelete.id })
    expect(queryClient.getQueryData(listQueryKey(listId))).toBeUndefined()
  })

  it('Skips cache update when the list is not in the cache.', async () => {
    mockDeleteListItem.mockResolvedValue(true)

    const { result } = renderHook(() => useDeleteListItem(listId), {
      wrapper: createWrapper(queryClient),
    })

    result.current.mutate(itemToDelete.id)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(queryClient.getQueryData(listQueryKey(listId))).toBeUndefined()
  })

  it('Leaves the cache unchanged when the list becomes null during cache update.', async () => {
    const list = mockListWithItems({
      id: listId,
      items: [itemToDelete, remainingItem],
    })
    queryClient.setQueryData(listQueryKey(listId), list)
    mockDeleteListItem.mockResolvedValue(true)

    const originalSetQueryData = queryClient.setQueryData.bind(queryClient)
    jest.spyOn(queryClient, 'setQueryData').mockImplementation((key, updater) => {
      if (typeof updater === 'function') {
        return originalSetQueryData(key, () =>
          (updater as (current: ListWithItems | null | undefined) => ListWithItems | null)(null),
        )
      }

      return originalSetQueryData(key, updater)
    })

    const { result } = renderHook(() => useDeleteListItem(listId), {
      wrapper: createWrapper(queryClient),
    })

    result.current.mutate(itemToDelete.id)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(queryClient.getQueryData(listQueryKey(listId))).toBeNull()
  })

  it('Does not restore cache when listId is undefined and delete fails.', async () => {
    mockDeleteListItem.mockRejectedValue(new Error(chance.sentence()))

    const { result } = renderHook(() => useDeleteListItem(undefined), {
      wrapper: createWrapper(queryClient),
    })

    result.current.mutate(itemToDelete.id)

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })
})
