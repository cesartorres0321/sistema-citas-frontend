import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'
import { getProfesoresApi } from '@/api/profesores.api'
import { getAlumnosApi } from '@/api/alumnos.api'
import { getCitasApi, cancelarCitaApi, completarCitaApi } from '@/api/citas.api'

const AdminIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
)

const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-500">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
  </svg>
)

const estadoBadge = {
  agendada: 'bg-blue-100 text-blue-700',
  pendiente: 'bg-pink-100 text-pink-700',
  completada: 'bg-green-100 text-green-700',
  cancelada: 'bg-red-100 text-red-600',
}

const estadoLabel = {
  agendada: 'Confirmada',
  pendiente: 'Pendiente',
  completada: 'Completada',
  cancelada: 'Cancelada',
}

export default function DashboardAdminPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('citas')
  const [citas, setCitas] = useState([])
  const [filtro, setFiltro] = useState('todas')
  const [totales, setTotales] = useState({ profesores: '—', alumnos: '—' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchCitas = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getCitasApi({ limit: 100 })
      setCitas(data.data || [])
    } catch {
      setError('No se pudieron cargar las citas')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchTotales = useCallback(async () => {
    try {
      const [profRes, alumRes] = await Promise.all([
        getProfesoresApi({ limit: 1 }),
        getAlumnosApi({ limit: 1 }),
      ])
      setTotales({
        profesores: profRes.data.meta?.total ?? '—',
        alumnos: alumRes.data.meta?.total ?? '—',
      })
    } catch {}
  }, [])

  useEffect(() => { fetchCitas(); fetchTotales() }, [fetchCitas, fetchTotales])

  const handleAprobar = async (id) => {
    try {
      await completarCitaApi(id)
      fetchCitas()
    } catch {
      setError('No se pudo aprobar la cita')
    }
  }

  const handleNegar = async (id) => {
    if (!confirm('¿Cancelar esta cita?')) return
    try {
      await cancelarCitaApi(id)
      fetchCitas()
    } catch {
      setError('No se pudo cancelar la cita')
    }
  }

  const citasFiltradas = citas.filter((c) => {
    if (filtro === 'todas') return true
    if (filtro === 'pendiente') return c.estado === 'pendiente' || c.estado === 'agendada'
    return c.estado === filtro
  })

  return (
    <Layout backLabel="Panel Administrativo">
      <PageHeader
        icon={<AdminIcon />}
        title="Panel Administrativo"
        subtitle="Gestiona citas, registra accesos y consulta reportes"
      />

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 flex gap-8">
          <button
            onClick={() => setTab('citas')}
            className="py-4 text-sm font-semibold border-b-2 transition-colors"
            style={{
              borderColor: tab === 'citas' ? '#F05A14' : 'transparent',
              color: tab === 'citas' ? '#F05A14' : '#6B7280',
            }}
          >
            Validar Citas
          </button>
          <button
            onClick={() => setTab('reportes')}
            className="py-4 text-sm font-semibold border-b-2 transition-colors"
            style={{
              borderColor: tab === 'reportes' ? '#F05A14' : 'transparent',
              color: tab === 'reportes' ? '#F05A14' : '#6B7280',
            }}
          >
            Consultar Reportes
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 pb-10">
        <ErrorMessage message={error} />

        {tab === 'citas' ? (
          <>
            {/* Filtro */}
            <div className="flex items-center gap-3 mb-5">
              <FilterIcon />
              <div className="relative">
                <select
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="border border-gray-300 rounded-full px-4 py-1.5 text-sm appearance-none pr-8 bg-white focus:outline-none"
                >
                  <option value="todas">Todas las citas</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="completada">Completadas</option>
                  <option value="cancelada">Canceladas</option>
                </select>
              </div>
              <span className="text-sm text-gray-500">Mostrando {citasFiltradas.length} cita(s)</span>
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className="space-y-4">
                {citasFiltradas.length === 0 && (
                  <p className="text-center text-gray-400 py-8">No hay citas para mostrar</p>
                )}
                {citasFiltradas.map((c) => (
                  <CitaAdminCard
                    key={c.id}
                    cita={c}
                    onAprobar={handleAprobar}
                    onNegar={handleNegar}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <ReportesAdmin totales={totales} navigate={navigate} />
        )}
      </div>
    </Layout>
  )
}

function CitaAdminCard({ cita, onAprobar, onNegar }) {
  const fecha = cita.fecha.split('T')[0].split('-').reverse().join('/')
  const isPendiente = cita.estado === 'agendada' || cita.estado === 'pendiente'

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="font-bold text-gray-900">{cita.alumno?.nombre || '—'}</p>
            <span className={`text-xs px-3 py-0.5 rounded-full font-semibold ${estadoBadge[cita.estado] || 'bg-gray-100 text-gray-600'}`}>
              {estadoLabel[cita.estado] || cita.estado}
            </span>
          </div>
          <p className="text-sm text-gray-600">ID: {cita.alumnoId}</p>
          <p className="text-sm text-gray-600">Horario: {fecha} {cita.horaInicio}</p>
          {cita.alumno?.matricula && <p className="text-sm text-gray-600">Matrícula: {cita.alumno.matricula}</p>}
          <p className="text-sm text-gray-600">Motivo: {cita.motivo}</p>
          <p className="text-sm text-gray-500">Docente: {cita.profesor?.nombre || '—'}</p>
        </div>
      </div>

      {isPendiente && (
        <div className="flex gap-3 mt-3">
          <button
            onClick={() => onAprobar(cita.id)}
            className="text-sm px-5 py-2 rounded-full text-white font-semibold"
            style={{ backgroundColor: '#2563EB' }}
          >
            Aprobar
          </button>
          <button
            onClick={() => onNegar(cita.id)}
            className="text-sm px-5 py-2 rounded-full text-white font-semibold"
            style={{ backgroundColor: '#EF4444' }}
          >
            Negar
          </button>
        </div>
      )}
    </div>
  )
}

function ReportesAdmin({ totales, navigate }) {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-bold text-gray-900">Resumen del Sistema</h2>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/admin/profesores')}
          className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm text-left hover:shadow-md transition-shadow"
        >
          <p className="text-sm text-gray-500">Profesores registrados</p>
          <p className="text-3xl font-bold mt-1" style={{ color: '#F05A14' }}>{totales.profesores}</p>
          <p className="text-xs mt-2" style={{ color: '#F05A14' }}>Gestionar →</p>
        </button>
        <button
          onClick={() => navigate('/admin/alumnos')}
          className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm text-left hover:shadow-md transition-shadow"
        >
          <p className="text-sm text-gray-500">Alumnos registrados</p>
          <p className="text-3xl font-bold mt-1 text-emerald-600">{totales.alumnos}</p>
          <p className="text-xs mt-2 text-emerald-600">Gestionar →</p>
        </button>
      </div>
      <div className="flex gap-3 mt-2">
        <button
          onClick={() => navigate('/admin/profesores')}
          className="flex-1 text-white py-3 rounded-full text-sm font-semibold"
          style={{ backgroundColor: '#F05A14' }}
        >
          Gestionar Profesores
        </button>
        <button
          onClick={() => navigate('/admin/alumnos')}
          className="flex-1 text-white py-3 rounded-full text-sm font-semibold bg-emerald-600"
        >
          Gestionar Alumnos
        </button>
      </div>
    </div>
  )
}
