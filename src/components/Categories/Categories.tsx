import { ButtonList, ButtonLink } from './Categories.styles'
import { Loader } from '../Loader'
import { useLists } from '../../hooks/useLists'

export function Categories() {
  const { data: lists, isLoading, isError, error } = useLists()

  if (isLoading) return <Loader text="Loading lists" />
  if (isError) {
    return (
      <p role="alert">
        Failed to load lists: {error instanceof Error ? error.message : 'Unknown error'}
      </p>
    )
  }
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
