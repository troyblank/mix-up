import { space, spaceVarName } from './space'

describe('Space Scale', () => {
  it('Maps keys to kebab-case CSS variable names.', () => {
    expect(spaceVarName('medium')).toBe('--space-medium')
    expect(spaceVarName('extraSmall')).toBe('--space-extra-small')
    expect(spaceVarName('extraLarge')).toBe('--space-extra-large')
  })

  it('Uses full-word rhythm tokens.', () => {
    expect(space.medium).toBe('1rem')
    expect(space.extraLarge).toBe('2rem')
    expect(space.maximum).toBe('3rem')
  })
})
