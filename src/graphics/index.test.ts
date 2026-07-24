import {
  dialogFieldStyles,
  selectChevron,
  selectChevronFieldStyles,
  surfaceFieldStyles,
} from './index'

describe('Graphics', () => {
  it('Renders a a chevron icon.', () => {
    expect(dialogFieldStyles).toBeDefined()
    expect(surfaceFieldStyles).toBeDefined()
    expect(selectChevronFieldStyles).toBeDefined()
    expect(selectChevron).toContain('data:image/svg+xml')
  })
})
