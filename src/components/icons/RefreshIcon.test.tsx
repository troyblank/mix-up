import { render } from '@testing-library/react'
import { createAllWrappersWithoutAuth } from '../../testing/wrappers'
import { RefreshIcon } from './RefreshIcon'

describe('Refresh Icon', () => {
  it('Renders the refresh icon.', () => {
    const { container } = render(<RefreshIcon />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    const svg = container.querySelector('svg[aria-hidden="true"]')
    expect(svg).toBeInTheDocument()
  })
})
