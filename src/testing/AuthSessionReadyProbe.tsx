import type { FunctionComponent } from 'react'
import { useAuth } from '../contexts'

export const AuthSessionReadyProbe: FunctionComponent = () => {
  const { authStatus } = useAuth()
  if (authStatus === 'loading') {
    return null
  }
  return <span data-testid={'auth-ready'} hidden />
}
