import { render } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { getCurrentUser } from 'aws-amplify/auth'
import { CHECKING_SESSION_MESSAGE } from '../constants/messages'
import { LOGIN_PATH } from '../constants/paths'
import { createAllWrappers } from '../testing/wrappers'
import { ProtectedRoute } from './ProtectedRoute'

jest.mock('aws-amplify/auth', () => ({
  getCurrentUser: jest.fn(),
  signIn: jest.fn(),
}))

describe('Protected Route', () => {
  it('Shows a loading state while auth is loading.', async () => {
    jest
      .mocked(getCurrentUser)
      .mockImplementation(() => new Promise(() => {}))

    const { findByText, queryByText } = render(
      <Routes>
        <Route
          path={'/'}
          element={
            <ProtectedRoute>
              <div>Secret</div>
            </ProtectedRoute>
          }
        />
      </Routes>,
      { wrapper: createAllWrappers({ initialEntries: ['/'] }) },
    )

    expect(await findByText(CHECKING_SESSION_MESSAGE)).toBeInTheDocument()
    expect(queryByText('Secret')).not.toBeInTheDocument()
  })

  it('Redirects to login when there is no session.', async () => {
    jest.mocked(getCurrentUser).mockRejectedValue(new Error('no session'))

    const { findByText } = render(
      <Routes>
        <Route path={LOGIN_PATH} element={<div>Login page</div>} />
        <Route
          path={'/'}
          element={
            <ProtectedRoute>
              <div>Secret</div>
            </ProtectedRoute>
          }
        />
      </Routes>,
      { wrapper: createAllWrappers({ initialEntries: ['/'] }) },
    )

    expect(await findByText('Login page')).toBeInTheDocument()
  })

  it('Shows children when the user is signed in.', async () => {
    jest.mocked(getCurrentUser).mockResolvedValue({
      username: 'user',
      userId: 'id-1',
    })

    const { findByText } = render(
      <Routes>
        <Route
          path={'/'}
          element={
            <ProtectedRoute>
              <div>Secret</div>
            </ProtectedRoute>
          }
        />
      </Routes>,
      { wrapper: createAllWrappers({ initialEntries: ['/'] }) },
    )

    expect(await findByText('Secret')).toBeInTheDocument()
  })
})
