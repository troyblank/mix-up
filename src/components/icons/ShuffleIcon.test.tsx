import { render } from '@testing-library/react'
import { createAllWrappersWithoutAuth } from '../../testing/wrappers'
import { ShuffleIcon } from './ShuffleIcon'

describe('Shuffle Icon', () => {
  it('Renders the shuffle icon.', () => {
    const { container } = render(<ShuffleIcon />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    const svg = container.querySelector('svg[aria-hidden="true"]')
    expect(svg).toBeInTheDocument()
  })
})
