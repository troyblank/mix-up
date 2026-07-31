import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import Chance from 'chance'
import type { ReactNode } from 'react'
import type { List, ListWithItems } from '../api/graphql'
import { deleteList } from '../api/graphql'
import { mockList, mockListWithItems } from '../testing/mocks/lists'
import { listQueryKey } from './useList'
import { listsQueryKey } from './useLists'
import { useDeleteList } from './useDeleteList'

jest.mock('../api/graphql', () => ({
  deleteList: jest.fn(),
}))

const chance = new Chance()
const mockDeleteList = jest.mocked(deleteList)

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

describe('useDeleteList', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    mockDeleteList.mockReset()
  })

  it('Removes the deleted list from the cache on success.', async () => {
    const remainingList = mockList()
    const deletedList = mockList()
    queryClient.setQueryData<List[]>(listsQueryKey, [remainingList, deletedList])
    mockDeleteList.mockResolvedValue(true)

    const { result } = renderHook(() => useDeleteList(), {
      wrapper: createWrapper(queryClient),
    })

    result.current.mutate(deletedList.id)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockDeleteList).toHaveBeenCalledWith({ listId: deletedList.id })
    expect(queryClient.getQueryData<List[]>(listsQueryKey)).toEqual([
      remainingList,
    ])
  })

  it('Removes the individual list query from the cache on success.', async () => {
    const deletedList = mockListWithItems()
    queryClient.setQueryData<List[]>(listsQueryKey, [deletedList])
    queryClient.setQueryData<ListWithItems | null>(
      listQueryKey(deletedList.id),
      deletedList,
    )
    mockDeleteList.mockResolvedValue(true)

    const { result } = renderHook(() => useDeleteList(), {
      wrapper: createWrapper(queryClient),
    })

    result.current.mutate(deletedList.id)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(
      queryClient.getQueryData<ListWithItems | null>(
        listQueryKey(deletedList.id),
      ),
    ).toBeUndefined()
  })

  it('Leaves the lists cache unchanged when delete fails.', async () => {
    const existingList = mockList()
    queryClient.setQueryData<List[]>(listsQueryKey, [existingList])
    mockDeleteList.mockRejectedValue(new Error(chance.sentence()))

    const { result } = renderHook(() => useDeleteList(), {
      wrapper: createWrapper(queryClient),
    })

    result.current.mutate(existingList.id)

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(queryClient.getQueryData<List[]>(listsQueryKey)).toEqual([
      existingList,
    ])
  })
})
