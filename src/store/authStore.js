import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null, // { id, role, nombre, email, foto, matricula?, departamento? }

      setAuth: (token, user) => set({ token, user }),
      setToken: (token) => set({ token }),
      updateUser: (fields) => set((state) => ({ user: { ...state.user, ...fields } })),
      clearAuth: () => set({ token: null, user: null }),
    }),
    { name: 'auth-storage' }
  )
)
