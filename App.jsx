import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/layout/Layout'
import Spinner from './components/ui/Spinner'

// Auth pages
import Login    from './pages/auth/Login'
import Register from './pages/auth/Register'

// Customer pages
import Products   from './pages/customer/Products'
import Calculator from './pages/customer/Calculator'
import Apply      from './pages/customer/Apply'
import Dashboard  from './pages/customer/Dashboard'
import ClaimNew   from './pages/customer/ClaimNew'
import Claims     from './pages/customer/Claims'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminPolicies  from './pages/admin/AdminPolicies'
import AdminClaims    from './pages/admin/AdminClaims'
import AdminProducts  from './pages/admin/AdminProducts'

function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <Spinner fullScreen />
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'CUSTOMER' ? '/dashboard' : '/admin'} replace />
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Customer routes */}
      <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
        <Route element={<Layout />}>
          <Route path="/products"             element={<Products />} />
          <Route path="/calculator"           element={<Calculator />} />
          <Route path="/apply/:productId"     element={<Apply />} />
          <Route path="/dashboard"            element={<Dashboard />} />
          <Route path="/claims/new/:policyId" element={<ClaimNew />} />
          <Route path="/claims"               element={<Claims />} />
        </Route>
      </Route>

      {/* Admin routes */}
      <Route element={<ProtectedRoute allowedRoles={['UNDERWRITER', 'ADJUSTER']} />}>
        <Route element={<Layout />}>
          <Route path="/admin"          element={<AdminDashboard />} />
          <Route path="/admin/policies" element={<AdminPolicies />} />
          <Route path="/admin/claims"   element={<AdminClaims />} />
          <Route path="/admin/products" element={<AdminProducts />} />
        </Route>
      </Route>

      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
          <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
          <p className="text-gray-500 mb-6">Page not found</p>
          <a href="/" className="btn-primary">Go Home</a>
        </div>
      } />
    </Routes>
  )
}
