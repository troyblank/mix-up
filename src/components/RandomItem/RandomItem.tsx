import type { FunctionComponent, ReactNode } from 'react'
import { ErrorAlert } from '../ErrorAlert'
import { Loader } from '../Loader'
import { RandomList } from '../RandomList'
import { RandomPick } from '../RandomPick'
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
  if (list.type !== 'pick' && list.type !== 'list') return null

  const main: ReactNode =
    list.type === 'pick' ? <RandomPick id={id} /> : <RandomList id={id} />

  return <>{main}</>
}
