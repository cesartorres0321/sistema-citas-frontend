import axiosClient from './axiosClient'

export const getCitasApi = (params) =>
  axiosClient.get('/citas', { params })

export const createCitaApi = (data) =>
  axiosClient.post('/citas', data)

export const cancelarCitaApi = (id) =>
  axiosClient.patch(`/citas/${id}/cancelar`)

export const reprogramarCitaApi = (id, data) =>
  axiosClient.patch(`/citas/${id}/reprogramar`, data)

export const completarCitaApi = (id) =>
  axiosClient.patch(`/citas/${id}/completar`)
