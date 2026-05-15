import type { ListWithItems } from '../../api/graphql'
import { render, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Chance from 'chance'
import { mockListItem, mockListWithItems } from '../../testing/mocks/lists'
import * as randomUtils from '../../utils/random'
import { createAllWrappersWithoutAuth } from '../../testing/wrappers'
import { useList } from '../../hooks/useList'
import { RandomList } from './RandomList'

jest.mock('../../hooks/useList')

const chance = new Chance()
const mockUseList = jest.mocked(useList)

describe('RandomList', () => {
  let listWithItems: ReturnType<typeof mockListWithItems>
  let listId: string

  beforeEach(() => {
    mockUseList.mockReset()
    listId = chance.guid()
    listWithItems = mockListWithItems({
      id: listId,
      type: 'list',
    })
    mockUseList.mockReturnValue({
      data: listWithItems,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useList>)
  })

  it('Returns null when id is undefined.', () => {
    mockUseList.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useList>)

    const { container } = render(<RandomList id={undefined} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    expect(container).toBeEmptyDOMElement()
  })

  it('Shows loading state.', () => {
    mockUseList.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as ReturnType<typeof useList>)

    const { getByText } = render(<RandomList id={listId} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    expect(getByText('Loading list')).toBeInTheDocument()
  })

  it('Shows every list item in a shuffled order when the list loads.', async () => {
    const shuffleSpy = jest
      .spyOn(randomUtils, 'shuffleArray')
      .mockImplementation((items) => [...items].reverse())

    const { findByRole, findAllByRole } = render(<RandomList id={listId} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    expect(await findByRole('heading', { name: listWithItems.name })).toBeInTheDocument()

    const expectedOrder = [...listWithItems.items].reverse()
    const listItems = await findAllByRole('listitem')
    expect(listItems.map((node) => node.textContent)).toEqual(
      expectedOrder.map((item) => item.name),
    )

    shuffleSpy.mockRestore()
  })

  it('Keeps the same shuffled order when the component re-renders with the same list data.', async () => {
    const shuffleSpy = jest
      .spyOn(randomUtils, 'shuffleArray')
      .mockImplementation((items) => [...items].reverse())

    const { findAllByRole, rerender } = render(<RandomList id={listId} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    const firstPass = await findAllByRole('listitem')
    const shuffleCallsAfterLoad = shuffleSpy.mock.calls.length
    expect(shuffleCallsAfterLoad).toBeGreaterThanOrEqual(1)

    rerender(<RandomList id={listId} />)

    expect(shuffleSpy.mock.calls.length).toBe(shuffleCallsAfterLoad)
    const secondPass = await findAllByRole('listitem')
    expect(secondPass.map((node) => node.textContent)).toEqual(
      firstPass.map((node) => node.textContent),
    )

    shuffleSpy.mockRestore()
  })

  it('Reshuffles when the user taps refresh choice.', async () => {
    const user = userEvent.setup()
    const shuffleSpy = jest.spyOn(randomUtils, 'shuffleArray')

    const { findByRole } = render(<RandomList id={listId} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    await findByRole('heading', { name: listWithItems.name })
    const callsAfterLoad = shuffleSpy.mock.calls.length

    await user.click(await findByRole('button', { name: /^refresh choice$/i }))

    expect(shuffleSpy.mock.calls.length).toBeGreaterThan(callsAfterLoad)

    shuffleSpy.mockRestore()
  })

  it('Shows error when API fails.', async () => {
    mockUseList.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Server error'),
    } as ReturnType<typeof useList>)

    const { findByRole } = render(<RandomList id={listId} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })
    const alert = await findByRole('alert')

    expect(alert).toHaveTextContent(/failed to load list/i)
  })

  it('Handles item with undefined name.', async () => {
    const listWithItemNoName = {
      ...mockListWithItems({ type: 'list' }),
      items: [{ id: chance.guid() }],
    } as ListWithItems

    mockUseList.mockReturnValue({
      data: listWithItemNoName,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useList>)

    const { findByRole } = render(<RandomList id={listId} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    expect(
      await findByRole('heading', { name: listWithItemNoName.name }),
    ).toBeInTheDocument()
    const rows = await findByRole('list')
    expect(within(rows).getAllByRole('listitem')).toHaveLength(1)
  })

  it('Returns null when list loads as null.', () => {
    mockUseList.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useList>)

    const { container } = render(<RandomList id={listId} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    expect(container).toBeEmptyDOMElement()
  })

  it('Shows empty message when list has no items.', async () => {
    const emptyList = mockListWithItems({ items: [], type: 'list' })
    mockUseList.mockReturnValue({
      data: emptyList,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useList>)

    const { findByText } = render(<RandomList id={listId} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    expect(await findByText(/this list has no items/i)).toBeInTheDocument()
  })

  it('Reshuffles when the item count changes.', async () => {
    const firstItem = mockListItem({ name: 'StillHere' })
    const secondItem = mockListItem()
    const listTwoItems = mockListWithItems({
      id: listId,
      type: 'list',
      items: [firstItem, secondItem],
    })
    const listThreeItems = mockListWithItems({
      id: listId,
      type: 'list',
      items: [firstItem, secondItem, mockListItem()],
    })

    let currentList: ListWithItems = listTwoItems
    mockUseList.mockImplementation(
      () =>
        ({
          data: currentList,
          isLoading: false,
          isError: false,
          error: null,
        }) as ReturnType<typeof useList>,
    )

    const shuffleSpy = jest
      .spyOn(randomUtils, 'shuffleArray')
      .mockImplementation((items) => [...items].reverse())

    const wrapper = createAllWrappersWithoutAuth()
    const { findAllByRole, container, rerender } = render(
      <RandomList id={listId} />,
      { wrapper },
    )

    const twoRowPass = await findAllByRole('listitem')
    expect(twoRowPass).toHaveLength(2)
    const shuffleCallsAfterTwoItems = shuffleSpy.mock.calls.length
    expect(shuffleCallsAfterTwoItems).toBeGreaterThanOrEqual(1)

    currentList = listThreeItems
    rerender(<RandomList id={listId} />)

    await waitFor(() => {
      expect(container.querySelectorAll('li')).toHaveLength(3)
    })

    expect(shuffleSpy.mock.calls.length).toBeGreaterThan(shuffleCallsAfterTwoItems)

    shuffleSpy.mockRestore()
  })
})
