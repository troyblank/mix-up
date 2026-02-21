import type { FunctionComponent } from 'react'
import { Routes, Route } from 'react-router-dom'
import { HomePage, ListPage } from './pages'

export const Router: FunctionComponent = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/list/:listId" element={<ListPage />} />
    </Routes>
  )
}
