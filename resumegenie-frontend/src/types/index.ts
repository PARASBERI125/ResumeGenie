export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = {
  fullName: string
  email: string
  password: string
}

export type AuthResponse = {
  token: string
  tokenType: string
  userId: number
  email: string
}

export type PersonalDetails = {
  fullName: string
  email: string
  phone: string
  location: string
  linkedIn: string
  github: string
}

export type Education = {
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string
  score: string
}

export type Experience = {
  company: string
  role: string
  startDate: string
  endDate: string
  bullets: string[]
}

export type Project = {
  name: string
  description: string
  technologies: string[]
  bullets: string[]
}

export type ResumeRequest = {
  userId: number
  title: string
  targetRole: string
  personalDetails: PersonalDetails
  education: Education[]
  experience: Experience[]
  projects: Project[]
  skills: string[]
  achievements: string[]
}

export type ResumeResponse = ResumeRequest & {
  id: string
  createdAt: string
  updatedAt: string
}

export type AiRewriteRequest = {
  targetRole: string
  sectionType: string
  originalText: string
}

export type AiRewriteResponse = {
  improvedText: string
}

export type AiBuildResumeRequest = {
  targetRole: string
  basicDetails: string
  experienceNotes: string
  educationNotes: string
  projectNotes: string
  skillsNotes: string
  achievementsNotes: string
}

export type AiBuildResumeResponse = {
  title?: string
  targetRole?: string
  personalDetails?: PersonalDetails
  education?: Education[]
  experience?: Experience[]
  projects?: Project[]
  skills?: string[]
  achievements?: string[]
}
