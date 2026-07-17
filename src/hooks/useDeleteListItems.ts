import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ListWithItems } from '../api/graphql'
import { deleteListItems } from '../api/graphql'
import { listQueryKey } from './useList'

export function useDeleteListItems(listId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (itemIds: string[]) => deleteListItems({ itemIds }),
    onSuccess: (_data, itemIds) => {
      if (!listId) return

      const idsToRemove = new Set(itemIds)
      queryClient.setQueryData<ListWithItems | null>(
        listQueryKey(listId),
        (current) => {
          if (current == null) return current
          return {
            ...current,
            items: current.items.filter((item) => !idsToRemove.has(item.id)),
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
