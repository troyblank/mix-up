import { render } from '@testing-library/react'
import { createAllWrappersWithoutAuth } from '../../testing/wrappers'
import { DeleteIcon } from './DeleteIcon'

describe('Delete Icon', () => {
  it('Renders the delete icon.', () => {
    const { container } = render(<DeleteIcon />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    const svg = container.querySelector('svg[aria-hidden="true"]')
    expect(svg).toBeInTheDocument()
  })
})
