import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type FunctionComponent,
  type ReactNode,
} from 'react'
import {
  getCurrentUser,
  signIn,
  type SignInInput,
  type SignInOutput,
} from 'aws-amplify/auth'
import type { AuthStatus, SignInCredentials, SignInOutput as AppSignInOutput } from '../types/auth'

const USER_COMPLETE_STEP = 'DONE'
const USER_NOT_COMPLETED_STEPS: string[] = [
  'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED',
]
const DEFAULT_ERROR_MESSAGE = 'Something went wrong.'

type AuthContextValue = {
  attemptToSignIn: (credentials: SignInCredentials) => Promise<AppSignInOutput>
  authStatus: AuthStatus
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await getCurrentUser()
        if (!cancelled) setAuthStatus('authenticated')
      } catch {
        if (!cancelled) setAuthStatus('unauthenticated')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const attemptToSignIn = useCallback(
    async ({ username, password }: SignInCredentials): Promise<AppSignInOutput> => {
      if (!username.trim() || !password) {
        return { isUserComplete: false }
      }

      let isUserComplete = false
      let errorMessage = DEFAULT_ERROR_MESSAGE
      let isError: boolean

      try {
        const { isSignedIn, nextStep }: SignInOutput = await signIn({
          username,
          password,
        } satisfies SignInInput)
        const { signInStep } = nextStep
        const isUserRequiredToComplete =
          USER_NOT_COMPLETED_STEPS.includes(signInStep)

        isUserComplete = signInStep === USER_COMPLETE_STEP

        const isStepUnaccountedFor =
          !isUserComplete && !isUserRequiredToComplete

        isError = !isSignedIn && !isUserRequiredToComplete

        if (isStepUnaccountedFor) {
          errorMessage = `UI flow is missing a step: ${signInStep}. This is not your fault; please contact support.`
        }
      } catch (error) {
        isError = true
        errorMessage = String(error)
      }

      if (isError) {
        throw new Error(errorMessage)
      }

      if (isUserComplete) {
        setAuthStatus('authenticated')
      }

      return { isUserComplete }
    },
    [],
  )

  const value = useMemo(
    () => ({
      attemptToSignIn,
      authStatus,
    }),
    [attemptToSignIn, authStatus],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
