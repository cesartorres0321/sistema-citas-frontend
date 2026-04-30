import { useState, useRef, useEffect } from 'react'
import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import ErrorMessage from '@/components/ErrorMessage'
import { useAuth } from '@/hooks/useAuth'
import { getPerfilApi, updatePerfilApi } from '@/api/auth.api'

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
)

const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
  </svg>
)

const ROLE_LABEL = { alumno: 'Alumno', profesor: 'Profesor', admin: 'Administrador' }
const ROLE_COLOR = { alumno: '#2563EB', profesor: '#F05A14', admin: '#7C3AED' }

const resizeToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const MAX = 300
        const scale = Math.min(MAX / img.width, MAX / img.height, 1)
        const canvas = document.createElement('canvas')
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const Field = ({ label, value }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
    <p className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm bg-gray-50 text-gray-700">
      {value || '—'}
    </p>
  </div>
)

export default function PerfilPage() {
  const { user, updateUser } = useAuth()
  const [perfil, setPerfil] = useState(null)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [fotoBase64, setFotoBase64] = useState(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [loadError, setLoadError] = useState('')
  const fileRef = useRef()

  useEffect(() => {
    getPerfilApi()
      .then(({ data }) => {
        const p = data.data
        setPerfil(p)
        setFotoPreview(p.foto || null)
        updateUser(p)
      })
      .catch((e) => {
        // Si hay datos en el store, usarlos como fallback
        if (user) {
          setPerfil(user)
          setFotoPreview(user.foto || null)
        } else {
          setLoadError(e.response?.data?.error || 'No se pudo cargar el perfil')
        }
      })
  }, [])

  const handleFotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Solo se permiten imágenes'); return }
    try {
      const b64 = await resizeToBase64(file)
      setFotoPreview(b64)
      setFotoBase64(b64)
      setError('')
    } catch {
      setError('No se pudo procesar la imagen')
    }
  }

  const handleRemoveFoto = () => {
    setFotoPreview(perfil?.foto || null)
    setFotoBase64(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleGuardar = async () => {
    if (!fotoBase64) return
    setError('')
    setSuccess(false)
    setSaving(true)
    try {
      const { data } = await updatePerfilApi({ foto: fotoBase64 })
      const updated = data.data
      setPerfil(prev => ({ ...prev, foto: updated.foto }))
      updateUser({ foto: updated.foto })
      setFotoBase64(null)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (e) {
      setError(e.response?.data?.error || `Error al guardar (${e.response?.status ?? 'sin respuesta'})`)
    } finally {
      setSaving(false)
    }
  }

  const roleColor = ROLE_COLOR[perfil?.role] || '#6B7280'
  const iniciales = (perfil?.nombre || '?').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
  const hasNewFoto = fotoBase64 !== null

  if (!perfil && !loadError) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-40 text-gray-400 text-sm">Cargando...</div>
      </Layout>
    )
  }

  if (loadError) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-40 text-red-500 text-sm">{loadError}</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <PageHeader icon={<UserIcon />} title="Mi Perfil" subtitle="Tu información personal" />

      <div className="max-w-md mx-auto px-4 pt-6 pb-10">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Banner */}
          <div className="h-20" style={{ backgroundColor: roleColor, opacity: 0.15 }} />

          {/* Avatar */}
          <div className="flex flex-col items-center -mt-12 px-6 pb-6">
            <div className="relative mb-4">
              {fotoPreview ? (
                <img
                  src={fotoPreview}
                  alt="Foto de perfil"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                />
              ) : (
                <div
                  className="w-24 h-24 rounded-full border-4 border-white shadow-md flex items-center justify-center text-white text-2xl font-bold"
                  style={{ backgroundColor: roleColor }}
                >
                  {iniciales}
                </div>
              )}

              <button
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border border-gray-300 shadow flex items-center justify-center hover:bg-gray-50 transition-colors"
                title="Cambiar foto"
                style={{ color: roleColor }}
              >
                <CameraIcon />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFotoChange}
              />
            </div>

            <span
              className="text-xs font-semibold px-3 py-1 rounded-full text-white mb-4"
              style={{ backgroundColor: roleColor }}
            >
              {ROLE_LABEL[perfil?.role] || perfil?.role}
            </span>

            {hasNewFoto && (
              <button
                onClick={handleRemoveFoto}
                className="text-xs text-red-400 hover:text-red-600 mb-4"
              >
                Cancelar cambio de foto
              </button>
            )}

            <div className="w-full space-y-3">
              <Field label="Nombre" value={perfil?.nombre} />
              <Field label="Email" value={perfil?.email} />
              {perfil?.matricula && <Field label="Matrícula" value={perfil.matricula} />}
              {perfil?.departamento && <Field label="Departamento" value={perfil.departamento} />}

              <ErrorMessage message={error} />

              {success && (
                <p className="text-sm text-green-600 font-medium text-center">
                  Foto actualizada correctamente
                </p>
              )}

              {hasNewFoto && (
                <button
                  onClick={handleGuardar}
                  disabled={saving}
                  className="w-full text-white py-3 rounded-full text-sm font-semibold disabled:opacity-50 transition-all"
                  style={{ backgroundColor: roleColor }}
                >
                  {saving ? 'Guardando...' : 'Guardar foto'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
