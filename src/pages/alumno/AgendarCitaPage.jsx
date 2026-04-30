import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'
import { getProfesorByIdApi, getHorariosDisponiblesApi } from '@/api/profesores.api'
import { createCitaApi } from '@/api/citas.api'
import { useForm } from 'react-hook-form'

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
  </svg>
)

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
)

const inputClass = "w-full border border-gray-300 rounded-2xl px-4 py-3 text-sm focus:outline-none bg-white"

export default function AgendarCitaPage() {
  const { profesorId } = useParams()
  const navigate = useNavigate()

  const [profesor, setProfesor] = useState(null)
  const [horarios, setHorarios] = useState([])
  const [fechaSeleccionada, setFechaSeleccionada] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'))
  const [horarioSeleccionado, setHorarioSeleccionado] = useState(null)
  const [loadingHorarios, setLoadingHorarios] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm()

  useEffect(() => {
    getProfesorByIdApi(profesorId)
      .then(({ data }) => setProfesor(data.data))
      .catch(() => setError('Profesor no encontrado'))
  }, [profesorId])

  useEffect(() => {
    if (!fechaSeleccionada) return
    setLoadingHorarios(true)
    setHorarioSeleccionado(null)
    getHorariosDisponiblesApi(profesorId, fechaSeleccionada)
      .then(({ data }) => setHorarios(data.data || []))
      .catch(() => setHorarios([]))
      .finally(() => setLoadingHorarios(false))
  }, [profesorId, fechaSeleccionada])

  const onSubmit = async ({ motivo }) => {
    if (!horarioSeleccionado) { setError('Selecciona un horario'); return }
    setError('')
    setSubmitting(true)
    try {
      await createCitaApi({
        profesorId: parseInt(profesorId),
        fecha: fechaSeleccionada,
        horaInicio: horarioSeleccionado.horaInicio,
        horaFin: horarioSeleccionado.horaFin,
        motivo,
      })
      navigate('/alumno')
    } catch (e) {
      setError(e.response?.data?.error || 'No se pudo agendar la cita')
    } finally {
      setSubmitting(false)
    }
  }

  const fechaLabel = fechaSeleccionada
    ? format(new Date(fechaSeleccionada + 'T12:00:00'), "EEEE d 'de' MMMM", { locale: es })
    : ''

  return (
    <Layout backLabel="Volver al Inicio" backTo="/alumno/profesores">
      <PageHeader
        icon={<CalendarIcon />}
        title="Agendar Cita"
        subtitle={profesor ? `Prof. ${profesor.nombre}` : 'Selecciona fecha y horario'}
      />

      <div className="max-w-lg mx-auto px-4 pt-6 pb-10">
        <div className="bg-white rounded-3xl shadow-sm p-6 space-y-6">

          <div>
            <h2 className="text-base font-bold text-gray-900 mb-4">Motivo de Visita</h2>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">¿Cuál es el motivo de tu visita?</label>
              <textarea
                {...register('motivo', { required: 'El motivo es obligatorio' })}
                rows={3}
                placeholder="Describe el motivo de tu cita..."
                className={inputClass + ' resize-none'}
              />
              {errors.motivo && <p className="text-red-500 text-xs mt-1">{errors.motivo.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">Elegir Horario de la Cita</label>
            <input
              type="date"
              value={fechaSeleccionada}
              min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
              className={inputClass}
            />
            {fechaSeleccionada && (
              <p className="text-xs text-gray-400 mt-1 capitalize">{fechaLabel}</p>
            )}
          </div>

          {fechaSeleccionada && (
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Horarios disponibles</label>
              {loadingHorarios ? (
                <LoadingSpinner message="Cargando horarios..." />
              ) : horarios.length === 0 ? (
                <p className="text-sm text-gray-400">No hay horarios disponibles para esta fecha</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {horarios.map((h) => (
                    <button
                      key={h.horaInicio}
                      type="button"
                      onClick={() => setHorarioSeleccionado(h)}
                      className="text-sm py-2.5 px-3 rounded-xl border font-medium transition-all"
                      style={
                        horarioSeleccionado?.horaInicio === h.horaInicio
                          ? { backgroundColor: '#F05A14', color: 'white', borderColor: '#F05A14' }
                          : { borderColor: '#E5E7EB', color: '#374151' }
                      }
                    >
                      {h.horaInicio}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <ErrorMessage message={error} />

          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={submitting || !horarioSeleccionado}
            className="w-full text-white py-3 rounded-full text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
            style={{ backgroundColor: '#2563EB' }}
          >
            <ClockIcon />
            {submitting ? 'Agendando...' : 'Agendar cita'}
          </button>
        </div>
      </div>
    </Layout>
  )
}
