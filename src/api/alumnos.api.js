import axiosClient from './axiosClient'

export const getAlumnosApi = (params) =>
  axiosClient.get('/alumnos', { params })

export const createAlumnoApi = (data) =>
  axiosClient.post('/alumnos', data)

export const updateAlumnoApi = (id, data) =>
  axiosClient.put(`/alumnos/${id}`, data)

export const deleteAlumnoApi = (id) =>
  axiosClient.delete(`/alumnos/${id}`)
