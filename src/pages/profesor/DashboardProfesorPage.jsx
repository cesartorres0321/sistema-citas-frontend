import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { es } from 'date-fns/locale'
import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'
import { useAuthStore } from '@/store/authStore'
import { getCalendarioProfesorApi, getEstadisticasProfesorApi } from '@/api/profesores.api'
import { completarCitaApi, cancelarCitaApi } from '@/api/citas.api'
import {
  getDisponibilidadApi,
  createDisponibilidadApi,
  deleteDisponibilidadApi,
  getBloqueoApi,
  createBloqueoApi,
  deleteBloqueoApi,
} from '@/api/disponibilidad.api'

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { es },
})

const estadoColor = {
  agendada: '#2563EB',
  completada: '#22C55E',
  cancelada: '#EF4444',
}

// ----- Icons -----
const GraduationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
  </svg>
)

const TabIcon = ({ type, active }) => {
  const color = active ? '#F05A14' : '#6B7280'
  if (type === 'citas') return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={color} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  )
  if (type === 'calendario') return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={color} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  )
  if (type === 'disponibilidad') return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={color} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
    </svg>
  )
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={color} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
    </svg>
  )
}

const DIAS_SEMANA = [
  { label: 'Lunes',     value: 1 },
  { label: 'Martes',    value: 2 },
  { label: 'Miércoles', value: 3 },
  { label: 'Jueves',    value: 4 },
  { label: 'Viernes',   value: 5 },
  { label: 'Sábado',    value: 6 },
  { label: 'Domingo',   value: 0 },
]
const DIA_LABEL = Object.fromEntries(DIAS_SEMANA.map((d) => [d.value, d.label]))

// ----- Tab button helper -----
const Tab = ({ id, label, active, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className="flex items-center gap-1.5 py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap"
    style={{
      borderColor: active ? '#F05A14' : 'transparent',
      color: active ? '#F05A14' : '#6B7280',
    }}
  >
    <TabIcon type={id} active={active} />
    {label}
  </button>
)

export default function DashboardProfesorPage() {
  const user = useAuthStore((s) => s.user)
  const [tab, setTab] = useState('citas')
  const [citas, setCitas] = useState([])
  const [stats, setStats] = useState(null)
  const [calDate, setCalDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // — Disponibilidad state —
  const [disponibilidad, setDisponibilidad] = useState([])
  const [bloqueos, setBloqueos] = useState([])
  const [dispLoading, setDispLoading] = useState(false)
  const [dispError, setDispError] = useState('')
  const { register: regDisp, handleSubmit: handleDisp, reset: resetDisp } = useForm()
  const { register: regBloqueo, handleSubmit: handleBloqueo, reset: resetBloqueo } = useForm()

  const fetchCitas = useCallback(async (date = calDate) => {
    if (!user?.id) return
    setLoading(true)
    try {
      const mes = date.getMonth() + 1
      const anio = date.getFullYear()
      const { data } = await getCalendarioProfesorApi(user.id, { mes, anio })
      setCitas(data.data || [])
    } catch {
      setError('No se pudieron cargar las citas')
    } finally {
      setLoading(false)
    }
  }, [user?.id, calDate])

  const fetchStats = useCallback(async () => {
    if (!user?.id) return
    try {
      const { data } = await getEstadisticasProfesorApi(user.id)
      setStats(data.data)
    } catch {}
  }, [user?.id])

  const fetchDisponibilidad = useCallback(async () => {
    if (!user?.id) return
    setDispLoading(true)
    try {
      const [dispRes, bloqueoRes] = await Promise.all([
        getDisponibilidadApi(user.id),
        getBloqueoApi(user.id),
      ])
      setDisponibilidad(dispRes.data.data || [])
      setBloqueos(bloqueoRes.data.data || [])
    } catch {
      setDispError('No se pudo cargar la disponibilidad')
    } finally {
      setDispLoading(false)
    }
  }, [user?.id])

  useEffect(() => { fetchCitas(); fetchStats() }, [fetchCitas, fetchStats])

  useEffect(() => {
    if (tab === 'disponibilidad') fetchDisponibilidad()
  }, [tab, fetchDisponibilidad])

  const onAddDisponibilidad = async (values) => {
    setDispError('')
    try {
      await createDisponibilidadApi({ ...values, diaSemana: parseInt(values.diaSemana) })
      resetDisp()
      fetchDisponibilidad()
    } catch (e) {
      setDispError(e.response?.data?.error || 'Error al agregar disponibilidad')
    }
  }

  const onDeleteDisponibilidad = async (id) => {
    try { await deleteDisponibilidadApi(id); fetchDisponibilidad() }
    catch { setDispError('No se pudo eliminar') }
  }

  const onAddBloqueo = async (values) => {
    setDispError('')
    try {
      await createBloqueoApi(values)
      resetBloqueo()
      fetchDisponibilidad()
    } catch (e) {
      setDispError(e.response?.data?.error || 'Error al agregar bloqueo')
    }
  }

  const onDeleteBloqueo = async (id) => {
    try { await deleteBloqueoApi(id); fetchDisponibilidad() }
    catch { setDispError('No se pudo eliminar') }
  }

  const [citaModal, setCitaModal] = useState(null)

  const handleCompletar = async (id) => {
    try { await completarCitaApi(id); setCitaModal(null); fetchCitas() } catch { setError('No se pudo completar') }
  }

  const handleCancelar = async (id) => {
    if (!confirm('¿Cancelar esta cita?')) return
    try { await cancelarCitaApi(id); setCitaModal(null); fetchCitas() } catch { setError('No se pudo cancelar') }
  }

  const confirmadas = citas.filter((c) => c.estado === 'agendada')
  const historial = citas.filter((c) => c.estado === 'completada' || c.estado === 'cancelada')

  const eventos = citas.map((c) => ({
    id: c.id,
    title: `${c.alumno?.nombre || '?'} — ${c.motivo || ''}`,
    start: new Date(`${c.fecha.split('T')[0]}T${c.horaInicio}`),
    end: new Date(`${c.fecha.split('T')[0]}T${c.horaFin}`),
    resource: c,
  }))

  return (
    <Layout backLabel="Panel de Docente">
      <PageHeader icon={<GraduationIcon />} title="Panel de Docente" subtitle="Gestiona tus citas y genera reportes de actividades" />

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 overflow-x-auto">
        <div className="max-w-2xl mx-auto px-4 flex gap-6 min-w-max">
          <Tab id="citas" label="Atender Citas" active={tab === 'citas'} onClick={setTab} />
          <Tab id="calendario" label="Calendario" active={tab === 'calendario'} onClick={setTab} />
          <Tab id="disponibilidad" label="Disponibilidad" active={tab === 'disponibilidad'} onClick={setTab} />
          <Tab id="reportes" label="Mis Reportes" active={tab === 'reportes'} onClick={setTab} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 pb-10 w-full">
        <ErrorMessage message={error} />

        {loading ? <LoadingSpinner /> : (
          <>
            {tab === 'citas' && (
              <>
                <section className="mb-6">
                  <h2 className="text-base font-bold text-gray-900 mb-3">Citas Confirmadas ({confirmadas.length})</h2>
                  {confirmadas.length === 0
                    ? <p className="text-sm text-gray-400">No hay citas pendientes</p>
                    : <div className="space-y-3">{confirmadas.map((c) => <CitaCard key={c.id} cita={c} onCompletar={handleCompletar} onCancelar={handleCancelar} />)}</div>
                  }
                </section>
                <section>
                  <h2 className="text-base font-bold text-gray-900 mb-3">Historial de Citas Completadas</h2>
                  {historial.length === 0
                    ? <p className="text-sm text-gray-400 text-center py-4">No hay citas completadas</p>
                    : <div className="space-y-3">{historial.map((c) => <CitaCard key={c.id} cita={c} />)}</div>
                  }
                </section>
              </>
            )}

            {tab === 'calendario' && (
              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                <Calendar
                  localizer={localizer}
                  events={eventos}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: 520 }}
                  culture="es"
                  date={calDate}
                  onNavigate={(date) => { setCalDate(date); fetchCitas(date) }}
                  onSelectEvent={(event) => setCitaModal(event.resource)}
                  messages={{ next: 'Sig.', previous: 'Ant.', today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Día', noEventsInRange: 'Sin citas' }}
                  eventPropGetter={(event) => ({
                    style: {
                      backgroundColor: estadoColor[event.resource?.estado] || '#F05A14',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                    },
                  })}
                />
                <div className="flex gap-4 mt-3 text-xs text-gray-500">
                  {[['Agendada', '#2563EB'], ['Completada', '#22C55E'], ['Cancelada', '#EF4444']].map(([label, color]) => (
                    <span key={label} className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: color }} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {tab === 'disponibilidad' && (
              <DisponibilidadTab
                disponibilidad={disponibilidad}
                bloqueos={bloqueos}
                loading={dispLoading}
                error={dispError}
                regDisp={regDisp}
                handleDisp={handleDisp}
                onAddDisponibilidad={onAddDisponibilidad}
                onDeleteDisponibilidad={onDeleteDisponibilidad}
                regBloqueo={regBloqueo}
                handleBloqueo={handleBloqueo}
                onAddBloqueo={onAddBloqueo}
                onDeleteBloqueo={onDeleteBloqueo}
              />
            )}

            {tab === 'reportes' && <ReportesTab stats={stats} />}
          </>
        )}
      </div>
      {citaModal && (
        <CitaModal
          cita={citaModal}
          onClose={() => setCitaModal(null)}
          onCompletar={handleCompletar}
          onCancelar={handleCancelar}
        />
      )}
    </Layout>
  )
}

const ESTADO_STYLE = {
  agendada:   { bg: '#EFF6FF', color: '#2563EB', label: 'Agendada' },
  completada: { bg: '#F0FDF4', color: '#16A34A', label: 'Completada' },
  cancelada:  { bg: '#FEF2F2', color: '#DC2626', label: 'Cancelada' },
}

function CitaModal({ cita, onClose, onCompletar, onCancelar }) {
  const fecha = cita.fecha.split('T')[0].split('-').reverse().join('/')
  const est = ESTADO_STYLE[cita.estado] || ESTADO_STYLE.agendada
  const isPendiente = cita.estado === 'agendada'

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl w-full max-w-sm shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header coloreado según estado */}
        <div className="py-5 px-6 text-center text-white" style={{ backgroundColor: est.color }}>
          <span className="text-xs font-semibold uppercase tracking-widest opacity-80">{est.label}</span>
          <h2 className="text-lg font-bold mt-0.5">{cita.alumno?.nombre || '—'}</h2>
        </div>

        <div className="p-6 space-y-3">
          <Row label="Fecha" value={`${fecha} · ${cita.horaInicio} – ${cita.horaFin}`} />
          <Row label="Alumno" value={cita.alumno?.nombre || '—'} />
          <Row label="Email" value={cita.alumno?.email || '—'} />
          <Row label="Motivo" value={cita.motivo} />

          {isPendiente && (
            <div className="flex gap-3 pt-3">
              <button
                onClick={() => onCancelar(cita.id)}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-50"
              >
                Cancelar cita
              </button>
              <button
                onClick={() => onCompletar(cita.id)}
                className="flex-1 text-white py-2.5 rounded-full text-sm font-semibold"
                style={{ backgroundColor: '#2563EB' }}
              >
                Completar
              </button>
            </div>
          )}

          {!isPendiente && (
            <button
              onClick={onClose}
              className="w-full border border-gray-300 text-gray-700 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-50 mt-2"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const Row = ({ label, value }) => (
  <div className="flex justify-between gap-4 text-sm">
    <span className="text-gray-400 shrink-0">{label}</span>
    <span className="text-gray-900 font-medium text-right">{value}</span>
  </div>
)

function CitaCard({ cita, onCompletar, onCancelar }) {
  const fecha = cita.fecha.split('T')[0].split('-').reverse().join('/')
  const isPendiente = cita.estado === 'agendada'

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-start justify-between gap-4">
      <div>
        <p className="font-bold text-gray-900">{cita.alumno?.nombre || '—'}</p>
        <p className="text-sm text-gray-600">ID: {cita.alumnoId}</p>
        <p className="text-sm text-gray-600">Horario: {fecha} {cita.horaInicio}</p>
        <p className="text-sm text-gray-600">Motivo: {cita.motivo}</p>
      </div>
      {isPendiente && (onCompletar || onCancelar) ? (
        <div className="flex flex-col gap-2 shrink-0">
          {onCompletar && (
            <button onClick={() => onCompletar(cita.id)} className="text-xs px-4 py-1.5 rounded-full text-white font-medium" style={{ backgroundColor: '#2563EB' }}>
              Completar
            </button>
          )}
          {onCancelar && (
            <button onClick={() => onCancelar(cita.id)} className="text-xs px-4 py-1.5 rounded-full text-white font-medium" style={{ backgroundColor: '#EF4444' }}>
              Cancelar Cita
            </button>
          )}
        </div>
      ) : (
        <span className={`text-xs px-3 py-1 rounded-full font-medium shrink-0 ${
          cita.estado === 'completada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
        }`}>
          {cita.estado === 'completada' ? 'Completada' : 'Cancelada'}
        </span>
      )}
    </div>
  )
}

function DisponibilidadTab({
  disponibilidad, bloqueos, loading, error,
  regDisp, handleDisp, onAddDisponibilidad, onDeleteDisponibilidad,
  regBloqueo, handleBloqueo, onAddBloqueo, onDeleteBloqueo,
}) {
  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-8">
      {error && <ErrorMessage message={error} />}

      {/* Horarios semanales */}
      <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 mb-4">Horarios Semanales</h2>

        <form onSubmit={handleDisp(onAddDisponibilidad)} className="flex flex-wrap gap-2 mb-4">
          <select
            {...regDisp('diaSemana', { required: true })}
            className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none"
          >
            {DIAS_SEMANA.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
          <input
            type="time"
            {...regDisp('horaInicio', { required: true })}
            className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none"
          />
          <span className="flex items-center text-sm text-gray-400">a</span>
          <input
            type="time"
            {...regDisp('horaFin', { required: true })}
            className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none"
          />
          <button
            type="submit"
            className="text-white text-sm px-4 py-2 rounded-full font-medium"
            style={{ backgroundColor: '#F05A14' }}
          >
            + Agregar
          </button>
        </form>

        {disponibilidad.length === 0 ? (
          <p className="text-sm text-gray-400">Sin horarios registrados</p>
        ) : (
          <div className="space-y-2">
            {disponibilidad.map((d) => (
              <div key={d.id} className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-2.5 text-sm bg-gray-50">
                <span className="font-medium text-gray-700">
                  {DIA_LABEL[d.diaSemana] ?? '?'}
                  <span className="font-normal text-gray-500"> · {d.horaInicio} – {d.horaFin}</span>
                </span>
                <button
                  onClick={() => onDeleteDisponibilidad(d.id)}
                  className="text-red-400 hover:text-red-600 text-xs font-medium"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Bloqueos de días */}
      <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 mb-4">Días Bloqueados</h2>

        <form onSubmit={handleBloqueo(onAddBloqueo)} className="flex flex-wrap gap-2 mb-4">
          <input
            type="date"
            {...regBloqueo('fecha', { required: true })}
            className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none"
          />
          <input
            type="text"
            {...regBloqueo('motivo')}
            placeholder="Motivo (opcional)"
            className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none flex-1 min-w-0"
          />
          <button
            type="submit"
            className="text-white text-sm px-4 py-2 rounded-full font-medium"
            style={{ backgroundColor: '#EF4444' }}
          >
            + Bloquear día
          </button>
        </form>

        {bloqueos.length === 0 ? (
          <p className="text-sm text-gray-400">Sin bloqueos registrados</p>
        ) : (
          <div className="space-y-2">
            {bloqueos.map((b) => (
              <div key={b.id} className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-2.5 text-sm bg-gray-50">
                <span className="font-medium text-gray-700">
                  {b.fecha?.split('T')[0]}
                  {b.motivo && <span className="font-normal text-gray-500"> · {b.motivo}</span>}
                </span>
                <button
                  onClick={() => onDeleteBloqueo(b.id)}
                  className="text-red-400 hover:text-red-600 text-xs font-medium"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function ReportesTab({ stats }) {
  if (!stats) return <p className="text-sm text-gray-400">No hay estadísticas disponibles</p>
  const items = [
    { label: 'Total de citas', value: stats.total, color: '#1a1a1a' },
    { label: 'Pendientes', value: stats.pendientes, color: '#F05A14' },
    { label: 'Completadas', value: stats.completadas, color: '#22C55E' },
    { label: 'Canceladas', value: stats.canceladas, color: '#EF4444' },
  ]
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">{item.label}</p>
          <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
        </div>
      ))}
    </div>
  )
}
