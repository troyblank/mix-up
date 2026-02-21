import type { FunctionComponent } from 'react'
import { ButtonList, ButtonLink } from './Categories.styles'
import { ErrorAlert } from '../ErrorAlert'
import { Loader } from '../Loader'
import { useLists } from '../../hooks/useLists'

export const Categories: FunctionComponent = () => {
  const { data: lists, isLoading, isError, error } = useLists()

  if (isLoading) return <Loader text="Loading lists" />
  if (isError) return <ErrorAlert message="Failed to load lists" error={error} />
  if (lists == null || lists.length === 0) return null

  return (
    <ButtonList as="ul" role="list">
      {lists.map(({ id, name }) => (
        <li key={id}>
          <ButtonLink to={`/list/${id}`}>{name}</ButtonLink>
        </li>
      ))}
    </ButtonList>
  )
}
