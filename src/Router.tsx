import type { FunctionComponent } from 'react'
import { Routes, Route } from 'react-router-dom'
import { HomePage, ListPage, ProtectedRoute, SignInPage } from './pages'

export const Router: FunctionComponent = () => {
  return (
    <Routes>
      <Route
        path={'/'}
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route path={'/login'} element={<SignInPage />} />
      <Route
        path={'/list/:listId'}
        element={
          <ProtectedRoute>
            <ListPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
