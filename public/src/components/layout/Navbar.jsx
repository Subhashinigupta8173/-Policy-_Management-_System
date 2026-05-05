import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Shield, Menu, X, LogOut, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const customerLinks = [
  { to: '/products',   label: 'Products' },
  { to: '/calculator', label: 'Calculator' },
  { to: '/dashboard',  label: 'Dashboard' },
  { to: '/claims',     label: 'My Claims' },
]

const underwriterLinks = [
  { to: '/admin',          label: 'Overview' },
  { to: '/admin/policies', label: 'Policies' },
  { to: '/admin/products', label: 'Products' },
]

const adjusterLinks = [
  { to: '/admin',        label: 'Overview' },
  { to: '/admin/claims', label: 'Claims' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const links = user?.role === 'CUSTOMER'
    ? customerLinks
    : user?.role === 'ADJUSTER'
      ? adjusterLinks
      : underwriterLinks

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'bg-brand-900 text-white' : 'text-blue-100 hover:bg-brand-600 hover:text-white'
    }`

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-brand-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-white" />
            <span className="text-white font-bold text-xl">InsureEase</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass} end={l.to === '/admin'}>
                {l.label}
              </NavLink>
            ))}
          </div>

          {/* User + Logout */}
          <div className="hidden md:flex items-center gap-3">
            <span className="text-blue-100 text-sm flex items-center gap-1">
              <User className="h-4 w-4" />
              {user?.name ?? user?.sub}
              <span className="ml-1 text-xs bg-brand-900 px-2 py-0.5 rounded-full">{user?.role}</span>
            </span>
            <button onClick={handleLogout} className="flex items-center gap-1 text-blue-100 hover:text-white text-sm transition-colors">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-brand-800 px-4 pb-4 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-brand-900 text-white' : 'text-blue-100 hover:bg-brand-700 hover:text-white'
                }`
              }
              end={l.to === '/admin'}
            >
              {l.label}
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-blue-100 hover:text-white text-sm"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  )
}
