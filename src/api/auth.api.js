import axiosClient from './axiosClient'

export const loginApi = (credentials) =>
  axiosClient.post('/auth/login', credentials)

export const registerApi = (data) =>
  axiosClient.post('/auth/register', data)

export const logoutApi = () =>
  axiosClient.post('/auth/logout')

export const refreshApi = () =>
  axiosClient.post('/auth/refresh')

export const getPerfilApi = () =>
  axiosClient.get('/auth/perfil')

export const updatePerfilApi = (data) =>
  axiosClient.patch('/auth/perfil', data)
