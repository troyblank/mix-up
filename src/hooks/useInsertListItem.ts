import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ListWithItems } from '../api/graphql'
import { insertListItem } from '../api/graphql'
import { listQueryKey } from './useList'

export function useInsertListItem(listId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (name: string) => insertListItem({ listId: listId!, name }),
    onSuccess: (newItem) => {
      if (!listId) return

      queryClient.setQueryData<ListWithItems | null>(
        listQueryKey(listId),
        (current) => {
          if (current == null) return current
          return {
            ...current,
            items: [...current.items, newItem],
          }
        },
      )
    },
    onSettled: () => {
      if (listId) {
        void queryClient.invalidateQueries({ queryKey: listQueryKey(listId) })
      }
    },
  })
}
