import { render } from '@testing-library/react'
import { createAllWrappersWithoutAuth } from '../../testing/wrappers'
import { PlusIcon } from './PlusIcon'

describe('Plus Icon', () => {
  it('Renders the plus icon.', () => {
    const { container } = render(<PlusIcon />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    const svg = container.querySelector('svg[aria-hidden="true"]')
    expect(svg).toBeInTheDocument()
  })
})
