import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateListInput, List } from '../api/graphql'
import { createList } from '../api/graphql'
import { listsQueryKey } from './useLists'

export function useCreateList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateListInput) => createList(input),
    onSuccess: (newList) => {
      queryClient.setQueryData<List[]>(listsQueryKey, (current) =>
        current != null ? [...current, newList] : [newList],
      )
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: listsQueryKey })
    },
  })
}
