import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ListWithItems } from '../api/graphql'
import { deleteListItem } from '../api/graphql'
import { listQueryKey } from './useList'

type DeleteListItemContext = {
  previousList: ListWithItems | null | undefined
}

export function useDeleteListItem(listId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (itemId: string) => deleteListItem({ itemId }),
    onMutate: async (itemId) => {
      if (!listId) return

      await queryClient.cancelQueries({ queryKey: listQueryKey(listId) })

      const previousList = queryClient.getQueryData<ListWithItems | null>(
        listQueryKey(listId),
      )

      if (previousList != null) {
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
      }

      return { previousList } satisfies DeleteListItemContext
    },
    onError: (_error, _itemId, context) => {
      if (!listId || context == null) return

      queryClient.setQueryData(
        listQueryKey(listId),
        context.previousList,
      )
    },
    onSettled: () => {
      if (listId) {
        void queryClient.invalidateQueries({ queryKey: listQueryKey(listId) })
      }
    },
  })
}
