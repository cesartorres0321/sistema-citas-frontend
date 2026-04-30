import { useAuthStore } from '@/store/authStore'
import { loginApi, logoutApi, registerApi, getPerfilApi } from '@/api/auth.api'
import { jwtDecode } from 'jwt-decode'

export const useAuth = () => {
  const { token, user, setAuth, clearAuth, updateUser } = useAuthStore()

  const login = async (credentials) => {
    const { data } = await loginApi(credentials)
    const newToken = data.data.token
    const decoded = jwtDecode(newToken)
    // Guardar token primero para que el siguiente request lleve el header
    setAuth(newToken, { id: decoded.id, role: decoded.role })
    // Cargar perfil completo (nombre, email, foto, etc.)
    try {
      const perfil = await getPerfilApi()
      setAuth(newToken, perfil.data.data)
    } catch {}
    return decoded.role
  }

  const register = async (userData) => {
    const { data } = await registerApi(userData)
    return data
  }

  const logout = async () => {
    try {
      await logoutApi()
    } finally {
      clearAuth()
    }
  }

  return { token, user, login, register, logout, updateUser, isAuthenticated: !!token }
}
