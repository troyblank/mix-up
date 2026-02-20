import { HomeScreenWrapper, Title, ButtonList, Button } from './HomeScreen.styles'
import { Loader } from './'
import { useLists } from '../hooks/useLists'

export function HomeScreen() {
  const { data: lists, isLoading, isError, error } = useLists()

  return (
    <HomeScreenWrapper as="main">
      <Title as="h1">Mix Up</Title>
      {isLoading && <Loader text="Loading lists" />}
      {isError && (
        <p role="alert">
          Failed to load lists: {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      )}
      {lists != null && lists.length > 0 && (
        <ButtonList as="ul" role="list">
          {lists.map(({ id, name }) => (
            <li key={id}>
              <Button type="button">{name}</Button>
            </li>
          ))}
        </ButtonList>
      )}
    </HomeScreenWrapper>
  )
}
