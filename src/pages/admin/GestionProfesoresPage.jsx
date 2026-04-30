import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'
import {
  getProfesoresApi,
  createProfesorApi,
  updateProfesorApi,
  deleteProfesorApi,
} from '@/api/profesores.api'

const createSchema = z.object({
  nombre: z.string().min(2, 'Obligatorio'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  departamento: z.string().min(1, 'Obligatorio'),
})
const editSchema = z.object({
  nombre: z.string().min(2, 'Obligatorio'),
  email: z.string().email('Email inválido'),
  departamento: z.string().min(1, 'Obligatorio'),
})

const inputClass = "w-full border border-gray-300 rounded-2xl px-4 py-3 text-sm focus:outline-none bg-white"

const ProfesorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
  </svg>
)

function ProfesorModal({ profesor, onClose, onSaved }) {
  const isEdit = !!profesor
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
    defaultValues: isEdit ? { nombre: profesor.nombre, email: profesor.email, departamento: profesor.departamento } : {},
  })

  const onSubmit = async (values) => {
    setApiError('')
    setLoading(true)
    try {
      isEdit ? await updateProfesorApi(profesor.id, values) : await createProfesorApi({ ...values, role: 'profesor' })
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
          <h2 className="text-lg font-bold">{isEdit ? 'Editar Profesor' : 'Nuevo Profesor'}</h2>
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
            <label className="block text-sm font-medium text-gray-800 mb-1.5">Departamento</label>
            <input {...register('departamento')} className={inputClass} placeholder="Ej. Ingeniería de Software" />
            {errors.departamento && <p className="text-red-500 text-xs mt-1">{errors.departamento.message}</p>}
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
              {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear profesor'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GestionProfesoresPage() {
  const [profesores, setProfesores] = useState([])
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null)

  const fetchProfesores = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getProfesoresApi({ page, limit: 10 })
      setProfesores(data.data || [])
      if (data.meta) setMeta(data.meta)
    } catch {
      setError('No se pudieron cargar los profesores')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { fetchProfesores() }, [fetchProfesores])

  const handleDelete = async (id, nombre) => {
    if (!confirm(`¿Eliminar a "${nombre}"?`)) return
    try {
      await deleteProfesorApi(id)
      fetchProfesores()
    } catch (e) {
      setError(e.response?.data?.error || 'No se pudo eliminar')
    }
  }

  return (
    <Layout backLabel="Volver al Panel" backTo="/admin">
      <PageHeader icon={<ProfesorIcon />} title="Gestión de Profesores" subtitle={`${meta.total} profesores registrados`} />

      <div className="max-w-2xl mx-auto px-4 pt-6 pb-10">
        <button
          onClick={() => setModal('create')}
          className="w-full text-white py-3 rounded-full text-sm font-semibold mb-5"
          style={{ backgroundColor: '#F05A14' }}
        >
          + Nuevo Profesor
        </button>

        <ErrorMessage message={error} />

        {loading ? <LoadingSpinner /> : (
          <div className="space-y-3">
            {profesores.length === 0 && <p className="text-center text-gray-400 py-8">No hay profesores registrados</p>}
            {profesores.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ backgroundColor: '#F05A14' }}>
                    {p.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 text-sm">{p.nombre}</p>
                      {p.role === 'admin' && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Admin</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{p.email}</p>
                    {p.departamento && <p className="text-xs text-gray-400">{p.departamento}</p>}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setModal(p)} className="text-xs px-4 py-1.5 rounded-full border font-medium" style={{ borderColor: '#F05A14', color: '#F05A14' }}>
                    Editar
                  </button>
                  {p.role !== 'admin' && (
                    <button onClick={() => handleDelete(p.id, p.nombre)} className="text-xs px-4 py-1.5 rounded-full text-white font-medium" style={{ backgroundColor: '#EF4444' }}>
                      Eliminar
                    </button>
                  )}
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
        <ProfesorModal
          profesor={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchProfesores() }}
        />
      )}
    </Layout>
  )
}
