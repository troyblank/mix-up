import Chance from 'chance'
import type { List } from '../../api/graphql'

const chance = new Chance()
const MAX_LISTS = 10

export function mockList(override?: Partial<List>): List {
  return {
    id: chance.guid(),
    name: chance.sentence({ words: 2 }).replace(/\.$/, ''),
    ...override,
  }
}

export function mockLists(): List[] {
  const count = chance.integer({ min: 1, max: MAX_LISTS })
  return Array.from({ length: count }, () => mockList())
}
