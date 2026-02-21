import Chance from 'chance'
import type { List, ListItem, ListWithItems } from '../../api/graphql'

const chance = new Chance()
const MAX_LISTS = 10
const DEFAULT_ITEMS_COUNT = 3

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

export function mockListItem(override?: Partial<ListItem>): ListItem {
  return {
    id: chance.guid(),
    name: chance.word(),
    ...override,
  }
}

export function mockListWithItems(override?: Partial<ListWithItems>): ListWithItems {
  return {
    ...mockList(),
    items:
      override?.items ??
      Array.from({ length: DEFAULT_ITEMS_COUNT }, () => mockListItem()),
    ...override,
  }
}
