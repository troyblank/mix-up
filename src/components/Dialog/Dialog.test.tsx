import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createAllWrappersWithoutAuth } from '../../testing/wrappers'
import { Dialog } from './Dialog'
import { DialogTitle } from './Dialog.styles'

describe('Dialog', () => {
  it('Renders nothing when closed.', () => {
    const { container } = render(
      <Dialog
        isOpen={false}
        onClose={jest.fn()}
        ariaLabelledBy={'dialog-title'}
      >
        <DialogTitle id={'dialog-title'}>Title</DialogTitle>
      </Dialog>,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    expect(container.firstChild).toBeNull()
  })

  it('Shows children when open.', () => {
    const { getByRole, getByText } = render(
      <Dialog
        isOpen={true}
        onClose={jest.fn()}
        ariaLabelledBy={'dialog-title'}
      >
        <DialogTitle id={'dialog-title'}>My dialog</DialogTitle>
        <p>Body content</p>
      </Dialog>,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    expect(
      getByRole('dialog', { name: /^my dialog$/i }),
    ).toBeInTheDocument()
    expect(getByText('Body content')).toBeInTheDocument()
  })

  it('When the user clicks the backdrop, notifies close once.', async () => {
    const user = userEvent.setup()
    const handleClose = jest.fn()

    const { getByTestId } = render(
      <Dialog
        isOpen={true}
        onClose={handleClose}
        ariaLabelledBy={'dialog-title'}
        backdropTestId={'test-dialog-backdrop'}
      >
        <DialogTitle id={'dialog-title'}>T</DialogTitle>
      </Dialog>,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    await user.click(getByTestId('test-dialog-backdrop'))

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('When the user presses Escape, notifies close once.', async () => {
    const user = userEvent.setup()
    const handleClose = jest.fn()

    render(
      <Dialog
        isOpen={true}
        onClose={handleClose}
        ariaLabelledBy={'dialog-title'}
      >
        <DialogTitle id={'dialog-title'}>T</DialogTitle>
      </Dialog>,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    await user.keyboard('{Escape}')

    expect(handleClose).toHaveBeenCalledTimes(1)
  })
})
