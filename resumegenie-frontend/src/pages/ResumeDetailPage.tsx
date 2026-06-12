import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import DownloadIcon from '@mui/icons-material/Download'
import EditIcon from '@mui/icons-material/Edit'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { getApiError } from '../api/client'
import { getResume } from '../api/resumeApi'
import { useAuth } from '../auth/AuthContext'
import { SectionHeader } from '../components/SectionHeader'
import type { ResumeResponse } from '../types'
import { getGuestResume } from '../utils/guestResumes'

export function ResumeDetailPage() {
  const { id } = useParams()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [resume, setResume] = useState<ResumeResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadResume() {
      if (!id) {
        return
      }

      try {
        setResume(id.startsWith('guest-') ? getGuestResume(id) : await getResume(id))
      } catch (err) {
        setError(getApiError(err))
      } finally {
        setLoading(false)
      }
    }

    loadResume()
  }, [id])

  function handleDownload() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } })
      return
    }

    window.print()
  }

  if (loading) {
    return (
      <Stack sx={{ py: 8, alignItems: 'center' }}>
        <CircularProgress />
      </Stack>
    )
  }

  if (error || !resume) {
    return <Alert severity="error">{error || 'Resume not found'}</Alert>
  }

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3, justifyContent: 'space-between' }}>
        <SectionHeader title={resume.title} subtitle={resume.targetRole || 'Resume preview'} />
        <Stack direction="row" spacing={1} sx={{ alignSelf: 'start', flexWrap: 'wrap' }}>
          <Button component={Link} to={`/resumes/${resume.id}/edit`} variant="outlined" startIcon={<EditIcon />}>
            Edit
          </Button>
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleDownload}>
            Download PDF
          </Button>
          <Button component={Link} to="/ai-tools" variant="contained" startIcon={<AutoAwesomeIcon />}>
            Rewrite
          </Button>
        </Stack>
      </Stack>

      <Card elevation={0} className="preview-card print-area">
        <CardContent>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h3">{resume.personalDetails?.fullName || 'Candidate Name'}</Typography>
              <Typography color="text.secondary">
                {[
                  resume.personalDetails?.email,
                  resume.personalDetails?.phone,
                  resume.personalDetails?.location,
                ]
                  .filter(Boolean)
                  .join(' | ')}
              </Typography>
            </Box>

            <PreviewSection title="Skills">
              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                {resume.skills?.map((skill) => <Chip key={skill} label={skill} />)}
              </Stack>
            </PreviewSection>

            <PreviewSection title="Experience">
              {resume.experience?.map((item) => (
                <Box key={`${item.company}-${item.role}`}>
                  <Typography variant="subtitle1">{item.role}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.company} | {item.startDate} - {item.endDate}
                  </Typography>
                  <BulletList items={item.bullets} />
                </Box>
              ))}
            </PreviewSection>

            <PreviewSection title="Projects">
              {resume.projects?.map((project) => (
                <Box key={project.name}>
                  <Typography variant="subtitle1">{project.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {project.description}
                  </Typography>
                  <Stack direction="row" spacing={1} useFlexGap sx={{ my: 1, flexWrap: 'wrap' }}>
                    {project.technologies?.map((tech) => <Chip key={tech} label={tech} size="small" />)}
                  </Stack>
                  <BulletList items={project.bullets} />
                </Box>
              ))}
            </PreviewSection>

            <PreviewSection title="Education">
              {resume.education?.map((item) => (
                <Box key={`${item.institution}-${item.degree}`}>
                  <Typography variant="subtitle1">{item.degree}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.institution} | {item.field} | {item.startDate} - {item.endDate}
                  </Typography>
                  {item.score ? <Typography variant="body2">Score: {item.score}</Typography> : null}
                </Box>
              ))}
            </PreviewSection>

            <PreviewSection title="Achievements">
              <BulletList items={resume.achievements} />
            </PreviewSection>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}

function PreviewSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Stack spacing={1.5}>
      <Divider />
      <Typography variant="h6">{title}</Typography>
      {children}
    </Stack>
  )
}

function BulletList({ items = [] }: { items?: string[] }) {
  if (items.length === 0) {
    return null
  }

  return (
    <Box component="ul" sx={{ pl: 3, my: 1 }}>
      {items.map((item) => (
        <Typography component="li" key={item} variant="body2" sx={{ mb: 0.75 }}>
          {item}
        </Typography>
      ))}
    </Box>
  )
}
