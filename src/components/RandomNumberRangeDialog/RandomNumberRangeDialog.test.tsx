import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Chance from 'chance'
import { createAllWrappersWithoutAuth } from '../../testing/wrappers'
import { RandomNumberRangeDialog } from './RandomNumberRangeDialog'

const chance = new Chance()

describe('Random number range dialog', () => {
  it('Renders nothing when closed.', () => {
    const { container } = render(
      <RandomNumberRangeDialog isOpen={false} onClose={jest.fn()} />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    expect(container.firstChild).toBeNull()
  })

  it('Shows min and max fields and pick control when open.', () => {
    const { getByLabelText, getByRole } = render(
      <RandomNumberRangeDialog isOpen={true} onClose={jest.fn()} />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    expect(getByRole('dialog', { name: 'Random number' })).toBeInTheDocument()
    expect(getByLabelText(/^minimum$/i)).toBeInTheDocument()
    expect(getByLabelText(/^maximum$/i)).toBeInTheDocument()
    expect(
      getByRole('button', { name: /^pick$/i }),
    ).toBeInTheDocument()
  })

  it('When the user activates Close, the dialog notifies that it closed once.', async () => {
    const user = userEvent.setup()
    const handleClose = jest.fn()

    const { getByRole } = render(
      <RandomNumberRangeDialog isOpen={true} onClose={handleClose} />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    await user.click(getByRole('button', { name: /^close$/i }))

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('When the user presses Escape, the dialog notifies that it closed once.', async () => {
    const user = userEvent.setup()
    const handleClose = jest.fn()

    render(
      <RandomNumberRangeDialog isOpen={true} onClose={handleClose} />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    await user.keyboard('{Escape}')

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('Shows an error when inputs are not valid whole numbers.', async () => {
    const user = userEvent.setup()

    const { getByLabelText, getByRole, findByRole } = render(
      <RandomNumberRangeDialog isOpen={true} onClose={jest.fn()} />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    await user.clear(getByLabelText(/^minimum$/i))
    await user.clear(getByLabelText(/^maximum$/i))
    await user.click(getByRole('button', { name: /^pick$/i }))

    expect(
      await findByRole('alert'),
    ).toHaveTextContent(/enter valid whole numbers/i)
  })

  it('When the user clicks outside the dialog on the backdrop, the dialog notifies that it closed once.', async () => {
    const user = userEvent.setup()
    const handleClose = jest.fn()

    const { getByTestId } = render(
      <RandomNumberRangeDialog isOpen={true} onClose={handleClose} />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    await user.click(getByTestId('random-range-backdrop'))

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('Shows an error when minimum is greater than maximum.', async () => {
    const user = userEvent.setup()

    const { getByLabelText, getByRole, findByRole } = render(
      <RandomNumberRangeDialog isOpen={true} onClose={jest.fn()} />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    await user.clear(getByLabelText(/^minimum$/i))
    await user.type(getByLabelText(/^minimum$/i), '9')
    await user.clear(getByLabelText(/^maximum$/i))
    await user.type(getByLabelText(/^maximum$/i), '1')
    await user.click(getByRole('button', { name: /^pick$/i }))

    expect(
      await findByRole('alert'),
    ).toHaveTextContent(/minimum must be less than or equal to maximum/i)
  })

  it('Shows a random result within the chosen inclusive range.', async () => {
    const user = userEvent.setup()
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.5)

    const min = chance.integer({ min: 0, max: 5 })
    const max = min + chance.integer({ min: 5, max: 20 })
    const expected = Math.floor(0.5 * (max - min + 1)) + min

    const { getByLabelText, getByRole, findByText } = render(
      <RandomNumberRangeDialog isOpen={true} onClose={jest.fn()} />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    await user.clear(getByLabelText(/^minimum$/i))
    await user.type(getByLabelText(/^minimum$/i), String(min))
    await user.clear(getByLabelText(/^maximum$/i))
    await user.type(getByLabelText(/^maximum$/i), String(max))
    await user.click(getByRole('button', { name: /^pick$/i }))

    expect(await findByText(String(expected))).toBeInTheDocument()

    randomSpy.mockRestore()
  })
})
