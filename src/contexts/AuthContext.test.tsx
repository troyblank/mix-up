import Chance from 'chance'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState, type FunctionComponent } from 'react'
import { createAllWrappers } from '../testing/wrappers'
import { useAuth } from './AuthContext'

const chance = new Chance()

const BadConsumer: FunctionComponent = () => {
  useAuth()
  return null
}

type AuthProbeProps = {
  validUsername: string
  validPassword: string
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
      <AuthProbe
        validUsername={validUsername}
        validPassword={validPassword}
      />,
      { wrapper: createAllWrappers() },
    )

    await user.click(getByRole('button', { name: 'empty' }))

    expect(await findByTestId('result')).toHaveTextContent('false')
  })

  it('Returns isUserComplete true from the default stub when credentials are present.', async () => {
    const user = userEvent.setup()
    const validUsername = chance.name()
    const validPassword = chance.word()
    const { findByTestId, getByRole } = render(
      <AuthProbe
        validUsername={validUsername}
        validPassword={validPassword}
      />,
      { wrapper: createAllWrappers() },
    )

    await user.click(getByRole('button', { name: 'ok' }))

    expect(await findByTestId('result')).toHaveTextContent('true')
  })
})
