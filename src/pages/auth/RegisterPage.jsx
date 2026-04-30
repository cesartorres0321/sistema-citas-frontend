import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerApi } from '@/api/auth.api'
import ErrorMessage from '@/components/ErrorMessage'

const schema = z.object({
  nombre: z.string().min(2, 'El nombre es obligatorio'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  role: z.enum(['alumno', 'profesor']),
  matricula: z.string().optional(),
  departamento: z.string().optional(),
}).refine((d) => !(d.role === 'alumno' && !d.matricula), {
  message: 'La matrícula es obligatoria para alumnos',
  path: ['matricula'],
})

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
  </svg>
)

const inputClass = "w-full border border-gray-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white"

export default function RegisterPage() {
  const navigate = useNavigate()
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'alumno' },
  })

  const role = watch('role')

  const onSubmit = async (values) => {
    setApiError('')
    setLoading(true)
    try {
      await registerApi(values)
      navigate('/login', { state: { registered: true } })
    } catch (e) {
      setApiError(e.response?.data?.error || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2.5">
        <button onClick={() => navigate('/login')} className="text-sm font-medium" style={{ color: '#F05A14' }}>
          ← Volver al Inicio
        </button>
      </div>

      {/* Header naranja */}
      <div className="w-full py-8 px-4 text-center" style={{ backgroundColor: '#F05A14' }}>
        <div className="flex justify-center mb-3 text-white">
          <CalendarIcon />
        </div>
        <h1 className="text-xl font-bold text-white">Registrarse como Visitante</h1>
        <p className="text-sm text-white/90 mt-1">Completa tu registro para agendar tu cita</p>
      </div>

      {/* Formulario */}
      <div className="flex-1 px-4 pt-6 pb-10 max-w-lg mx-auto w-full">
        <div className="bg-white rounded-3xl shadow-sm p-6 space-y-5">
          <h2 className="text-base font-bold text-gray-900">Identificación</h2>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">Nombre completo</label>
            <input {...register('nombre')} placeholder="Ingrese su nombre completo" className={inputClass} />
            {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">Email</label>
            <input type="email" {...register('email')} placeholder="Ingrese su email" className={inputClass} />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">Contraseña</label>
            <input type="password" {...register('password')} placeholder="Mínimo 6 caracteres" className={inputClass} />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">Rol</label>
            <div className="relative">
              <select {...register('role')} className={inputClass + ' appearance-none pr-10'}>
                <option value="alumno">Estudiante</option>
                <option value="profesor">Docente</option>
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">∨</span>
            </div>
          </div>

          {role === 'alumno' && (
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">ID (Matrícula)</label>
              <input {...register('matricula')} placeholder="Ingrese su id (en caso de ser alumno)" className={inputClass} />
              {errors.matricula && <p className="text-red-500 text-xs mt-1">{errors.matricula.message}</p>}
            </div>
          )}

          {role === 'profesor' && (
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">Departamento</label>
              <input {...register('departamento')} placeholder="Ingrese su departamento" className={inputClass} />
            </div>
          )}

          <ErrorMessage message={apiError} />

          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className="w-full text-white py-3 rounded-full text-sm font-semibold disabled:opacity-60 transition-all"
            style={{ backgroundColor: '#2563EB' }}
          >
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>

          <p className="text-sm text-gray-500 text-center">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-medium" style={{ color: '#F05A14' }}>Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
