import { useQuery } from '@tanstack/react-query'
import { fetchList } from '../api/graphql'

const LIST_QUERY_KEY = (id: string) => ['list', id] as const

export function useList(id: string | undefined) {
  return useQuery({
    queryKey: LIST_QUERY_KEY(id ?? ''),
    queryFn: () => fetchList(id!),
    enabled: !!id,
  })
}
