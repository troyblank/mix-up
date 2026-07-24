import { useQuery } from '@tanstack/react-query'
import { fetchLists } from '../api/graphql'

export const listsQueryKey = ['lists'] as const

export function useLists() {
  return useQuery({
    queryKey: listsQueryKey,
    queryFn: fetchLists,
  })
}
