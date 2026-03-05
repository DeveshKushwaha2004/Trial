import { useNavigate } from 'react-router-dom'
import { clearAuth, getUser } from '../utils/auth'

export default function Navbar() {
  const navigate = useNavigate()
  const user = getUser()

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🧠</span>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            Cognitive Load Estimator
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-gray-400 text-sm hidden sm:block">
              {user.email}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-400 text-sm font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
