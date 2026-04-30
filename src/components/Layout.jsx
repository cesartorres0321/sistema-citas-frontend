import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

const ROLE_COLOR = { alumno: '#2563EB', profesor: '#F05A14', admin: '#7C3AED' }

export default function Layout({ children, backLabel = 'Volver al Inicio', backTo }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const homeRoute = user?.role === 'admin' ? '/admin' : user?.role === 'profesor' ? '/profesor' : '/alumno'
  const destination = backTo || homeRoute
  const perfilRoute = user?.role === 'admin' ? null : `/${user?.role}/perfil`
  const roleColor = ROLE_COLOR[user?.role] || '#6B7280'
  const iniciales = (user?.nombre || '?').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <button
          onClick={() => navigate(destination)}
          className="text-sm font-medium flex items-center gap-1"
          style={{ color: '#F05A14' }}
        >
          ← {backLabel}
        </button>

        <div className="flex items-center gap-3">
          {perfilRoute && (
            <button
              onClick={() => navigate(perfilRoute)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              title="Ver perfil"
            >
              {user?.foto ? (
                <img
                  src={user.foto}
                  alt="Perfil"
                  className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm"
                  style={{ backgroundColor: roleColor }}
                >
                  {iniciales}
                </div>
              )}
              <span className="text-xs text-gray-600 hidden sm:block">{user?.nombre?.split(' ')[0]}</span>
            </button>
          )}
          <button
            onClick={handleLogout}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}
