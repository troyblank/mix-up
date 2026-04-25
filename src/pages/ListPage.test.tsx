import Chance from 'chance'
import { render, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { createWrappersWithoutRouter } from '../testing/wrappers'
import { mockListWithItems } from '../testing/mocks/lists'
import { useList } from '../hooks/useList'
import { pickRandom } from '../utils/utils'
import { ListPage } from './ListPage'

jest.mock('../hooks/useList')
jest.mock('../utils/utils', () => ({
  ...jest.requireActual<typeof import('../utils/utils')>('../utils/utils'),
  pickRandom: jest.fn(),
}))

const chance = new Chance()
const mockUseList = jest.mocked(useList)
const mockPickRandom = jest.mocked(pickRandom)

const listIdAlphanumeric = () =>
  chance.string({
    length: 6,
    pool: 'abcdefghijklmnopqrstuvwxyz0123456789',
  })

const [listIdWithItems, listIdEmpty, listIdListType] = chance.unique(
  listIdAlphanumeric,
  3,
)

function renderWithRoute(route: string) {
  const BaseWrapper = createWrappersWithoutRouter()

  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path={'/list/:listId'} element={<ListPage />} />
      </Routes>
    </MemoryRouter>,
    { wrapper: BaseWrapper },
  )
}

describe('ListPage', () => {
  const listWithItem = mockListWithItems({
    id: listIdWithItems,
    name: chance.sentence({ words: 2 }).replace(/\.$/, ''),
    type: 'pick',
    items: [{ id: '1', name: 'Item' }],
  })
  const emptyList = mockListWithItems({
    id: listIdEmpty,
    name: chance.sentence({ words: 2 }).replace(/\.$/, ''),
    type: 'pick',
    items: [],
  })
  const listTypeList = mockListWithItems({
    id: listIdListType,
    name: chance.sentence({ words: 2 }).replace(/\.$/, ''),
    type: 'list',
    items: [{ id: '1', name: chance.word() }],
  })

  beforeEach(() => {
    mockUseList.mockImplementation((id) => {
      const data =
        id === listIdWithItems
          ? listWithItem
          : id === listIdEmpty
            ? emptyList
            : id === listIdListType
              ? listTypeList
              : listWithItem
      return {
        data,
        isLoading: false,
        isError: false,
        error: null,
      } as ReturnType<typeof useList>
    })
    mockPickRandom.mockImplementation((items) =>
      jest
        .requireActual<typeof import('../utils/utils')>('../utils/utils')
        .pickRandom(items),
    )
  })

  afterEach(() => {
    mockUseList.mockReset()
    mockPickRandom.mockReset()
  })

  it('Renders the list page with RandomPick.', async () => {
    const { findByText } = renderWithRoute(`/list/${listIdWithItems}`)
    expect(await findByText(/Item/i)).toBeInTheDocument()
  })

  it('Renders empty list message when list has no items.', async () => {
    const { findByText } = renderWithRoute(`/list/${listIdEmpty}`)
    expect(await findByText(/this list has no items/i)).toBeInTheDocument()
  })

  it('Renders RandomList when list type is list.', () => {
    const { queryByRole } = renderWithRoute(`/list/${listIdListType}`)
    expect(queryByRole('heading')).not.toBeInTheDocument()
  })

  it('Shows add, refresh choice, and delete actions fixed at the bottom for pick and list types.', async () => {
    const { findByRole } = renderWithRoute(`/list/${listIdWithItems}`)

    expect(
      await findByRole('button', { name: /^add$/i }),
    ).toBeInTheDocument()
    expect(
      await findByRole('button', { name: /^refresh choice$/i }),
    ).toBeInTheDocument()
    expect(
      await findByRole('button', { name: /^delete$/i }),
    ).toBeInTheDocument()
  })

  it('Runs menu actions when users interact with the bottom controls.', async () => {
    const user = userEvent.setup()
    mockPickRandom
      .mockReturnValueOnce(listWithItem.items[0])
      .mockReturnValueOnce(null)
    const { findByRole } = renderWithRoute(`/list/${listIdWithItems}`)

    await user.click(await findByRole('button', { name: /^add$/i }))
    await user.click(await findByRole('button', { name: /^refresh choice$/i }))
  })

  it('Selecting delete shows a confirmation dialog that names the list.', async () => {
    const user = userEvent.setup()
    const { findByRole, getByRole, getByText, queryByRole } =
      renderWithRoute(`/list/${listIdWithItems}`)

    await user.click(await findByRole('button', { name: /^delete$/i }))

    expect(
      getByRole('dialog', { name: /^delete item\?$/i }),
    ).toBeInTheDocument()
    expect(getByText(/Are you sure you want to delete/)).toHaveTextContent(
      listWithItem.items[0].name,
    )

    await user.click(getByRole('button', { name: /^cancel$/i }))
    expect(
      queryByRole('dialog', { name: /^delete item\?$/i }),
    ).not.toBeInTheDocument()
  })

  it('Confirming delete in the dialog closes it.', async () => {
    const user = userEvent.setup()
    const { findByRole, getByRole, queryByRole } =
      renderWithRoute(`/list/${listIdWithItems}`)

    await user.click(await findByRole('button', { name: /^delete$/i }))

    const dialog = getByRole('dialog', { name: /^delete item\?$/i })
    await user.click(
      within(dialog).getByRole('button', { name: /^confirm$/i }),
    )

    expect(
      queryByRole('dialog', { name: /^delete item\?$/i }),
    ).not.toBeInTheDocument()
  })

  it('Hides the pick action controls when viewing a list-type list.', () => {
    const { queryByRole } = renderWithRoute(`/list/${listIdListType}`)

    expect(queryByRole('button', { name: /^add$/i })).not.toBeInTheDocument()
    expect(
      queryByRole('button', { name: /^refresh choice$/i }),
    ).not.toBeInTheDocument()
    expect(queryByRole('button', { name: /^delete$/i })).not.toBeInTheDocument()
  })

  it('Does not show bottom actions while the list is loading.', () => {
    mockUseList.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as ReturnType<typeof useList>)

    const { queryByRole } = renderWithRoute(`/list/${listIdWithItems}`)

    expect(queryByRole('button', { name: /^add$/i })).not.toBeInTheDocument()
    expect(
      queryByRole('button', { name: /^refresh choice$/i }),
    ).not.toBeInTheDocument()
    expect(queryByRole('button', { name: /^delete$/i })).not.toBeInTheDocument()
  })

  it('Does not show bottom actions when the list fails to load.', () => {
    mockUseList.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('nope'),
    } as ReturnType<typeof useList>)

    const { queryByRole } = renderWithRoute(`/list/${listIdWithItems}`)

    expect(queryByRole('button', { name: /^add$/i })).not.toBeInTheDocument()
    expect(
      queryByRole('button', { name: /^refresh choice$/i }),
    ).not.toBeInTheDocument()
    expect(queryByRole('button', { name: /^delete$/i })).not.toBeInTheDocument()
  })
})
