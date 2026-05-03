import axiosClient from './axiosClient'

export const getDepartamentosApi = () => axiosClient.get('/departamentos')
export const getTiposProfesorApi = () => axiosClient.get('/tipos-profesor')
