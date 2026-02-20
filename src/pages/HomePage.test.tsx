import { render, screen } from '@testing-library/react'
import { createAllWrappers } from '../testing/wrappers'
import { HomePage } from './HomePage'

describe('HomePage', () => {
  it('renders the title', () => {
    render(<HomePage />, { wrapper: createAllWrappers() })
    expect(screen.getByRole('heading', { name: /mix up/i })).toBeInTheDocument()
  })
})
