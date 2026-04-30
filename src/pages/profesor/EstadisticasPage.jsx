import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'
import { useAuthStore } from '@/store/authStore'
import { getEstadisticasProfesorApi } from '@/api/profesores.api'

const StatCard = ({ label, value, color }) => (
  <div className={`bg-white rounded-lg border border-gray-200 p-5 shadow-sm`}>
    <p className="text-sm text-gray-500">{label}</p>
    <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
  </div>
)

export default function EstadisticasPage() {
  const user = useAuthStore((s) => s.user)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user?.id) return
    getEstadisticasProfesorApi(user.id)
      .then(({ data }) => setStats(data.data))
      .catch(() => setError('No se pudieron cargar las estadísticas'))
      .finally(() => setLoading(false))
  }, [user?.id])

  return (
    <Layout>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Estadísticas</h1>
      <ErrorMessage message={error} />
      {loading ? (
        <LoadingSpinner />
      ) : stats ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total" value={stats.total ?? 0} color="text-gray-900" />
          <StatCard label="Pendientes" value={stats.pendientes ?? 0} color="text-yellow-600" />
          <StatCard label="Completadas" value={stats.completadas ?? 0} color="text-green-600" />
          <StatCard label="Canceladas" value={stats.canceladas ?? 0} color="text-red-600" />
        </div>
      ) : null}
    </Layout>
  )
}
