import { render, screen } from '@testing-library/react'
import { createAllWrappersWithoutAuth } from '../testing/wrappers'
import { HomePage } from './HomePage'

describe('HomePage', () => {
  it('Renders the title.', async () => {
    render(<HomePage />, { wrapper: createAllWrappersWithoutAuth() })
    expect(
      await screen.findByRole('heading', { name: /mix up/i }),
    ).toBeInTheDocument()
  })
})
