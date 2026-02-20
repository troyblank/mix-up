import { Routes, Route } from 'react-router-dom'
import { HomePage, ListPage } from './pages'

export function Router() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/list/:listId" element={<ListPage />} />
    </Routes>
  )
}
