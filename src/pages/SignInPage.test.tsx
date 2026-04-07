import { render } from '@testing-library/react'
import { getCurrentUser } from 'aws-amplify/auth'
import { AuthSessionReadyProbe } from '../testing/AuthSessionReadyProbe'
import { createAllWrappers } from '../testing/wrappers'
import { SignInPage } from './SignInPage'

jest.mock('aws-amplify/auth', () => ({
  getCurrentUser: jest.fn(),
  signIn: jest.fn(),
}))

describe('SignInPage', () => {
  beforeEach(() => {
    jest
      .mocked(getCurrentUser)
      .mockRejectedValue(new Error('no session'))
  })

  it('Shows the sign-in form.', async () => {
    const { findByTestId, findByText } = render(
      <>
        <AuthSessionReadyProbe />
        <SignInPage />
      </>,
      { wrapper: createAllWrappers() },
    )

    await findByTestId('auth-ready')
    expect(await findByText('Username:')).toBeInTheDocument()
    expect(await findByText('Password:')).toBeInTheDocument()
  })
})
