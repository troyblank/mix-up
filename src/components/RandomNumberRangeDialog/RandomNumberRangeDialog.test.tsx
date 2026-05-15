import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Chance from 'chance'
import { createAllWrappersWithoutAuth } from '../../testing/wrappers'
import { randomInclusiveInteger } from '../../utils/random'
import { RandomNumberRangeDialog } from './RandomNumberRangeDialog'

jest.mock('../../utils/random', () => ({
  ...jest.requireActual<typeof import('../../utils/random')>('../../utils/random'),
  randomInclusiveInteger: jest.fn(),
}))

const chance = new Chance()
const mockRandomInclusiveInteger = jest.mocked(randomInclusiveInteger)

describe('Random number range dialog', () => {
  beforeEach(() => {
    localStorage.clear()
    mockRandomInclusiveInteger.mockImplementation((min, max) =>
      jest
        .requireActual<typeof import('../../utils/random')>('../../utils/random')
        .randomInclusiveInteger(min, max),
    )
  })

  afterEach(() => {
    mockRandomInclusiveInteger.mockReset()
  })

  it('Renders nothing when closed.', () => {
    const { container } = render(
      <RandomNumberRangeDialog isOpen={false} onClose={jest.fn()} />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    expect(container.firstChild).toBeNull()
  })

  it('Uses default minimum and maximum when local storage read fails.', () => {
    const getItem = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })

    const { getByLabelText } = render(
      <RandomNumberRangeDialog isOpen={true} onClose={jest.fn()} />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    expect(getByLabelText(/^minimum$/i)).toHaveValue(1)
    expect(getByLabelText(/^maximum$/i)).toHaveValue(10)
    getItem.mockRestore()
  })

  it('Does not break the dialog when local storage write fails.', async () => {
    const user = userEvent.setup()
    const setItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })

    const { getByLabelText, getByRole, findByText } = render(
      <RandomNumberRangeDialog isOpen={true} onClose={jest.fn()} />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    await user.clear(getByLabelText(/^minimum$/i))
    await user.type(getByLabelText(/^minimum$/i), '2')
    await user.clear(getByLabelText(/^maximum$/i))
    await user.type(getByLabelText(/^maximum$/i), '4')
    mockRandomInclusiveInteger.mockReturnValueOnce(3)
    await user.click(getByRole('button', { name: /^pick$/i }))

    expect(await findByText('3')).toBeInTheDocument()
    setItem.mockRestore()
  })

  it('Restores minimum and maximum from local storage when the dialog is opened.', () => {
    localStorage.setItem('mix-up.random-number-range.min', '3')
    localStorage.setItem('mix-up.random-number-range.max', '12')

    const { getByLabelText } = render(
      <RandomNumberRangeDialog isOpen={true} onClose={jest.fn()} />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    expect(getByLabelText(/^minimum$/i)).toHaveValue(3)
    expect(getByLabelText(/^maximum$/i)).toHaveValue(12)
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
      getByRole('checkbox', {
        name: /Remove selected number./i,
      }),
    ).toBeInTheDocument()
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

    const min = chance.integer({ min: 0, max: 5 })
    const max = min + chance.integer({ min: 5, max: 20 })
    const expected = chance.integer({ min, max })
    mockRandomInclusiveInteger.mockReturnValueOnce(expected)

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
    expect(mockRandomInclusiveInteger).toHaveBeenCalledWith(min, max)
  })

  it('When reduce-after-pick is off, leaves the maximum unchanged after a pick.', async () => {
    const user = userEvent.setup()

    const { getByLabelText, getByRole } = render(
      <RandomNumberRangeDialog isOpen={true} onClose={jest.fn()} />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    await user.clear(getByLabelText(/^maximum$/i))
    await user.type(getByLabelText(/^maximum$/i), '10')
    mockRandomInclusiveInteger.mockReturnValueOnce(4)
    await user.click(getByRole('button', { name: /^pick$/i }))

    expect(getByLabelText(/^maximum$/i)).toHaveValue(10)
  })

  it('When reduce-after-pick is on, lowers the maximum by 1 after each successful pick.', async () => {
    const user = userEvent.setup()

    const { getByLabelText, getByRole } = render(
      <RandomNumberRangeDialog isOpen={true} onClose={jest.fn()} />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    await user.clear(getByLabelText(/^minimum$/i))
    await user.type(getByLabelText(/^minimum$/i), '1')
    await user.clear(getByLabelText(/^maximum$/i))
    await user.type(getByLabelText(/^maximum$/i), '10')
    await user.click(
      getByRole('checkbox', {
        name: /Remove selected number./i,
      }),
    )

    mockRandomInclusiveInteger.mockReturnValueOnce(7)
    await user.click(getByRole('button', { name: /^pick$/i }))
    expect(getByLabelText(/^maximum$/i)).toHaveValue(9)
    expect(mockRandomInclusiveInteger).toHaveBeenLastCalledWith(1, 10)

    mockRandomInclusiveInteger.mockReturnValueOnce(3)
    await user.click(getByRole('button', { name: /^pick$/i }))
    expect(getByLabelText(/^maximum$/i)).toHaveValue(8)
    expect(mockRandomInclusiveInteger).toHaveBeenLastCalledWith(1, 9)
  })

  it('When reduce-after-pick is on and maximum is 1, keeps picking in a 1-wide range without lowering maximum.', async () => {
    const user = userEvent.setup()

    const { getByLabelText, getByRole, findByText } = render(
      <RandomNumberRangeDialog isOpen={true} onClose={jest.fn()} />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    await user.clear(getByLabelText(/^minimum$/i))
    await user.type(getByLabelText(/^minimum$/i), '1')
    await user.clear(getByLabelText(/^maximum$/i))
    await user.type(getByLabelText(/^maximum$/i), '1')
    await user.click(
      getByRole('checkbox', {
        name: /Remove selected number./i,
      }),
    )

    mockRandomInclusiveInteger.mockReturnValueOnce(1)
    await user.click(getByRole('button', { name: /^pick$/i }))
    expect(await findByText('1')).toBeInTheDocument()
    expect(getByLabelText(/^maximum$/i)).toHaveValue(1)
    expect(mockRandomInclusiveInteger).toHaveBeenLastCalledWith(1, 1)

    mockRandomInclusiveInteger.mockReturnValueOnce(1)
    await user.click(getByRole('button', { name: /^pick$/i }))
    expect(getByLabelText(/^maximum$/i)).toHaveValue(1)
    expect(mockRandomInclusiveInteger).toHaveBeenLastCalledWith(1, 1)
  })

  it('When reduce-after-pick is on, stops reducing once maximum reaches 1 after shrinking from a larger range.', async () => {
    const user = userEvent.setup()

    const { getByLabelText, getByRole } = render(
      <RandomNumberRangeDialog isOpen={true} onClose={jest.fn()} />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    await user.clear(getByLabelText(/^minimum$/i))
    await user.type(getByLabelText(/^minimum$/i), '1')
    await user.clear(getByLabelText(/^maximum$/i))
    await user.type(getByLabelText(/^maximum$/i), '2')
    await user.click(
      getByRole('checkbox', {
        name: /Remove selected number./i,
      }),
    )

    mockRandomInclusiveInteger.mockReturnValueOnce(2)
    await user.click(getByRole('button', { name: /^pick$/i }))
    expect(getByLabelText(/^maximum$/i)).toHaveValue(1)
    expect(mockRandomInclusiveInteger).toHaveBeenLastCalledWith(1, 2)

    mockRandomInclusiveInteger.mockReturnValueOnce(1)
    await user.click(getByRole('button', { name: /^pick$/i }))
    expect(getByLabelText(/^maximum$/i)).toHaveValue(1)
    expect(mockRandomInclusiveInteger).toHaveBeenLastCalledWith(1, 1)

    mockRandomInclusiveInteger.mockReturnValueOnce(1)
    await user.click(getByRole('button', { name: /^pick$/i }))
    expect(getByLabelText(/^maximum$/i)).toHaveValue(1)
    expect(mockRandomInclusiveInteger).toHaveBeenLastCalledWith(1, 1)
  })

  it('Restores reduce-after-pick preference from local storage when the dialog is opened.', () => {
    localStorage.setItem('mix-up.random-number-range.reduce-max-after-pick', 'true')

    const { getByRole } = render(
      <RandomNumberRangeDialog isOpen={true} onClose={jest.fn()} />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    expect(
      getByRole('checkbox', {
        name: /Remove selected number./i,
      }),
    ).toBeChecked()
  })
})
