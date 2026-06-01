import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ListWithItems } from '../api/graphql'
import { deleteListItem } from '../api/graphql'
import { listQueryKey } from './useList'

export function useDeleteListItem(listId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (itemId: string) => deleteListItem({ itemId }),
    onSuccess: (_data, itemId) => {
      if (!listId) return

      queryClient.setQueryData<ListWithItems | null>(
        listQueryKey(listId),
        (current) => {
          if (current == null) return current
          return {
            ...current,
            items: current.items.filter((item) => item.id !== itemId),
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
