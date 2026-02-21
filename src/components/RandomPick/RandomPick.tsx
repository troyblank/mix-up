import type { FunctionComponent } from 'react'
import { useMemo } from 'react'
import { ErrorAlert } from '../ErrorAlert'
import { Loader } from '../Loader'
import { useList } from '../../hooks/useList'
import { pickRandom } from './utils'
import { RandomPickWrapper, ListTitle, PickedItem } from './RandomPick.styles'

type RandomPickProps = {
  id: string | undefined
}

export const RandomPick: FunctionComponent<RandomPickProps> = ({ id }) => {
  const { data: list, isLoading, isError, error } = useList(id)
  const picked = useMemo(() => {
    if (list?.items?.length) {
      const item = pickRandom(list.items)
      return item?.name ?? null
    }
    return null
  }, [list?.items])

  if (!id) return null
  if (isLoading) return <Loader text="Loading pick" />
  if (isError) return <ErrorAlert message="Failed to load pick" error={error} />
  if (list == null || list.items.length === 0) {
    return <p>This list has no items.</p>
  }

  return (
    <RandomPickWrapper>
      <ListTitle>{list.name}</ListTitle>
      <PickedItem>{picked}</PickedItem>
    </RandomPickWrapper>
  )
}
