import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'
import { getProfesoresApi } from '@/api/profesores.api'

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
)

export default function BuscarProfesoresPage() {
  const [profesores, setProfesores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    getProfesoresApi({ limit: 50 })
      .then(({ data }) => setProfesores(data.data || []))
      .catch(() => setError('No se pudieron cargar los profesores'))
      .finally(() => setLoading(false))
  }, [])

  const filtrados = profesores.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.departamento || '').toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <Layout backLabel="Volver al Inicio" backTo="/alumno">
      <PageHeader
        icon={<SearchIcon />}
        title="Buscar Docente"
        subtitle="Selecciona un docente para agendar tu cita"
      />

      <div className="max-w-lg mx-auto px-4 pt-6 pb-10">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o departamento..."
          className="w-full border border-gray-300 rounded-2xl px-4 py-3 text-sm focus:outline-none mb-5 bg-white"
        />

        <ErrorMessage message={error} />

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-3">
            {filtrados.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm"
                    style={{ backgroundColor: '#F05A14' }}
                  >
                    {p.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{p.nombre}</p>
                    {p.departamento && <p className="text-xs text-gray-500">{p.departamento}</p>}
                    {p.duracionCita && <p className="text-xs text-gray-400">Citas de {p.duracionCita} min</p>}
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/alumno/agendar/${p.id}`)}
                  className="text-xs text-white px-4 py-2 rounded-full font-medium"
                  style={{ backgroundColor: '#F05A14' }}
                >
                  Ver horarios
                </button>
              </div>
            ))}
            {filtrados.length === 0 && (
              <p className="text-center text-gray-400 py-8">No se encontraron docentes</p>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
