import type { FunctionComponent, ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Loader } from '../components/Loader'
import { useAuth } from '../contexts'
import { CHECKING_SESSION_MESSAGE } from '../constants/messages'
import { LOGIN_PATH } from '../constants/paths'

export const ProtectedRoute: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => {
  const { authStatus } = useAuth()
  const location = useLocation()

  if (authStatus === 'loading') {
    return <Loader text={CHECKING_SESSION_MESSAGE} />
  }

  if (authStatus === 'unauthenticated') {
    return <Navigate replace state={{ from: location }} to={LOGIN_PATH} />
  }

  return <>{children}</>
}
