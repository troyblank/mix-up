import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import Chance from 'chance'
import type { ReactNode } from 'react'
import type { ListItem, ListWithItems } from '../api/graphql'
import { insertListItem } from '../api/graphql'
import { mockListItem, mockListWithItems } from '../testing/mocks/lists'
import { listQueryKey } from './useList'
import { useInsertListItem } from './useInsertListItem'

jest.mock('../api/graphql', () => ({
  insertListItem: jest.fn(),
}))

const chance = new Chance()
const mockInsertListItem = jest.mocked(insertListItem)

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

describe('useInsertListItem', () => {
  let listId: string
  let existingItem: ListItem
  let newItem: ListItem
  let queryClient: QueryClient

  beforeEach(() => {
    listId = chance.guid()
    existingItem = mockListItem()
    newItem = mockListItem()
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    mockInsertListItem.mockReset()
  })

  it('Leaves the list cache unchanged while insert is pending.', async () => {
    const list = mockListWithItems({
      id: listId,
      items: [existingItem],
    })
    queryClient.setQueryData(listQueryKey(listId), list)
    mockInsertListItem.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve(newItem), 50),
        ),
    )

    const { result } = renderHook(() => useInsertListItem(listId), {
      wrapper: createWrapper(queryClient),
    })

    result.current.mutate(newItem.name)

    expect(queryClient.getQueryData(listQueryKey(listId))).toEqual(list)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(queryClient.getQueryData(listQueryKey(listId))).toEqual({
      ...list,
      items: [existingItem, newItem],
    })
  })

  it('Leaves the list cache unchanged when insert fails.', async () => {
    const list = mockListWithItems({
      id: listId,
      items: [existingItem],
    })
    queryClient.setQueryData(listQueryKey(listId), list)
    mockInsertListItem.mockRejectedValue(new Error(chance.sentence()))

    const { result } = renderHook(() => useInsertListItem(listId), {
      wrapper: createWrapper(queryClient),
    })

    result.current.mutate(newItem.name)

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(queryClient.getQueryData(listQueryKey(listId))).toEqual(list)
  })

  it('Skips cache updates when listId is undefined.', async () => {
    mockInsertListItem.mockResolvedValue(newItem)

    const { result } = renderHook(() => useInsertListItem(undefined), {
      wrapper: createWrapper(queryClient),
    })

    result.current.mutate(newItem.name)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockInsertListItem).toHaveBeenCalledWith({
      listId: undefined,
      name: newItem.name,
    })
    expect(queryClient.getQueryData(listQueryKey(listId))).toBeUndefined()
  })

  it('Skips cache update when the list is not in the cache.', async () => {
    mockInsertListItem.mockResolvedValue(newItem)

    const { result } = renderHook(() => useInsertListItem(listId), {
      wrapper: createWrapper(queryClient),
    })

    result.current.mutate(newItem.name)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(queryClient.getQueryData(listQueryKey(listId))).toBeUndefined()
  })

  it('Leaves the cache unchanged when the list becomes null during cache update.', async () => {
    const list = mockListWithItems({
      id: listId,
      items: [existingItem],
    })
    queryClient.setQueryData(listQueryKey(listId), list)
    mockInsertListItem.mockResolvedValue(newItem)

    const originalSetQueryData = queryClient.setQueryData.bind(queryClient)
    jest.spyOn(queryClient, 'setQueryData').mockImplementation((key, updater) => {
      if (typeof updater === 'function') {
        return originalSetQueryData(key, () =>
          (updater as (current: ListWithItems | null | undefined) => ListWithItems | null)(null),
        )
      }

      return originalSetQueryData(key, updater)
    })

    const { result } = renderHook(() => useInsertListItem(listId), {
      wrapper: createWrapper(queryClient),
    })

    result.current.mutate(newItem.name)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(queryClient.getQueryData(listQueryKey(listId))).toBeNull()
  })
})
