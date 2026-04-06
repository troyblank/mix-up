import type { FunctionComponent } from 'react'
import { ErrorAlert } from '../ErrorAlert'
import { Loader } from '../Loader'
import { RandomPick } from '../RandomPick'
import { RandomList } from '../RandomList'
import { useList } from '../../hooks/useList'

type RandomItemProps = {
  id: string | undefined
}

export const RandomItem: FunctionComponent<RandomItemProps> = ({ id }) => {
  const { data: list, isLoading, isError, error } = useList(id)

  if (!id) return null
  if (isLoading) return <Loader text={'Loading list'} />
  if (isError)
    return <ErrorAlert message={'Failed to load list'} error={error} />
  if (list == null) return null

  if (list.type === 'pick') return <RandomPick id={id} />
  if (list.type === 'list') return <RandomList id={id} />

  return null
}
