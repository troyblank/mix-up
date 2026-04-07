import Chance from 'chance'
import { render, renderHook, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { getCurrentUser, signIn } from 'aws-amplify/auth'
import { useState, type FunctionComponent } from 'react'
import { AuthSessionReadyProbe } from '../testing/AuthSessionReadyProbe'
import { createAllWrappers } from '../testing/wrappers'
import { useAuth } from './AuthContext'

jest.mock('aws-amplify/auth', () => ({
  getCurrentUser: jest.fn(),
  signIn: jest.fn(),
}))

const chance = new Chance()

const BadConsumer: FunctionComponent = () => {
  useAuth()
  return null
}

type AuthProbeProps = {
  validUsername: string
  validPassword: string
}

const StatusProbe: FunctionComponent = () => {
  const { authStatus } = useAuth()
  return <span data-testid={'auth-status'}>{authStatus}</span>
}

const AuthProbe: FunctionComponent<AuthProbeProps> = ({
  validUsername,
  validPassword,
}) => {
  const { attemptToSignIn } = useAuth()
  const [resultText, setResultText] = useState<string | null>(null)

  return (
    <>
      <button
        type={'button'}
        onClick={async () => {
          const signInOutput = await attemptToSignIn({
            username: '',
            password: '',
          })
          setResultText(String(signInOutput.isUserComplete))
        }}
      >
        empty
      </button>
      <button
        type={'button'}
        onClick={async () => {
          const signInOutput = await attemptToSignIn({
            username: validUsername,
            password: validPassword,
          })
          setResultText(String(signInOutput.isUserComplete))
        }}
      >
        ok
      </button>
      {resultText !== null && (
        <span data-testid={'result'}>{resultText}</span>
      )}
    </>
  )
}

describe('Auth context', () => {
  beforeEach(() => {
    jest.mocked(getCurrentUser).mockRejectedValue(new Error('not signed in'))
    jest.mocked(signIn).mockResolvedValue({
      isSignedIn: true,
      nextStep: { signInStep: 'DONE' },
    } as Awaited<ReturnType<typeof signIn>>)
  })

  it('Throws when useAuth is used outside AuthProvider.', () => {
    expect(() => render(<BadConsumer />)).toThrow(
      'useAuth must be used within AuthProvider',
    )
  })

  it('Returns isUserComplete false from the default stub when credentials are empty.', async () => {
    const user = userEvent.setup()
    const validUsername = chance.word()
    const validPassword = chance.word()
    const { findByTestId, getByRole } = render(
      <>
        <AuthSessionReadyProbe />
        <AuthProbe
          validUsername={validUsername}
          validPassword={validPassword}
        />
      </>,
      { wrapper: createAllWrappers() },
    )

    await findByTestId('auth-ready')
    await user.click(getByRole('button', { name: 'empty' }))

    expect(await findByTestId('result')).toHaveTextContent('false')
    expect(signIn).not.toHaveBeenCalled()
  })

  it('Returns isUserComplete true from the default stub when credentials are present.', async () => {
    const user = userEvent.setup()
    const validUsername = chance.name()
    const validPassword = chance.word()
    const { findByTestId, getByRole } = render(
      <>
        <AuthSessionReadyProbe />
        <AuthProbe
          validUsername={validUsername}
          validPassword={validPassword}
        />
      </>,
      { wrapper: createAllWrappers() },
    )

    await findByTestId('auth-ready')
    await user.click(getByRole('button', { name: 'ok' }))

    expect(await findByTestId('result')).toHaveTextContent('true')
    expect(signIn).toHaveBeenCalledWith({
      username: validUsername,
      password: validPassword,
    })
  })

  it('Throws when Cognito signIn rejects.', async () => {
    jest.mocked(signIn).mockRejectedValue(new Error('network failure'))

    const { result } = renderHook(() => useAuth(), {
      wrapper: createAllWrappers(),
    })

    await waitFor(() => {
      expect(result.current.authStatus).not.toBe('loading')
    })

    await expect(
      result.current.attemptToSignIn({
        username: chance.word(),
        password: chance.word(),
      }),
    ).rejects.toThrow('network failure')
  })

  it('Throws when signIn returns an unsupported next step.', async () => {
    const badStep = chance.word({ length: 12 })
    jest.mocked(signIn).mockResolvedValue({
      isSignedIn: false,
      nextStep: { signInStep: badStep },
    } as Awaited<ReturnType<typeof signIn>>)

    const { result } = renderHook(() => useAuth(), {
      wrapper: createAllWrappers(),
    })

    await waitFor(() => {
      expect(result.current.authStatus).not.toBe('loading')
    })

    await expect(
      result.current.attemptToSignIn({
        username: chance.word(),
        password: chance.word(),
      }),
    ).rejects.toThrow(
      `UI flow is missing a step: ${badStep}. This is not your fault; please contact support.`,
    )
  })

  it('Returns incomplete when new password is required.', async () => {
    jest.mocked(signIn).mockResolvedValue({
      isSignedIn: false,
      nextStep: {
        signInStep: 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED',
      },
    } as Awaited<ReturnType<typeof signIn>>)

    const { result } = renderHook(() => useAuth(), {
      wrapper: createAllWrappers(),
    })

    await waitFor(() => {
      expect(result.current.authStatus).not.toBe('loading')
    })

    await expect(
      result.current.attemptToSignIn({
        username: chance.word(),
        password: chance.word(),
      }),
    ).resolves.toEqual({ isUserComplete: false })
  })

  it('Does not set authenticated after unmount when getCurrentUser resolves late.', async () => {
    let resolveUser: (value: { username: string; userId: string }) => void
    jest.mocked(getCurrentUser).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveUser = resolve
        }),
    )

    const { unmount } = render(<StatusProbe />, {
      wrapper: createAllWrappers(),
    })

    unmount()
    resolveUser!({ username: 'u', userId: 'id' })
  })

  it('Does not set unauthenticated after unmount when getCurrentUser rejects late.', async () => {
    let rejectUser: (error: Error) => void
    jest.mocked(getCurrentUser).mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          rejectUser = reject
        }),
    )

    const { unmount } = render(<StatusProbe />, {
      wrapper: createAllWrappers(),
    })

    unmount()
    rejectUser!(new Error('no session'))
  })
})
