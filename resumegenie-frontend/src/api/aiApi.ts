import { apiClient } from './client'
import type { AiBuildResumeRequest, AiBuildResumeResponse, AiRewriteRequest, AiRewriteResponse } from '../types'

export async function rewriteText(request: AiRewriteRequest) {
  const response = await apiClient.post<AiRewriteResponse>('/api/ai/rewrite', request)
  return response.data
}

export async function buildResume(request: AiBuildResumeRequest) {
  const response = await apiClient.post<AiBuildResumeResponse>('/api/ai/build-resume', request)
  return response.data
}

export async function uploadPdfForParsing(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const response = await apiClient.post<AiBuildResumeResponse>('/api/ai/parse-pdf', formData)
  return response.data
}
