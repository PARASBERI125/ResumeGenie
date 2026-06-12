import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? ''

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('resumeGenieToken')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export function getApiError(error: unknown) {
  if (axios.isAxiosError(error)) {
    const responseMessage = error.response?.data
    if (typeof responseMessage === 'string') {
      return responseMessage
    }
    return error.message
  }

  return 'Something went wrong'
}
