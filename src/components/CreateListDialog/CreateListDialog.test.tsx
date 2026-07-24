import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Chance from 'chance'
import { createList } from '../../api/graphql'
import { mockList } from '../../testing/mocks/lists'
import { createAllWrappersWithoutAuth } from '../../testing/wrappers'
import { CreateListDialog } from './CreateListDialog'

jest.mock('../../api/graphql', () => ({
  ...jest.requireActual<typeof import('../../api/graphql')>('../../api/graphql'),
  createList: jest.fn(),
}))

const chance = new Chance()
const mockCreateList = jest.mocked(createList)

describe('Create list dialog', () => {
  beforeEach(() => {
    mockCreateList.mockReset()
  })

  it('Renders nothing when closed.', () => {
    const { container } = render(
      <CreateListDialog isOpen={false} onClose={jest.fn()} />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    expect(container.firstChild).toBeNull()
  })

  it('Resets the form when opened.', () => {
    const { getByLabelText, rerender } = render(
      <CreateListDialog isOpen={true} onClose={jest.fn()} />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    const nameInput = getByLabelText(/^name$/i)
    const typeSelect = getByLabelText(/^type$/i)

    expect(nameInput).toHaveValue('')
    expect(typeSelect).toHaveValue('pick')

    rerender(<CreateListDialog isOpen={false} onClose={jest.fn()} />)
    rerender(<CreateListDialog isOpen={true} onClose={jest.fn()} />)

    expect(getByLabelText(/^name$/i)).toHaveValue('')
    expect(getByLabelText(/^type$/i)).toHaveValue('pick')
  })

  it('Creates a list with the entered name and selected type.', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    const createdList = mockList({ type: 'list' })
    mockCreateList.mockResolvedValue(createdList)

    const { getByLabelText, getByRole } = render(
      <CreateListDialog isOpen={true} onClose={onClose} />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    const listName = chance.word()
    await user.type(getByLabelText(/^name$/i), listName)
    await user.selectOptions(getByLabelText(/^type$/i), 'list')
    await user.click(getByRole('button', { name: /^create$/i }))

    expect(mockCreateList).toHaveBeenCalledWith({
      name: listName,
      type: 'list',
    })
    expect(onClose).toHaveBeenCalled()
  })

  it('Does not create a list when the name is blank.', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()

    const { getByRole } = render(
      <CreateListDialog isOpen={true} onClose={onClose} />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    await user.click(getByRole('button', { name: /^create$/i }))

    expect(mockCreateList).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('Shows an error when create fails.', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    const errorMessage = chance.sentence()
    mockCreateList.mockRejectedValue(new Error(errorMessage))

    const { getByLabelText, getByRole } = render(
      <CreateListDialog isOpen={true} onClose={onClose} />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    await user.type(getByLabelText(/^name$/i), chance.word())
    await user.click(getByRole('button', { name: /^create$/i }))

    await waitFor(() => {
      expect(getByRole('alert')).toHaveTextContent(/failed to create list/i)
    })
    expect(getByRole('alert')).toHaveTextContent(errorMessage)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('Does not close while create is pending.', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    mockCreateList.mockImplementation(() => new Promise(() => {}))

    const { getByLabelText, getByRole, getByTestId } = render(
      <CreateListDialog isOpen={true} onClose={onClose} />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    await user.type(getByLabelText(/^name$/i), chance.word())
    await user.click(getByRole('button', { name: /^create$/i }))
    await user.click(getByTestId('create-list-backdrop'))
    await user.keyboard('{Escape}')

    expect(onClose).not.toHaveBeenCalled()
  })
})
