import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import Chance from 'chance'
import type { ReactNode } from 'react'
import type { List } from '../api/graphql'
import { createList } from '../api/graphql'
import { mockList } from '../testing/mocks/lists'
import { listsQueryKey } from './useLists'
import { useCreateList } from './useCreateList'

jest.mock('../api/graphql', () => ({
  createList: jest.fn(),
}))

const chance = new Chance()
const mockCreateList = jest.mocked(createList)

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

describe('useCreateList', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    mockCreateList.mockReset()
  })

  it('Adds the new list to the cache on success.', async () => {
    const existingList = mockList()
    const newList = mockList()
    queryClient.setQueryData<List[]>(listsQueryKey, [existingList])
    mockCreateList.mockResolvedValue(newList)

    const { result } = renderHook(() => useCreateList(), {
      wrapper: createWrapper(queryClient),
    })

    result.current.mutate({ name: newList.name, type: newList.type })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(queryClient.getQueryData<List[]>(listsQueryKey)).toEqual([
      existingList,
      newList,
    ])
  })

  it('Leaves the lists cache unchanged when create fails.', async () => {
    const existingList = mockList()
    queryClient.setQueryData<List[]>(listsQueryKey, [existingList])
    mockCreateList.mockRejectedValue(new Error(chance.sentence()))

    const { result } = renderHook(() => useCreateList(), {
      wrapper: createWrapper(queryClient),
    })

    result.current.mutate({ name: chance.word(), type: 'pick' })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(queryClient.getQueryData<List[]>(listsQueryKey)).toEqual([
      existingList,
    ])
  })
})
