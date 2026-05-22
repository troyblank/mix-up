import { render, screen } from '@testing-library/react'
import { createAllWrappersWithoutAuth } from '../../testing/wrappers'
import { Loader } from './index'

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

  it('Uses an in-button spinner when requested.', async () => {
    const wrapper = createAllWrappersWithoutAuth()

    const { container: defaultContainer } = render(
      <Loader text={'Loading lists'} />,
      { wrapper },
    )
    const { container: inButtonContainer } = render(
      <Loader text={'Saving'} inButton={true} />,
      { wrapper },
    )

    expect(await screen.findByText('Saving')).toBeInTheDocument()

    const defaultSpinner = defaultContainer.querySelector('[aria-hidden="true"]')
    const inButtonSpinner = inButtonContainer.querySelector(
      '[aria-hidden="true"]',
    )

    expect(defaultSpinner).toBeInTheDocument()
    expect(inButtonSpinner).toBeInTheDocument()
    expect(getComputedStyle(defaultSpinner!).borderTopColor).not.toBe(
      getComputedStyle(inButtonSpinner!).borderTopColor,
    )
  })
})
