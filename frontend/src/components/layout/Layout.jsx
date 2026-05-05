import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import ErrorBoundary from '../ui/ErrorBoundary'

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-16">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  )
}
