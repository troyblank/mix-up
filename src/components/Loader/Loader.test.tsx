import { render, screen } from '@testing-library/react'
import { createAllWrappers } from '../../testing/wrappers'
import { Loader } from './Loader'

describe('Loader', () => {
  it('Shows the given text.', () => {
    render(<Loader text="Loading lists" />, { wrapper: createAllWrappers() })

    expect(screen.getByText('Loading lists')).toBeInTheDocument()
  })

  it('Marks the region as busy for screen readers.', () => {
    render(<Loader text="Please wait" />, { wrapper: createAllWrappers() })

    expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument()
  })

  it('Hides the spinner from assistive tech.', () => {
    render(<Loader text="Saving" />, { wrapper: createAllWrappers() })

    const spinner = document.querySelector('[aria-hidden="true"]')

    expect(spinner).toBeInTheDocument()
  })
})