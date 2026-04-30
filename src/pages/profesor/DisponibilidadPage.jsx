import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import Layout from '@/components/Layout'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'
import {
  getDisponibilidadApi,
  createDisponibilidadApi,
  deleteDisponibilidadApi,
  getBloqueoApi,
  createBloqueoApi,
  deleteBloqueoApi,
} from '@/api/disponibilidad.api'
import { useAuthStore } from '@/store/authStore'

// Ordenados para el selector (lun-dom), con el valor real de getDay()
const DIAS = [
  { label: 'Lunes',     value: 1 },
  { label: 'Martes',    value: 2 },
  { label: 'Miércoles', value: 3 },
  { label: 'Jueves',    value: 4 },
  { label: 'Viernes',   value: 5 },
  { label: 'Sábado',    value: 6 },
  { label: 'Domingo',   value: 0 },
]
const DIA_LABEL = Object.fromEntries(DIAS.map((d) => [d.value, d.label]))

export default function DisponibilidadPage() {
  const user = useAuthStore((s) => s.user)
  const [disponibilidad, setDisponibilidad] = useState([])
  const [bloqueos, setBloqueos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const { register: regDisp, handleSubmit: handleDisp, reset: resetDisp } = useForm()
  const { register: regBloqueo, handleSubmit: handleBloqueo, reset: resetBloqueo } = useForm()

  const fetchAll = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const [dispRes, bloqueoRes] = await Promise.all([
        getDisponibilidadApi(user.id),
        getBloqueoApi(user.id),
      ])
      setDisponibilidad(dispRes.data.data || [])
      setBloqueos(bloqueoRes.data.data || [])
    } catch {
      setError('No se pudo cargar la disponibilidad')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [user?.id])

  const onAddDisponibilidad = async (values) => {
    setError('')
    try {
      await createDisponibilidadApi({ ...values, diaSemana: parseInt(values.diaSemana) })
      resetDisp()
      fetchAll()
    } catch (e) {
      setError(e.response?.data?.error || 'Error al agregar disponibilidad')
    }
  }

  const onAddBloqueo = async (values) => {
    setError('')
    try {
      await createBloqueoApi(values)
      resetBloqueo()
      fetchAll()
    } catch (e) {
      setError(e.response?.data?.error || 'Error al agregar bloqueo')
    }
  }

  return (
    <Layout>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Disponibilidad</h1>
      <ErrorMessage message={error} />

      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Disponibilidad semanal */}
          <section>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Horarios semanales
            </h2>

            <form onSubmit={handleDisp(onAddDisponibilidad)} className="flex flex-wrap gap-2 mb-4">
              <select
                {...regDisp('diaSemana', { required: true })}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm"
              >
                {DIAS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
              <input type="time" {...regDisp('horaInicio', { required: true })}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm" />
              <input type="time" {...regDisp('horaFin', { required: true })}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm" />
              <button type="submit"
                className="bg-indigo-600 text-white text-sm px-3 py-1.5 rounded hover:bg-indigo-700">
                + Agregar
              </button>
            </form>

            <div className="space-y-2">
              {disponibilidad.length === 0 && (
                <p className="text-sm text-gray-400">Sin horarios registrados</p>
              )}
              {disponibilidad.map((d) => (
                <div key={d.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <span className="text-gray-700">{DIA_LABEL[d.diaSemana] ?? '?'} · {d.horaInicio} – {d.horaFin}</span>
                  <button
                    onClick={async () => { await deleteDisponibilidadApi(d.id); fetchAll() }}
                    className="text-red-400 hover:text-red-600 text-xs"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Bloqueos */}
          <section>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Bloqueos de fechas
            </h2>

            <form onSubmit={handleBloqueo(onAddBloqueo)} className="flex flex-wrap gap-2 mb-4">
              <input type="date" {...regBloqueo('fecha', { required: true })}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm" />
              <input type="text" {...regBloqueo('motivo')} placeholder="Motivo (opcional)"
                className="border border-gray-300 rounded px-2 py-1.5 text-sm flex-1 min-w-0" />
              <button type="submit"
                className="bg-indigo-600 text-white text-sm px-3 py-1.5 rounded hover:bg-indigo-700">
                + Bloquear
              </button>
            </form>

            <div className="space-y-2">
              {bloqueos.length === 0 && (
                <p className="text-sm text-gray-400">Sin bloqueos registrados</p>
              )}
              {bloqueos.map((b) => (
                <div key={b.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <span className="text-gray-700">{b.fecha?.split('T')[0]}{b.motivo ? ` · ${b.motivo}` : ''}</span>
                  <button
                    onClick={async () => { await deleteBloqueoApi(b.id); fetchAll() }}
                    className="text-red-400 hover:text-red-600 text-xs"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </Layout>
  )
}
