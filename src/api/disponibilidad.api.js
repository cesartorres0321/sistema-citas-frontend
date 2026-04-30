import axiosClient from './axiosClient'

export const getDisponibilidadApi = (profesorId) =>
  axiosClient.get(`/disponibilidad/${profesorId}`)

export const createDisponibilidadApi = (data) =>
  axiosClient.post('/disponibilidad', data)

export const deleteDisponibilidadApi = (id) =>
  axiosClient.delete(`/disponibilidad/${id}`)

export const getDisponibilidadProfesorApi = () =>
  axiosClient.get('/disponibilidad')

export const getBloqueoApi = (profesorId) =>
  axiosClient.get(`/bloqueos/${profesorId}`)

export const createBloqueoApi = (data) =>
  axiosClient.post('/bloqueos', data)

export const deleteBloqueoApi = (id) =>
  axiosClient.delete(`/bloqueos/${id}`)
