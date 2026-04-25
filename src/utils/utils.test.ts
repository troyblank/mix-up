import Chance from 'chance'
import { pickRandom, randomInclusiveInteger } from './utils'

const chance = new Chance()

describe('pickRandom', () => {
  it('Returns null when items array is empty.', () => {
    expect(pickRandom([])).toBeNull()
  })

  it('Returns an item from the array when non-empty.', () => {
    const items = chance.unique(chance.word, 5)
    const randomlyPickedItem = pickRandom(items)

    expect(items).toContain(randomlyPickedItem)
  })
})

describe('randomInclusiveInteger', () => {
  it('Returns an integer between minimum and maximum inclusive.', () => {
    for (let attemptIndex = 0; attemptIndex < 40; attemptIndex += 1) {
      const minimum = chance.integer({ min: -20, max: 50 })
      const maximum = minimum + chance.integer({ min: 0, max: 30 })
      const randomInclusiveIntegerResult = randomInclusiveInteger(
        minimum,
        maximum,
      )

      expect(Number.isInteger(randomInclusiveIntegerResult)).toBe(true)
      expect(randomInclusiveIntegerResult).toBeGreaterThanOrEqual(minimum)
      expect(randomInclusiveIntegerResult).toBeLessThanOrEqual(maximum)
    }
  })
})