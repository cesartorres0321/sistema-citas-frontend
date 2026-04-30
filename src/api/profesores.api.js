import axiosClient from './axiosClient'

export const getProfesoresApi = (params) =>
  axiosClient.get('/profesores', { params })

export const getProfesorByIdApi = (id) =>
  axiosClient.get(`/profesores/${id}`)

export const getHorariosDisponiblesApi = (profesorId, fecha) =>
  axiosClient.get(`/citas/profesor/${profesorId}/horarios-disponibles`, { params: { fecha } })

export const getEstadisticasProfesorApi = (id) =>
  axiosClient.get(`/profesores/${id}/estadisticas`)

export const getCalendarioProfesorApi = (profesorId, params) =>
  axiosClient.get(`/citas/profesor/${profesorId}/calendario`, { params })

export const getAgendaDiaProfesorApi = (profesorId, fecha) =>
  axiosClient.get(`/citas/profesor/${profesorId}/dia`, { params: { fecha } })

export const updateDuracionCitaApi = (duracionCita) =>
  axiosClient.patch('/profesores/duracion', { duracionCita })

export const createProfesorApi = (data) =>
  axiosClient.post('/profesores', data)

export const updateProfesorApi = (id, data) =>
  axiosClient.put(`/profesores/${id}`, data)

export const deleteProfesorApi = (id) =>
  axiosClient.delete(`/profesores/${id}`)
