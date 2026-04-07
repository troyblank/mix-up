export type SignInCredentials = {
  username: string
  password: string
}

export type SignInOutput = {
  isUserComplete: boolean
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'
