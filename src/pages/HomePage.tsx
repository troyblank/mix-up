import type { FunctionComponent } from 'react'
import { HomePageWrapper, Title } from './HomePage.styles'
import { Categories } from '../components/Categories'

export const HomePage: FunctionComponent = () => {
  return (
    <HomePageWrapper as="main">
      <Title as="h1">Mix Up</Title>
      <Categories />
    </HomePageWrapper>
  )
}
