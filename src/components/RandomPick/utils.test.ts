import { pickRandom } from './utils'

describe('pickRandom', () => {
  it('Returns null when items array is empty.', () => {
    expect(pickRandom([])).toBeNull()
  })

  it('Returns an item from the array when non-empty.', () => {
    const items = ['a', 'b', 'c']
    const result = pickRandom(items)
    expect(items).toContain(result)
  })
})
