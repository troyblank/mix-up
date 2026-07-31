import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Chance from 'chance'
import type { List } from '../../api/graphql'
import { deleteList } from '../../api/graphql'
import { mockList } from '../../testing/mocks/lists'
import { createAllWrappersWithoutAuth } from '../../testing/wrappers'
import { DeleteListDialog } from './DeleteListDialog'

jest.mock('../ConfirmDialog', () => {
  const actual = jest.requireActual<typeof import('../ConfirmDialog')>(
    '../ConfirmDialog',
  )
  return {
    ...actual,
    ConfirmDialog: jest.fn((props) =>
      actual.ConfirmDialog({ ...props, isConfirmPending: false }),
    ),
  }
})

jest.mock('../../api/graphql', () => ({
  ...jest.requireActual<typeof import('../../api/graphql')>('../../api/graphql'),
  deleteList: jest.fn(),
}))

jest.mock('../../hooks/useLists', () => ({
  ...jest.requireActual<typeof import('../../hooks/useLists')>(
    '../../hooks/useLists',
  ),
  useLists: jest.fn(),
}))

import { useLists } from '../../hooks/useLists'

const chance = new Chance()
const mockDeleteList = jest.mocked(deleteList)
const mockUseLists = jest.mocked(useLists)

const mockUseListsResult = (data: List[]): ReturnType<typeof useLists> =>
  ({
    data,
    isLoading: false,
    isError: false,
    error: null,
  }) as ReturnType<typeof useLists>

describe('Delete list dialog', () => {
  beforeEach(() => {
    mockDeleteList.mockReset()
    mockUseLists.mockReset()
  })

  it('Renders nothing when closed.', () => {
    mockUseLists.mockReturnValue(mockUseListsResult([mockList()]))

    const { container } = render(
      <DeleteListDialog isOpen={false} onClose={jest.fn()} />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    expect(container.firstChild).toBeNull()
  })

  it('Shows lists in alphabetical order in the select.', () => {
    const zebraList = mockList({ name: 'Zebra' })
    const alphaList = mockList({ name: 'Alpha' })
    const middleList = mockList({ name: 'Middle' })
    mockUseLists.mockReturnValue(
      mockUseListsResult([zebraList, alphaList, middleList]),
    )

    const { getByRole } = render(
      <DeleteListDialog isOpen={true} onClose={jest.fn()} />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    const listSelect = getByRole('combobox', { name: /^list to delete$/i })
    expect(listSelect).toHaveValue(alphaList.id)
    expect(listSelect).toHaveTextContent('Alpha')
    expect(listSelect).toHaveTextContent('Middle')
    expect(listSelect).toHaveTextContent('Zebra')

    const options = Array.from(listSelect.querySelectorAll('option')).map(
      (option) => option.textContent,
    )
    expect(options).toEqual(['Alpha', 'Middle', 'Zebra'])
  })

  it('Deletes the selected list and closes the dialog.', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    const firstList = mockList({ name: 'Alpha' })
    const secondList = mockList({ name: 'Beta' })
    mockUseLists.mockReturnValue(mockUseListsResult([secondList, firstList]))
    mockDeleteList.mockResolvedValue(true)

    const { getByRole } = render(
      <DeleteListDialog isOpen={true} onClose={onClose} />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    await user.selectOptions(
      getByRole('combobox', { name: /^list to delete$/i }),
      secondList.id,
    )
    await user.click(getByRole('button', { name: /^confirm$/i }))

    await waitFor(() => {
      expect(mockDeleteList).toHaveBeenCalledWith({ listId: secondList.id })
    })
    expect(onClose).toHaveBeenCalled()
  })

  it('Shows an error when delete fails.', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    const errorMessage = chance.sentence()
    const list = mockList()
    mockUseLists.mockReturnValue(mockUseListsResult([list]))
    mockDeleteList.mockRejectedValue(new Error(errorMessage))

    const { getByRole } = render(
      <DeleteListDialog isOpen={true} onClose={onClose} />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    await user.click(getByRole('button', { name: /^confirm$/i }))

    await waitFor(() => {
      expect(getByRole('alert')).toHaveTextContent(/failed to delete list/i)
    })
    expect(getByRole('alert')).toHaveTextContent(errorMessage)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('Shows a message when there are no lists to delete.', () => {
    mockUseLists.mockReturnValue(mockUseListsResult([]))

    const { getByRole } = render(
      <DeleteListDialog isOpen={true} onClose={jest.fn()} />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    expect(getByRole('dialog', { name: /^delete list\?$/i })).toHaveTextContent(
      /no lists to delete/i,
    )
  })

  it('Does not delete when confirm is clicked with no lists.', async () => {
    const user = userEvent.setup()
    mockUseLists.mockReturnValue(mockUseListsResult([]))

    const { getByRole } = render(
      <DeleteListDialog isOpen={true} onClose={jest.fn()} />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    await user.click(getByRole('button', { name: /^confirm$/i }))

    expect(mockDeleteList).not.toHaveBeenCalled()
  })

  it('Does not close while delete is pending.', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    const list = mockList()
    mockUseLists.mockReturnValue(mockUseListsResult([list]))
    mockDeleteList.mockImplementation(() => new Promise(() => {}))

    const { getByRole, getByTestId } = render(
      <DeleteListDialog isOpen={true} onClose={onClose} />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    await user.click(getByRole('button', { name: /^confirm$/i }))
    await user.click(getByTestId('confirm-dialog-backdrop'))
    await user.keyboard('{Escape}')

    expect(onClose).not.toHaveBeenCalled()
  })
})
