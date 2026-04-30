import { useState, useEffect } from 'react'
import { format, addDays } from 'date-fns'
import { getHorariosDisponiblesApi } from '@/api/profesores.api'
import { reprogramarCitaApi } from '@/api/citas.api'
import ErrorMessage from './ErrorMessage'
import LoadingSpinner from './LoadingSpinner'

export default function ReprogramarModal({ cita, onClose, onSuccess }) {
  const [fecha, setFecha] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'))
  const [horarios, setHorarios] = useState([])
  const [seleccionado, setSeleccionado] = useState(null)
  const [loadingHorarios, setLoadingHorarios] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const profesorId = cita.profesorId || cita.profesor?.id

  useEffect(() => {
    if (!fecha || !profesorId) return
    setLoadingHorarios(true)
    setSeleccionado(null)
    getHorariosDisponiblesApi(profesorId, fecha)
      .then(({ data }) => setHorarios(data.data || []))
      .catch(() => setHorarios([]))
      .finally(() => setLoadingHorarios(false))
  }, [fecha, profesorId])

  const handleConfirmar = async () => {
    if (!seleccionado) { setError('Selecciona un horario'); return }
    setError('')
    setSubmitting(true)
    try {
      await reprogramarCitaApi(cita.id, {
        fecha,
        horaInicio: seleccionado.horaInicio,
        horaFin: seleccionado.horaFin,
      })
      onSuccess()
    } catch (e) {
      setError(e.response?.data?.error || 'Error al reprogramar')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="py-5 px-6 text-center text-white" style={{ backgroundColor: '#F05A14' }}>
          <h2 className="text-lg font-bold">Reprogramar Cita</h2>
          <p className="text-sm text-white/80 mt-0.5">Selecciona nueva fecha y horario</p>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">Nueva fecha</label>
            <input
              type="date"
              value={fecha}
              min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full border border-gray-300 rounded-2xl px-4 py-3 text-sm focus:outline-none bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">Horario disponible</label>
            {loadingHorarios ? (
              <LoadingSpinner message="Cargando horarios..." />
            ) : horarios.length === 0 ? (
              <p className="text-sm text-gray-400">No hay horarios disponibles</p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {horarios.map((h) => (
                  <button
                    key={h.horaInicio}
                    type="button"
                    onClick={() => setSeleccionado(h)}
                    className="text-sm py-2 px-2 rounded-xl border font-medium transition-all"
                    style={
                      seleccionado?.horaInicio === h.horaInicio
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

          <ErrorMessage message={error} />

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-full text-sm font-semibold hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmar}
              disabled={submitting || !seleccionado}
              className="flex-1 text-white py-3 rounded-full text-sm font-semibold disabled:opacity-50"
              style={{ backgroundColor: '#2563EB' }}
            >
              {submitting ? 'Guardando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
