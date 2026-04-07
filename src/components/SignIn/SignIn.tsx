import {
  useEffect,
  useState,
  type FormEvent,
  type FunctionComponent,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { SignInOutput } from '../../types/auth'
import { useAuth } from '../../contexts'
import { HOME_PATH, LOGIN_PATH } from '../../constants/paths'
import { AlertGraphic, LogoGraphic } from '../graphics'
import {
  AlertError,
  FieldRow,
  ForgotPasswordLink,
  Form,
  FormWrap,
  IconAlertError,
  IconLogo,
  SignInHeader,
  SubmitButton,
  SubmitButtonSpinner,
  SubmitRow,
} from './SignIn.styles'

export const SignIn: FunctionComponent = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { attemptToSignIn, authStatus } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [forgotPasswordRedirect, setForgotPasswordRedirect] = useState('')

  useEffect(() => {
    setForgotPasswordRedirect(window.location.href)
  }, [])

  useEffect(() => {
    if (authStatus === 'authenticated' && location.pathname === LOGIN_PATH) {
      navigate(HOME_PATH, { replace: true })
    }
  }, [authStatus, location.pathname, navigate])

  const onSignIn = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)

    if (!username.trim() || !password) {
      setErrorMessage('Please enter username and password.')
      return
    }

    setIsPending(true)

    attemptToSignIn({ username, password })
      .then(({ isUserComplete }: SignInOutput) => {
        if (!isUserComplete) {
          setErrorMessage('User is invalid.')
        }
      })
      .catch((error: unknown) => {
        setErrorMessage(String(error))
      })
      .finally(() => {
        setIsPending(false)
      })
  }

  return (
    <FormWrap>
      <SignInHeader>
        <IconLogo>
          <LogoGraphic />
        </IconLogo>
      </SignInHeader>
      <Form method={'post'} onSubmit={onSignIn}>
        <FieldRow>
          <label htmlFor={'username'}>Username:</label>
          <input
            id={'username'}
            type={'text'}
            name={'username'}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete={'username'}
          />
        </FieldRow>
        <FieldRow>
          <label htmlFor={'password'}>Password:</label>
          <input
            id={'password'}
            type={'password'}
            name={'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={'current-password'}
          />
        </FieldRow>
        {errorMessage && (
          <AlertError>
            <IconAlertError>
              <AlertGraphic />
            </IconAlertError>
            <strong>{errorMessage}</strong>
          </AlertError>
        )}
        <SubmitRow>
          <SubmitButton
            disabled={isPending}
            aria-busy={isPending}
            aria-label={isPending ? 'Signing in' : undefined}
          >
            {isPending ? (
              <SubmitButtonSpinner aria-hidden={'true'} />
            ) : (
              'Login'
            )}
          </SubmitButton>
        </SubmitRow>
        <ForgotPasswordLink>
          <a
            href={`https://admin.troyblank.com/forgotPassword?redirect=${encodeURIComponent(forgotPasswordRedirect)}`}
          >
            Forgot password?
          </a>
        </ForgotPasswordLink>
      </Form>
    </FormWrap>
  )
}
