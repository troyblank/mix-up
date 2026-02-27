import Chance from 'chance'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { App } from './App'
import { mockList, mockListWithItems } from './testing/mocks/lists'
import { useList } from './hooks/useList'
import { useLists } from './hooks/useLists'

jest.mock('./hooks/useList')
jest.mock('./hooks/useLists')

const chance = new Chance()
const mockUseList = jest.mocked(useList)
const mockUseLists = jest.mocked(useLists)

const renderApp = (initialRoute = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <App />
    </MemoryRouter>,
  )
}

describe('App', () => {
  const listId = chance.guid()
  const listName = chance.sentence({ words: 2 }).replace(/\.$/, '')
  const pickItemName = chance.word()
  const otherListId = chance.guid()
  const otherListItemName = chance.word()

  const homeList = mockList({ id: listId, name: listName })
  const listWithPickItem = mockListWithItems({
    id: listId,
    name: listName,
    type: 'pick',
    items: [{ id: chance.guid(), name: pickItemName }],
  })
  const listWithOtherItem = mockListWithItems({
    id: otherListId,
    type: 'pick',
    items: [{ id: chance.guid(), name: otherListItemName }],
  })

  beforeEach(() => {
    mockUseLists.mockReturnValue({
      data: [homeList],
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useLists>)

    mockUseList.mockImplementation((id) => {
      const data =
        id === listId ? listWithPickItem : id === otherListId ? listWithOtherItem : null
      return {
        data,
        isLoading: false,
        isError: false,
        error: null,
      } as ReturnType<typeof useList>
    })
  })

  it('Renders the home page at /.', async () => {
    const { getByRole, findByRole } = renderApp('/')
    expect(getByRole('heading', { name: /mix up/i })).toBeInTheDocument()
    expect(await findByRole('link', { name: listName })).toBeInTheDocument()
  })

  it('Renders the list page at /list/:listId.', async () => {
    const { findByText } = renderApp(`/list/${otherListId}`)
    expect(await findByText(otherListItemName)).toBeInTheDocument()
  })

  it('Navigates to list page when clicking a list link.', async () => {
    const user = userEvent.setup()
    const { findByRole, findByText } = renderApp('/')
    const link = await findByRole('link', { name: listName })
    await user.click(link)
    expect(await findByText(pickItemName)).toBeInTheDocument()
  })
})
