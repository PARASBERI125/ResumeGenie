import AddIcon from '@mui/icons-material/Add'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { uploadPdfForParsing } from '../api/aiApi'
import { deleteResume, getResumes } from '../api/resumeApi'
import { useAuth } from '../auth/AuthContext'
import type { ResumeResponse } from '../types'
import { deleteGuestResume, getGuestResumes } from '../utils/guestResumes'

const sampleDocuments = [
  { id: 'sample-1', title: 'Senior Frontend E...', updatedAt: 'Updated 2 hours ago' },
  { id: 'sample-2', title: 'Product Manager ...', updatedAt: 'Updated 1 day ago' },
  { id: 'sample-3', title: 'Google SWE Appli...', updatedAt: 'Updated 3 days ago' },
]

function formatUpdated(value: string) {
  const timestamp = new Date(value).getTime()
  if (Number.isNaN(timestamp)) {
    return value
  }

  const diffMs = Date.now() - timestamp
  const diffHours = Math.max(1, Math.round(diffMs / 36e5))
  if (diffHours < 24) {
    return `Updated ${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  }

  const diffDays = Math.round(diffHours / 24)
  return `Updated ${diffDays} day${diffDays === 1 ? '' : 's'} ago`
}

export function DashboardPage() {
  const { user } = useAuth()
  const [resumes, setResumes] = useState<ResumeResponse[]>([])
  const [guestResumes, setGuestResumes] = useState(() => getGuestResumes())
  const [loading, setLoading] = useState(Boolean(user))
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      return
    }

    let active = true
    const userId = user.userId

    async function loadResumes() {
      try {
        const data = await getResumes(userId)
        if (active) {
          setResumes(data)
          setError('')
        }
      } catch {
        if (active) {
          setError('Unable to load resumes. Make sure the backend services are running.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadResumes()

    return () => {
      active = false
    }
  }, [user])

  async function handleDelete(id: string) {
    const shouldDelete = window.confirm('Delete this resume?')
    if (!shouldDelete) {
      return
    }

    if (id.startsWith('guest-')) {
      deleteGuestResume(id)
      setGuestResumes((current) => current.filter((resume) => resume.id !== id))
    } else {
      await deleteResume(id)
      setResumes((current) => current.filter((resume) => resume.id !== id))
    }
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setLoading(true)
      const data = await uploadPdfForParsing(file)
      navigate('/resumes/new', { state: { initialData: data } })
    } catch (err) {
      setError('Failed to parse PDF.')
      setLoading(false)
    }
  }

  const visibleDocuments =
    (user ? resumes : guestResumes).length > 0
      ? (user ? resumes : guestResumes).map((resume) => ({
          id: resume.id,
          title: resume.title || resume.personalDetails?.fullName || 'Untitled Resume',
          updatedAt: formatUpdated(resume.updatedAt),
          real: true,
        }))
      : sampleDocuments.map((document) => ({ ...document, real: false }))

  return (
    <Box className="dashboard-page">
      <Box className="dashboard-heading">
        <Typography component="h1" variant="h3">
          My Resumes
        </Typography>
        <Typography color="text.secondary">Manage and create AI-optimized resumes.</Typography>
      </Box>

      <Box className="creation-grid">
        <Card component={Link} to="/build-with-ai" className="creation-card" elevation={0}>
          <CardContent>
            <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
              <Box className="circle-action" sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <AutoAwesomeIcon />
              </Box>
              <Typography variant="h6">Build with AI</Typography>
              <Typography color="text.secondary">
                Provide rough notes and our AI will build your entire ATS-friendly resume.
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        <Card component="label" className="creation-card upload-card" elevation={0}>
          <input type="file" accept="application/pdf" hidden onChange={handleFileUpload} />
          <CardContent>
            <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
              <Box className="circle-action">
                <CloudUploadOutlinedIcon />
              </Box>
              <Typography variant="h6">Upload PDF for AI Parsing</Typography>
              <Typography color="text.secondary">
                We'll extract your data and structure it automatically.
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        <Card component={Link} to="/resumes/new" className="creation-card" elevation={0}>
          <CardContent>
            <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
              <Box className="circle-action">
                <AddIcon />
              </Box>
              <Typography variant="h6">Create from Scratch</Typography>
              <Typography color="text.secondary">
                Start fresh with our intelligent step-by-step builder.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Typography component="h2" variant="h5" sx={{ mt: 6, mb: 3 }}>
        Recent Documents
      </Typography>

      {error ? <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert> : null}

      {loading ? (
        <Stack sx={{ py: 8, alignItems: 'center' }}>
          <CircularProgress />
        </Stack>
      ) : (
        <Box className="document-grid">
          {visibleDocuments.map((document, index) => (
            <Card key={document.id} className={`document-card ${index === 0 ? 'is-active' : ''}`} elevation={0}>
              <Box className="document-skeleton">
                <Box className="sk-line short" />
                <Box className="sk-line long" />
                <Box className="sk-line medium" />
                <Box className="sk-line long lower" />
                <Box className="sk-line medium" />
                <Button component={Link} to={`/resumes/${document.id}/edit`} variant="contained" className="edit-resume-button">
                  Edit Resume
                </Button>
              </Box>
              <Box className="document-footer">
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h6" noWrap>
                    {document.title}
                  </Typography>
                  <Typography color="text.secondary">{document.updatedAt}</Typography>
                </Box>
                <IconButton
                  aria-label="document options"
                  onClick={() => {
                    if (document.real) {
                      void handleDelete(document.id)
                    }
                  }}
                >
                  <MoreHorizIcon />
                </IconButton>
              </Box>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  )
}
