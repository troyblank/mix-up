import { render, screen } from '@testing-library/react'
import { createAllWrappersWithoutAuth } from '../../testing/wrappers'
import { Loader } from './Loader'

describe('Loader', () => {
  it('Shows the given text.', async () => {
    render(<Loader text={'Loading lists'} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    expect(await screen.findByText('Loading lists')).toBeInTheDocument()
  })

  it('Marks the region as busy for screen readers.', async () => {
    const { container } = render(<Loader text={'Please wait'} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    expect(await screen.findByText('Please wait')).toBeInTheDocument()
    expect(
      container.querySelector('[aria-busy="true"]'),
    ).toBeInTheDocument()
  })

  it('Hides the spinner from assistive tech.', async () => {
    const { container } = render(<Loader text={'Saving'} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    expect(await screen.findByText('Saving')).toBeInTheDocument()
    const spinner = container.querySelector('[aria-hidden="true"]')

    expect(spinner).toBeInTheDocument()
  })
})
