import Chance from 'chance'
import { mockListItem } from '../../testing/mocks/lists'
import { itemDisplayName, resolveDeleteTargetId } from './utils'

const chance = new Chance()

describe('Showing an item name in the delete dropdown', () => {
  it('Returns the item name when it is present.', () => {
    const name = chance.word()
    const item = mockListItem({ name })

    expect(itemDisplayName(item)).toBe(name)
  })

  it('Trims whitespace from the name.', () => {
    const name = chance.word()
    const item = mockListItem({ name: `  ${name}  ` })

    expect(itemDisplayName(item)).toBe(name)
  })

  it('Returns Unnamed item when the name is empty.', () => {
    const item = mockListItem({ name: '' })

    expect(itemDisplayName(item)).toBe('Unnamed item')
  })

  it('Returns Unnamed item when the name is only whitespace.', () => {
    const item = mockListItem({ name: '   ' })

    expect(itemDisplayName(item)).toBe('Unnamed item')
  })

  it('Returns Unnamed item when the name is undefined.', () => {
    const item = mockListItem({ name: undefined })

    expect(itemDisplayName(item)).toBe('Unnamed item')
  })
})

describe('Choosing which item is preselected when you open delete', () => {
  it('Returns null when the items list is empty.', () => {
    expect(resolveDeleteTargetId([], chance.word())).toBeNull()
  })

  it('Returns the id of the item matching the picked name.', () => {
    const first = mockListItem()
    const second = mockListItem()

    expect(
      resolveDeleteTargetId([first, second], second.name),
    ).toBe(second.id)
  })

  it('Returns the first item id when picked name is null.', () => {
    const first = mockListItem()
    const second = mockListItem()

    expect(resolveDeleteTargetId([first, second], null)).toBe(first.id)
  })

  it('Returns the first item id when picked name is empty.', () => {
    const first = mockListItem()
    const second = mockListItem()

    expect(resolveDeleteTargetId([first, second], '')).toBe(first.id)
  })

  it('Returns the first item id when picked name does not match any item.', () => {
    const first = mockListItem()
    const second = mockListItem()

    expect(
      resolveDeleteTargetId([first, second], chance.word()),
    ).toBe(first.id)
  })
})
