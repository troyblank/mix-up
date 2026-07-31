import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { List } from '../api/graphql'
import { deleteList } from '../api/graphql'
import { listQueryKey } from './useList'
import { listsQueryKey } from './useLists'

export const useDeleteList = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (listId: string) => deleteList({ listId }),
    onSuccess: (_data, listId) => {
      queryClient.setQueryData<List[]>(listsQueryKey, (current) =>
        current != null
          ? current.filter((list) => list.id !== listId)
          : current,
      )
      queryClient.removeQueries({ queryKey: listQueryKey(listId) })
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: listsQueryKey })
    },
  })
}
