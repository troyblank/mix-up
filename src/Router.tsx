import type { FunctionComponent } from 'react'
import { Routes, Route } from 'react-router-dom'
import { HomePage, ListPage, SignInPage } from './pages'

export const Router: FunctionComponent = () => {
  return (
    <Routes>
      <Route path={'/'} element={<HomePage />} />
      <Route path={'/login'} element={<SignInPage />} />
      <Route path={'/list/:listId'} element={<ListPage />} />
    </Routes>
  )
}
