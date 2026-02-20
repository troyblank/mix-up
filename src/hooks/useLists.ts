import { useQuery } from '@tanstack/react-query'
import { fetchLists } from '../api/graphql'

const LISTS_QUERY_KEY = ['lists'] as const

export function useLists() {
  return useQuery({
    queryKey: LISTS_QUERY_KEY,
    queryFn: fetchLists,
  })
}
