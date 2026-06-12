import { apiClient } from './client'
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types'

export async function loginUser(request: LoginRequest) {
  const response = await apiClient.post<AuthResponse>('/api/auth/login', request)
  return response.data
}

export async function registerUser(request: RegisterRequest) {
  const response = await apiClient.post<AuthResponse>('/api/auth/register', request)
  return response.data
}
