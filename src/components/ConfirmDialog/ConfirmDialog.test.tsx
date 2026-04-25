import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Chance from 'chance'
import { createAllWrappersWithoutAuth } from '../../testing/wrappers'
import { ConfirmDialog } from './ConfirmDialog'

const chance = new Chance()

describe('Confirm dialog', () => {
  it('Renders nothing when closed.', () => {
    const { container } = render(
      <ConfirmDialog
        isOpen={false}
        title={chance.word()}
        message={chance.sentence()}
        onClose={jest.fn()}
        onConfirm={jest.fn()}
      />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    expect(container.firstChild).toBeNull()
  })

  it('Shows the title, message, and confirm controls when open.', () => {
    const titleText = 'Example title'
    const body = chance.sentence({ words: 5 }).replace(/\.$/, '')

    const { getByRole, getByText } = render(
      <ConfirmDialog
        isOpen={true}
        title={titleText}
        message={body}
        onClose={jest.fn()}
        onConfirm={jest.fn()}
      />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    expect(
      getByRole('dialog', { name: new RegExp(`^${titleText}$`, 'i') }),
    ).toBeInTheDocument()
    expect(getByText(body)).toBeInTheDocument()
    expect(
      getByRole('button', { name: /^confirm$/i }),
    ).toBeInTheDocument()
    expect(
      getByRole('button', { name: /^cancel$/i }),
    ).toBeInTheDocument()
  })

  it('When the user confirms, notifies once and closes.', async () => {
    const user = userEvent.setup()
    const handleClose = jest.fn()
    const handleConfirm = jest.fn()

    const { getByRole } = render(
      <ConfirmDialog
        isOpen={true}
        title={'Title'}
        message={'Message'}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    await user.click(getByRole('button', { name: /^confirm$/i }))

    expect(handleConfirm).toHaveBeenCalledTimes(1)
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('When the user cancels, only closes.', async () => {
    const user = userEvent.setup()
    const handleClose = jest.fn()
    const handleConfirm = jest.fn()

    const { getByRole } = render(
      <ConfirmDialog
        isOpen={true}
        title={'Title'}
        message={'Message'}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    await user.click(getByRole('button', { name: /^cancel$/i }))

    expect(handleConfirm).not.toHaveBeenCalled()
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('When the user presses Escape, closes.', async () => {
    const user = userEvent.setup()
    const handleClose = jest.fn()

    render(
      <ConfirmDialog
        isOpen={true}
        title={'Title'}
        message={'Message'}
        onClose={handleClose}
        onConfirm={jest.fn()}
      />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    await user.keyboard('{Escape}')

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('When the user presses a key other than Escape, stays open.', async () => {
    const user = userEvent.setup()
    const handleClose = jest.fn()

    render(
      <ConfirmDialog
        isOpen={true}
        title={'Title'}
        message={'Message'}
        onClose={handleClose}
        onConfirm={jest.fn()}
      />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    await user.keyboard('a')

    expect(handleClose).not.toHaveBeenCalled()
  })

  it('When the user clicks the backdrop, closes.', async () => {
    const user = userEvent.setup()
    const handleClose = jest.fn()

    const { getByTestId } = render(
      <ConfirmDialog
        isOpen={true}
        title={'Title'}
        message={'Message'}
        onClose={handleClose}
        onConfirm={jest.fn()}
      />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    await user.click(getByTestId('confirm-dialog-backdrop'))

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('Labels the dialog using the title so the heading id matches aria-labelledby.', () => {
    const titleText = 'Confirm this action'

    const { getByRole } = render(
      <ConfirmDialog
        isOpen={true}
        title={titleText}
        message={'Details go here.'}
        onClose={jest.fn()}
        onConfirm={jest.fn()}
      />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    const dialog = getByRole('dialog', { name: new RegExp(`^${titleText}$`, 'i') })
    const labelledBy = dialog.getAttribute('aria-labelledby')
    expect(labelledBy).toBeTruthy()

    const titleNode = document.getElementById(labelledBy!)
    expect(titleNode).not.toBeNull()
    expect(titleNode).toHaveTextContent(titleText)
  })
})
