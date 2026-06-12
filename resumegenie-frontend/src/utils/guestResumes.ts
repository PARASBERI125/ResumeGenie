import type { ResumeRequest, ResumeResponse } from '../types'

const STORAGE_KEY = 'resumeGenieGuestResumes'

function readRawResumes() {
  const rawValue = localStorage.getItem(STORAGE_KEY)
  if (!rawValue) {
    return []
  }

  try {
    return JSON.parse(rawValue) as ResumeResponse[]
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return []
  }
}

function writeRawResumes(resumes: ResumeResponse[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes))
}

export function getGuestResumes() {
  return readRawResumes()
}

export function getGuestResume(id: string) {
  return readRawResumes().find((resume) => resume.id === id) ?? null
}

export function saveGuestResume(request: ResumeRequest, id?: string) {
  const resumes = readRawResumes()
  const now = new Date().toISOString()
  const existing = id ? resumes.find((resume) => resume.id === id) : null
  const saved: ResumeResponse = {
    ...request,
    id: existing?.id ?? `guest-${crypto.randomUUID()}`,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }

  if (existing) {
    writeRawResumes(resumes.map((resume) => (resume.id === saved.id ? saved : resume)))
  } else {
    writeRawResumes([saved, ...resumes])
  }

  return saved
}

export function deleteGuestResume(id: string) {
  writeRawResumes(readRawResumes().filter((resume) => resume.id !== id))
}
