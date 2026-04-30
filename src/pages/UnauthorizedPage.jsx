import { Link } from 'react-router-dom'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-5xl font-bold text-gray-300 mb-4">403</p>
        <p className="text-gray-600 mb-4">No tienes permiso para ver esta página</p>
        <Link to="/login" className="text-indigo-600 hover:underline text-sm">
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
