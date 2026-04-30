import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/hooks/useAuth'
import ErrorMessage from '@/components/ErrorMessage'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
  </svg>
)

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (values) => {
    setApiError('')
    setLoading(true)
    try {
      const role = await login(values)
      const dest = role === 'admin' ? '/admin' : role === 'profesor' ? '/profesor' : '/alumno'
      navigate(dest, { replace: true })
    } catch (e) {
      setApiError(e.response?.data?.error || 'Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header naranja */}
      <div className="w-full py-8 px-4 text-center" style={{ backgroundColor: '#F05A14' }}>
        <div className="flex justify-center mb-3 text-white">
          <CalendarIcon />
        </div>
        <h1 className="text-xl font-bold text-white">Sistema de Citas</h1>
        <p className="text-sm text-white/90 mt-1">IEST Anáhuac — Inicia sesión para continuar</p>
      </div>

      {/* Formulario */}
      <div className="flex-1 flex items-start justify-center pt-8 px-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-sm p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Identificación</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">Email</label>
              <input
                type="email"
                {...register('email')}
                placeholder="Ingrese su email"
                className="w-full border border-gray-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#F05A14' }}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">Contraseña</label>
              <input
                type="password"
                {...register('password')}
                placeholder="Ingrese su contraseña"
                className="w-full border border-gray-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <ErrorMessage message={apiError} />

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-3 rounded-full text-sm font-semibold disabled:opacity-60 transition-all mt-2"
              style={{ backgroundColor: '#2563EB' }}
            >
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-5">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="font-medium" style={{ color: '#F05A14' }}>
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
