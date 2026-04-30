import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'
import { getAlumnosApi, createAlumnoApi, updateAlumnoApi, deleteAlumnoApi } from '@/api/alumnos.api'

const createSchema = z.object({
  nombre: z.string().min(2, 'Obligatorio'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  matricula: z.string().min(1, 'Obligatorio'),
})
const editSchema = z.object({
  nombre: z.string().min(2, 'Obligatorio'),
  email: z.string().email('Email inválido'),
  matricula: z.string().min(1, 'Obligatorio'),
})

const inputClass = "w-full border border-gray-300 rounded-2xl px-4 py-3 text-sm focus:outline-none bg-white"

const AlumnoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
  </svg>
)

function AlumnoModal({ alumno, onClose, onSaved }) {
  const isEdit = !!alumno
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
    defaultValues: isEdit ? { nombre: alumno.nombre, email: alumno.email, matricula: alumno.matricula } : {},
  })

  const onSubmit = async (values) => {
    setApiError('')
    setLoading(true)
    try {
      isEdit ? await updateAlumnoApi(alumno.id, values) : await createAlumnoApi(values)
      onSaved()
    } catch (e) {
      setApiError(e.response?.data?.error || 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="py-5 px-6 text-center text-white" style={{ backgroundColor: '#F05A14' }}>
          <h2 className="text-lg font-bold">{isEdit ? 'Editar Alumno' : 'Nuevo Alumno'}</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">Nombre</label>
            <input {...register('nombre')} className={inputClass} placeholder="Nombre completo" />
            {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">Email</label>
            <input type="email" {...register('email')} className={inputClass} placeholder="email@iest.mx" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">Contraseña</label>
              <input type="password" {...register('password')} className={inputClass} placeholder="Mínimo 6 caracteres" />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">Matrícula</label>
            <input {...register('matricula')} className={inputClass} placeholder="Ej. A12345678" />
            {errors.matricula && <p className="text-red-500 text-xs mt-1">{errors.matricula.message}</p>}
          </div>
          <ErrorMessage message={apiError} />
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-full text-sm font-semibold hover:bg-gray-50">
              Cancelar
            </button>
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={loading}
              className="flex-1 text-white py-3 rounded-full text-sm font-semibold disabled:opacity-60"
              style={{ backgroundColor: '#F05A14' }}
            >
              {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear alumno'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GestionAlumnosPage() {
  const [alumnos, setAlumnos] = useState([])
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 })
  const [page, setPage] = useState(1)
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null)

  const fetchAlumnos = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getAlumnosApi({ page, limit: 10 })
      setAlumnos(data.data || [])
      if (data.meta) setMeta(data.meta)
    } catch {
      setError('No se pudieron cargar los alumnos')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { fetchAlumnos() }, [fetchAlumnos])

  const handleDelete = async (id, nombre) => {
    if (!confirm(`¿Eliminar a "${nombre}"?`)) return
    try {
      await deleteAlumnoApi(id)
      fetchAlumnos()
    } catch (e) {
      setError(e.response?.data?.error || 'No se pudo eliminar')
    }
  }

  const filtrados = alumnos.filter((a) =>
    a.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    a.email.toLowerCase().includes(busqueda.toLowerCase()) ||
    (a.matricula || '').toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <Layout backLabel="Volver al Panel" backTo="/admin">
      <PageHeader icon={<AlumnoIcon />} title="Gestión de Alumnos" subtitle={`${meta.total} alumnos registrados`} />

      <div className="max-w-2xl mx-auto px-4 pt-6 pb-10">
        <button
          onClick={() => setModal('create')}
          className="w-full text-white py-3 rounded-full text-sm font-semibold mb-4"
          style={{ backgroundColor: '#F05A14' }}
        >
          + Nuevo Alumno
        </button>

        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, email o matrícula..."
          className="w-full border border-gray-300 rounded-2xl px-4 py-3 text-sm focus:outline-none bg-white mb-4"
        />

        <ErrorMessage message={error} />

        {loading ? <LoadingSpinner /> : (
          <div className="space-y-3">
            {filtrados.length === 0 && <p className="text-center text-gray-400 py-8">No hay alumnos</p>}
            {filtrados.map((a) => (
              <div key={a.id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {a.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{a.nombre}</p>
                    <p className="text-xs text-gray-500">{a.email}</p>
                    <p className="text-xs text-gray-400 font-mono">{a.matricula}</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setModal(a)} className="text-xs px-4 py-1.5 rounded-full border font-medium" style={{ borderColor: '#F05A14', color: '#F05A14' }}>
                    Editar
                  </button>
                  <button onClick={() => handleDelete(a.id, a.nombre)} className="text-xs px-4 py-1.5 rounded-full text-white font-medium" style={{ backgroundColor: '#EF4444' }}>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {meta.totalPages > 1 && (
          <div className="flex justify-between items-center mt-5 text-sm text-gray-500">
            <span>Página {meta.page} de {meta.totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-1.5 rounded-full border border-gray-300 disabled:opacity-40">Anterior</button>
              <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages} className="px-4 py-1.5 rounded-full border border-gray-300 disabled:opacity-40">Siguiente</button>
            </div>
          </div>
        )}
      </div>

      {modal && (
        <AlumnoModal
          alumno={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchAlumnos() }}
        />
      )}
    </Layout>
  )
}
