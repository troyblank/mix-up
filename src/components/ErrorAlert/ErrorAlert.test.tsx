import { render, screen } from '@testing-library/react'
import { ErrorAlert } from './ErrorAlert'

describe('ErrorAlert', () => {
  it('Shows error message when error is an Error instance.', () => {
    render(<ErrorAlert message="Failed to load" error={new Error('Server error')} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load: Server error')
  })

  it('Shows Unknown error when error is not an Error instance.', () => {
    render(<ErrorAlert message="Failed to load" error="network failure" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load: Unknown error')
  })
})
