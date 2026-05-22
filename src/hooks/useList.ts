import { useQuery } from '@tanstack/react-query'
import { fetchList } from '../api/graphql'

export const listQueryKey = (id: string) => ['list', id] as const

export function useList(id: string | undefined) {
  return useQuery({
    queryKey: listQueryKey(id ?? ''),
    queryFn: () => fetchList(id!),
    enabled: !!id,
  })
}
