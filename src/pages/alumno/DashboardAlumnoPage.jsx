import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'
import ReprogramarModal from '@/components/ReprogramarModal'
import { getCitasApi, cancelarCitaApi } from '@/api/citas.api'
import { es } from 'date-fns/locale'

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
  </svg>
)

const estadoBadge = {
  pendiente: 'bg-pink-100 text-pink-700',
  completada: 'bg-green-100 text-green-700',
  cancelada: 'bg-red-100 text-red-600',
  agendada: 'bg-blue-100 text-blue-700',
}

const estadoLabel = {
  pendiente: 'Pendiente',
  completada: 'Completada',
  cancelada: 'Cancelada',
  agendada: 'Confirmada',
}

export default function DashboardAlumnoPage() {
  const [citas, setCitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [citaAReprogramar, setCitaAReprogramar] = useState(null)
  const navigate = useNavigate()

  const fetchCitas = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await getCitasApi()
      setCitas(data.data || [])
    } catch {
      setError('No se pudieron cargar tus citas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCitas() }, [fetchCitas])

  const handleCancelar = async (id) => {
    if (!confirm('¿Cancelar esta cita?')) return
    try {
      await cancelarCitaApi(id)
      fetchCitas()
    } catch {
      setError('No se pudo cancelar la cita')
    }
  }

  const activas = citas.filter((c) => c.estado === 'agendada' || c.estado === 'pendiente')
  const historial = citas.filter((c) => c.estado === 'completada' || c.estado === 'cancelada')

  return (
    <Layout backLabel="Mis Citas">
      <PageHeader
        icon={<CalendarIcon />}
        title="Mis Citas"
        subtitle="Gestiona y consulta tus citas agendadas"
      />

      <div className="max-w-lg mx-auto px-4 pt-6 pb-10">
        <button
          onClick={() => navigate('/alumno/profesores')}
          className="w-full text-white py-3 rounded-full text-sm font-semibold mb-6 transition-all"
          style={{ backgroundColor: '#2563EB' }}
        >
          + Agendar nueva cita
        </button>

        <ErrorMessage message={error} />

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {activas.length > 0 && (
              <section className="mb-6">
                <h2 className="text-base font-bold text-gray-900 mb-3">
                  Citas Confirmadas ({activas.length})
                </h2>
                <div className="space-y-3">
                  {activas.map((c) => (
                    <CitaCard
                      key={c.id}
                      cita={c}
                      onCancelar={handleCancelar}
                      onReprogramar={setCitaAReprogramar}
                    />
                  ))}
                </div>
              </section>
            )}

            {historial.length > 0 && (
              <section>
                <h2 className="text-base font-bold text-gray-900 mb-3">Historial de Citas</h2>
                <div className="space-y-3">
                  {historial.map((c) => (
                    <CitaCard key={c.id} cita={c} />
                  ))}
                </div>
              </section>
            )}

            {citas.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p>No tienes citas registradas</p>
              </div>
            )}
          </>
        )}
      </div>

      {citaAReprogramar && (
        <ReprogramarModal
          cita={citaAReprogramar}
          onClose={() => setCitaAReprogramar(null)}
          onSuccess={() => { setCitaAReprogramar(null); fetchCitas() }}
        />
      )}
    </Layout>
  )
}

function CitaCard({ cita, onCancelar, onReprogramar }) {
  const fecha = cita.fecha.split('T')[0].split('-').reverse().join('/')
  const estado = cita.estado

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-bold text-gray-900">{cita.profesor?.nombre || '—'}</p>
          <p className="text-sm text-gray-500 mt-0.5">
            ID: {cita.alumnoId}
          </p>
          <p className="text-sm text-gray-600">Horario: {fecha} {cita.horaInicio}</p>
          <p className="text-sm text-gray-600">Motivo: {cita.motivo}</p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${estadoBadge[estado] || 'bg-gray-100 text-gray-600'}`}>
          {estadoLabel[estado] || estado}
        </span>
      </div>

      {(estado === 'agendada' || estado === 'pendiente') && (onCancelar || onReprogramar) && (
        <div className="flex gap-2 mt-3">
          {onReprogramar && (
            <button
              onClick={() => onReprogramar(cita)}
              className="text-xs px-4 py-1.5 rounded-full border font-medium transition-colors"
              style={{ borderColor: '#F05A14', color: '#F05A14' }}
            >
              Reprogramar
            </button>
          )}
          {onCancelar && (
            <button
              onClick={() => onCancelar(cita.id)}
              className="text-xs px-4 py-1.5 rounded-full text-white font-medium transition-colors"
              style={{ backgroundColor: '#EF4444' }}
            >
              Cancelar
            </button>
          )}
        </div>
      )}
    </div>
  )
}
