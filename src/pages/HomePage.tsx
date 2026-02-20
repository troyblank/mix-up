import { HomePageWrapper, Title } from './HomePage.styles'
import { Categories } from '../components/Categories'

export function HomePage() {
  return (
    <HomePageWrapper as="main">
      <Title as="h1">Mix Up</Title>
      <Categories />
    </HomePageWrapper>
  )
}
