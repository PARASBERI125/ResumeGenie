import { apiClient } from './client'
import type { ResumeRequest, ResumeResponse } from '../types'

export async function getResumes(userId: number) {
  const response = await apiClient.get<ResumeResponse[]>('/api/resumes', {
    params: { userId },
  })
  return response.data
}

export async function getResume(id: string) {
  const response = await apiClient.get<ResumeResponse>(`/api/resumes/${id}`)
  return response.data
}

export async function createResume(request: ResumeRequest) {
  const response = await apiClient.post<ResumeResponse>('/api/resumes', request)
  return response.data
}

export async function updateResume(id: string, request: ResumeRequest) {
  const response = await apiClient.put<ResumeResponse>(`/api/resumes/${id}`, request)
  return response.data
}

export async function deleteResume(id: string) {
  await apiClient.delete(`/api/resumes/${id}`)
}
