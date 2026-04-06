import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type FunctionComponent,
  type ReactNode,
} from 'react'
import type { SignInCredentials, SignInOutput } from '../types/auth'

type AuthContextValue = {
  /** Placeholder until Cognito (or your API) is wired; swap implementation here. */
  attemptToSignIn: (credentials: SignInCredentials) => Promise<SignInOutput>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const defaultAttemptToSignIn = async ({
  username,
  password,
}: SignInCredentials): Promise<SignInOutput> => {
  await new Promise((resolve) => setTimeout(resolve, 200))
  if (!username.trim() || !password) {
    return { isUserComplete: false }
  }
  return { isUserComplete: true }
}

export const AuthProvider: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => {
  const attemptToSignIn = useCallback(
    async (credentials: SignInCredentials) => defaultAttemptToSignIn(credentials),
    [],
  )

  const value = useMemo(
    () => ({
      attemptToSignIn,
    }),
    [attemptToSignIn],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
