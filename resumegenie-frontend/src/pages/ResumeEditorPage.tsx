import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined'
import DownloadIcon from '@mui/icons-material/Download'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import TuneIcon from '@mui/icons-material/Tune'
import ViewQuiltOutlinedIcon from '@mui/icons-material/ViewQuiltOutlined'
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { getApiError } from '../api/client'
import { createResume, getResume, updateResume } from '../api/resumeApi'
import { rewriteText } from '../api/aiApi'
import { useAuth } from '../auth/AuthContext'
import type { ResumeRequest, ResumeResponse } from '../types'
import { getGuestResume, saveGuestResume } from '../utils/guestResumes'

type FormEducation = {
  id: string
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string
  score: string
}

type FormExperience = {
  id: string
  company: string
  role: string
  startDate: string
  endDate: string
  bullets: string
}

type FormProject = {
  id: string
  name: string
  description: string
  technologies: string
  bullets: string
}

type ResumeFormState = {
  title: string
  targetRole: string
  fullName: string
  email: string
  phone: string
  location: string
  linkedIn: string
  github: string
  education: FormEducation[]
  experience: FormExperience[]
  projects: FormProject[]
  skills: string
  achievements: string
}

type SectionKey = 'personal' | 'experience' | 'education' | 'skills' | 'layout' | 'projects'
type ResumeEditorLocationState = { initialData?: ResumeResponse }
type UpdateResumeField = <K extends keyof ResumeFormState>(field: K, value: ResumeFormState[K]) => void

const emptyForm: ResumeFormState = {
  title: '',
  targetRole: '',
  fullName: '',
  email: '',
  phone: '',
  location: '',
  linkedIn: '',
  github: '',
  education: [],
  experience: [],
  projects: [],
  skills: '',
  achievements: '',
}

const sidebarSections: Array<{ key: SectionKey; label: string; icon: ReactNode }> = [
  { key: 'personal', label: 'Personal Info', icon: <PersonOutlineOutlinedIcon /> },
  { key: 'experience', label: 'Work Experience', icon: <BusinessCenterOutlinedIcon /> },
  { key: 'education', label: 'Education', icon: <SchoolOutlinedIcon /> },
  { key: 'skills', label: 'Skills & Tools', icon: <WorkspacePremiumOutlinedIcon /> },
  { key: 'layout', label: 'Layout & Theme', icon: <ViewQuiltOutlinedIcon /> },
  { key: 'projects', label: 'Projects', icon: <TuneIcon /> },
]

function lines(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function commaList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function dateRange(startDate: string, endDate: string) {
  return [startDate, endDate].filter(Boolean).join(' - ')
}

export function ResumeEditorPage() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const initialData = (location.state as ResumeEditorLocationState | null)?.initialData
  const [form, setForm] = useState<ResumeFormState>(emptyForm)
  const [activeSection, setActiveSection] = useState<SectionKey>('experience')
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadResume() {
      // If we received AI-generated initial data, use it!
      if (!id && initialData) {
        setForm({
          title: initialData.title ?? '',
          targetRole: initialData.targetRole ?? '',
          fullName: initialData.personalDetails?.fullName ?? '',
          email: initialData.personalDetails?.email ?? '',
          phone: initialData.personalDetails?.phone ?? '',
          location: initialData.personalDetails?.location ?? '',
          linkedIn: initialData.personalDetails?.linkedIn ?? '',
          github: initialData.personalDetails?.github ?? '',
          education: (initialData.education ?? []).map(ed => ({
            id: crypto.randomUUID(),
            institution: ed.institution ?? '',
            degree: ed.degree ?? '',
            field: ed.field ?? '',
            startDate: ed.startDate ?? '',
            endDate: ed.endDate ?? '',
            score: ed.score ?? '',
          })),
          experience: (initialData.experience ?? []).map(ex => ({
            id: crypto.randomUUID(),
            company: ex.company ?? '',
            role: ex.role ?? '',
            startDate: ex.startDate ?? '',
            endDate: ex.endDate ?? '',
            bullets: ex.bullets?.join('\n') ?? '',
          })),
          projects: (initialData.projects ?? []).map(pr => ({
            id: crypto.randomUUID(),
            name: pr.name ?? '',
            description: pr.description ?? '',
            technologies: pr.technologies?.join(', ') ?? '',
            bullets: pr.bullets?.join('\n') ?? '',
          })),
          skills: initialData.skills?.join(', ') ?? '',
          achievements: initialData.achievements?.join('\n') ?? '',
        })
        setLoading(false)
        return
      }

      if (!id) {
        setLoading(false)
        return
      }

      try {
        const resume = id.startsWith('guest-') ? getGuestResume(id) : await getResume(id)
        if (!resume) {
          setError('Resume not found')
          return
        }

        setForm({
          title: resume.title ?? '',
          targetRole: resume.targetRole ?? '',
          fullName: resume.personalDetails?.fullName ?? '',
          email: resume.personalDetails?.email ?? '',
          phone: resume.personalDetails?.phone ?? '',
          location: resume.personalDetails?.location ?? '',
          linkedIn: resume.personalDetails?.linkedIn ?? '',
          github: resume.personalDetails?.github ?? '',
          education: (resume.education ?? []).map(ed => ({
            id: crypto.randomUUID(),
            institution: ed.institution ?? '',
            degree: ed.degree ?? '',
            field: ed.field ?? '',
            startDate: ed.startDate ?? '',
            endDate: ed.endDate ?? '',
            score: ed.score ?? '',
          })),
          experience: (resume.experience ?? []).map(ex => ({
            id: crypto.randomUUID(),
            company: ex.company ?? '',
            role: ex.role ?? '',
            startDate: ex.startDate ?? '',
            endDate: ex.endDate ?? '',
            bullets: ex.bullets?.join('\n') ?? '',
          })),
          projects: (resume.projects ?? []).map(pr => ({
            id: crypto.randomUUID(),
            name: pr.name ?? '',
            description: pr.description ?? '',
            technologies: pr.technologies?.join(', ') ?? '',
            bullets: pr.bullets?.join('\n') ?? '',
          })),
          skills: resume.skills?.join(', ') ?? '',
          achievements: resume.achievements?.join('\n') ?? '',
        })
      } catch (err) {
        setError(getApiError(err))
      } finally {
        setLoading(false)
      }
    }

    loadResume()
  }, [id, initialData])

  const updateField: UpdateResumeField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const request = useMemo<ResumeRequest>(
    () => ({
      userId: user?.userId ?? 0,
      title: form.title || `${form.targetRole || 'Untitled'} Resume`,
      targetRole: form.targetRole,
      personalDetails: {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        location: form.location,
        linkedIn: form.linkedIn,
        github: form.github,
      },
      education: form.education.map((ed) => ({
        institution: ed.institution,
        degree: ed.degree,
        field: ed.field,
        startDate: ed.startDate,
        endDate: ed.endDate,
        score: ed.score,
      })),
      experience: form.experience.map((ex) => ({
        company: ex.company,
        role: ex.role,
        startDate: ex.startDate,
        endDate: ex.endDate,
        bullets: lines(ex.bullets),
      })),
      projects: form.projects.map((pr) => ({
        name: pr.name,
        description: pr.description,
        technologies: commaList(pr.technologies),
        bullets: lines(pr.bullets),
      })),
      skills: commaList(form.skills),
      achievements: lines(form.achievements),
    }),
    [form, user],
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const saved = user
        ? id && !id.startsWith('guest-')
          ? await updateResume(id, request)
          : await createResume(request)
        : saveGuestResume(request, id?.startsWith('guest-') ? id : undefined)
      navigate(`/resumes/${saved.id}`)
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setSaving(false)
    }
  }

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

  return (
    <Box className="editor-shell">
      <Box className="editor-sidebar">
        <Button component={Link} to="/" startIcon={<ArrowBackIcon />} className="back-link">
          Back to Dashboard
        </Button>
        <Stack spacing={1} className="step-list">
          {sidebarSections.map((section) => (
            <Button
              key={section.key}
              startIcon={section.icon}
              onClick={() => setActiveSection(section.key)}
              className={`step-button ${activeSection === section.key ? 'active' : ''}`}
            >
              {section.label}
            </Button>
          ))}
        </Stack>
      </Box>

      <Box component="form" onSubmit={handleSubmit} className="editor-form">
        {error ? <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert> : null}
        {renderEditorSection(activeSection, form, updateField, setForm)}
        <Stack direction="row" spacing={1.5} sx={{ mt: 3, justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Saving...' : 'Save Resume'}
          </Button>
        </Stack>
      </Box>

      <Box className="live-preview-pane">
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }} className="preview-toolbar">
          <Typography variant="h6">Live Preview</Typography>
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleDownload}>
            Download PDF
          </Button>
        </Stack>
        <ResumePreview form={form} />
      </Box>
    </Box>
  )
}

function renderEditorSection(
  section: SectionKey,
  form: ResumeFormState,
  updateField: UpdateResumeField,
  setForm: React.Dispatch<React.SetStateAction<ResumeFormState>>
) {
  if (section === 'personal') {
    return (
      <EditorSection title="Personal Info" subtitle="Add the core contact details shown at the top of the resume.">
        <TwoColumn>
          <TextField label="Resume Title" value={form.title} onChange={(e) => updateField('title', e.target.value)} />
          <TextField label="Target Role" value={form.targetRole} onChange={(e) => updateField('targetRole', e.target.value)} />
          <TextField label="Full Name" value={form.fullName} onChange={(e) => updateField('fullName', e.target.value)} />
          <TextField label="Email" value={form.email} onChange={(e) => updateField('email', e.target.value)} />
          <TextField label="Phone" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
          <TextField label="Location" value={form.location} onChange={(e) => updateField('location', e.target.value)} />
          <TextField label="LinkedIn" value={form.linkedIn} onChange={(e) => updateField('linkedIn', e.target.value)} />
          <TextField label="GitHub" value={form.github} onChange={(e) => updateField('github', e.target.value)} />
        </TwoColumn>
      </EditorSection>
    )
  }

  if (section === 'education') {
    const addEducation = () => setForm(f => ({ ...f, education: [...f.education, { id: crypto.randomUUID(), institution: '', degree: '', field: '', startDate: '', endDate: '', score: '' }] }))
    const updateEd = (id: string, field: keyof FormEducation, value: string) => setForm(f => ({ ...f, education: f.education.map(e => e.id === id ? { ...e, [field]: value } : e) }))
    const deleteEd = (id: string) => setForm(f => ({ ...f, education: f.education.filter(e => e.id !== id) }))

    return (
      <EditorSection title="Education" subtitle="Add your relevant education entries.">
        {form.education.map((ed, i) => (
          <Card key={ed.id} elevation={0} className="experience-card" sx={{ mb: 3 }}>
            <CardContent>
              <Stack spacing={2.5}>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Education {i + 1}</Typography>
                  <Button color="error" onClick={() => deleteEd(ed.id)}>Delete</Button>
                </Stack>
                <TwoColumn>
                  <TextField label="Institution" value={ed.institution} onChange={(e) => updateEd(ed.id, 'institution', e.target.value)} />
                  <TextField label="Degree" value={ed.degree} onChange={(e) => updateEd(ed.id, 'degree', e.target.value)} />
                  <TextField label="Field" value={ed.field} onChange={(e) => updateEd(ed.id, 'field', e.target.value)} />
                  <TextField label="Score" value={ed.score} onChange={(e) => updateEd(ed.id, 'score', e.target.value)} />
                  <TextField label="Start Date" value={ed.startDate} onChange={(e) => updateEd(ed.id, 'startDate', e.target.value)} />
                  <TextField label="End Date" value={ed.endDate} onChange={(e) => updateEd(ed.id, 'endDate', e.target.value)} />
                </TwoColumn>
              </Stack>
            </CardContent>
          </Card>
        ))}
        <Button variant="outlined" onClick={addEducation}>+ Add Education</Button>
      </EditorSection>
    )
  }

  if (section === 'skills') {
    return (
      <EditorSection title="Skills & Tools" subtitle="Keep skills concise and comma separated.">
        <TextField label="Skills" value={form.skills} onChange={(e) => updateField('skills', e.target.value)} fullWidth helperText="Comma separated" />
        <TextField
          label="Achievements"
          value={form.achievements}
          onChange={(e) => updateField('achievements', e.target.value)}
          multiline
          minRows={5}
          fullWidth
          helperText="Write one achievement per line"
        />
      </EditorSection>
    )
  }

  if (section === 'layout') {
    return (
      <EditorSection title="Layout & Theme" subtitle="The current template follows the compact professional layout in the preview.">
        <Card elevation={0} className="setting-card">
          <CardContent>
            <Typography variant="h6">Classic single-column resume</Typography>
            <Typography color="text.secondary">Dark builder, white PDF preview, strong section dividers.</Typography>
          </CardContent>
        </Card>
      </EditorSection>
    )
  }

  if (section === 'projects') {
    const addProject = () => setForm(f => ({ ...f, projects: [...f.projects, { id: crypto.randomUUID(), name: '', description: '', technologies: '', bullets: '' }] }))
    const updatePr = (id: string, field: keyof FormProject, value: string) => setForm(f => ({ ...f, projects: f.projects.map(p => p.id === id ? { ...p, [field]: value } : p) }))
    const deletePr = (id: string) => setForm(f => ({ ...f, projects: f.projects.filter(p => p.id !== id) }))

    return (
      <EditorSection title="Projects" subtitle="Set project details and extra resume content.">
        {form.projects.map((pr, i) => (
          <Card key={pr.id} elevation={0} className="experience-card" sx={{ mb: 3 }}>
            <CardContent>
              <Stack spacing={2.5}>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Project {i + 1}</Typography>
                  <Button color="error" onClick={() => deletePr(pr.id)}>Delete</Button>
                </Stack>
                <TwoColumn>
                  <TextField label="Project Name" value={pr.name} onChange={(e) => updatePr(pr.id, 'name', e.target.value)} />
                  <TextField label="Technologies" value={pr.technologies} onChange={(e) => updatePr(pr.id, 'technologies', e.target.value)} helperText="Comma separated" />
                </TwoColumn>
                <TextField label="Project Description" value={pr.description} onChange={(e) => updatePr(pr.id, 'description', e.target.value)} fullWidth />
                <TextField
                  label="Project Bullets"
                  value={pr.bullets}
                  onChange={(e) => updatePr(pr.id, 'bullets', e.target.value)}
                  multiline
                  minRows={4}
                  fullWidth
                  helperText="Write one bullet per line"
                />
              </Stack>
            </CardContent>
          </Card>
        ))}
        <Button variant="outlined" onClick={addProject}>+ Add Project</Button>
      </EditorSection>
    )
  }

  const addExperience = () => setForm(f => ({ ...f, experience: [...f.experience, { id: crypto.randomUUID(), company: '', role: '', startDate: '', endDate: '', bullets: '' }] }))
  const updateEx = (id: string, field: keyof FormExperience, value: string) => setForm(f => ({ ...f, experience: f.experience.map(e => e.id === id ? { ...e, [field]: value } : e) }))
  const deleteEx = (id: string) => setForm(f => ({ ...f, experience: f.experience.filter(e => e.id !== id) }))

  const enhanceBullets = async (id: string, bullets: string, targetRole: string) => {
    if (!bullets.trim()) return
    try {
      const response = await rewriteText({
        targetRole: targetRole || 'Professional',
        sectionType: 'experience bullets',
        originalText: bullets,
      })
      updateEx(id, 'bullets', response.improvedText)
    } catch (err) {
      alert(getApiError(err))
    }
  }

  return (
    <EditorSection title="Work Experience" subtitle="Add your relevant experience. Use the magic wand to enhance bullet points.">
      {form.experience.map((ex, i) => (
        <Card key={ex.id} elevation={0} className="experience-card" sx={{ mb: 3 }}>
          <CardContent>
            <Stack spacing={2.5}>
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">Experience {i + 1}</Typography>
                <Button color="error" onClick={() => deleteEx(ex.id)}>Delete</Button>
              </Stack>
              <TwoColumn>
                <TextField label="Job Title" value={ex.role} onChange={(e) => updateEx(ex.id, 'role', e.target.value)} />
                <TextField label="Company" value={ex.company} onChange={(e) => updateEx(ex.id, 'company', e.target.value)} />
                <TextField label="Start Date" value={ex.startDate} onChange={(e) => updateEx(ex.id, 'startDate', e.target.value)} />
                <TextField label="End Date" value={ex.endDate} onChange={(e) => updateEx(ex.id, 'endDate', e.target.value)} />
              </TwoColumn>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  label="Description & Achievements"
                  value={ex.bullets}
                  onChange={(e) => updateEx(ex.id, 'bullets', e.target.value)}
                  multiline
                  minRows={5}
                  fullWidth
                />
                <Tooltip title="Enhance bullets">
                  <IconButton 
                    className="sparkle-button" 
                    aria-label="enhance bullets"
                    onClick={() => enhanceBullets(ex.id, ex.bullets, form.targetRole)}
                  >
                    <AutoAwesomeIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ))}
      <Button variant="outlined" onClick={addExperience}>+ Add Experience</Button>
    </EditorSection>
  )
}

function EditorSection({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <Stack spacing={3} className="section-editor">
      <Box>
        <Typography component="h1" variant="h4">
          {title}
        </Typography>
        <Typography color="text.secondary">{subtitle}</Typography>
      </Box>
      {children}
    </Stack>
  )
}

function TwoColumn({ children }: { children: ReactNode }) {
  return <Box className="form-grid">{children}</Box>
}

function ResumePreview({ form }: { form: ResumeFormState }) {
  const skills = commaList(form.skills)
  const achievements = lines(form.achievements)

  return (
    <Box className="resume-preview print-area">
      <Typography component="h2" className="preview-name">
        {form.fullName || 'ALEX DEVELOPER'}
      </Typography>
      <Typography className="preview-contact">
        {[form.email || 'alex@example.com', form.phone || '(555) 123-4567', form.linkedIn || 'linkedin.com/in/alexdev']
          .filter(Boolean)
          .join('  |  ')}
      </Typography>

      {form.experience.length > 0 && (
        <PreviewSection title="Experience">
          {form.experience.map((ex) => (
            <Box key={ex.id} sx={{ mb: 2 }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}>
                <Typography className="preview-role">{ex.role || 'Software Engineer'}</Typography>
                <Typography>{dateRange(ex.startDate || 'Jan 2021', ex.endDate || 'Present')}</Typography>
              </Stack>
              <Typography>{ex.company || 'Company'}</Typography>
              <PreviewBullets items={lines(ex.bullets)} />
            </Box>
          ))}
        </PreviewSection>
      )}

      {form.projects.length > 0 && (
        <PreviewSection title="Projects">
          {form.projects.map((pr) => (
            <Box key={pr.id} sx={{ mb: 2 }}>
              <Typography className="preview-role">{pr.name || 'Project Name'}</Typography>
              <Typography variant="body2" color="text.secondary">{pr.description}</Typography>
              <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 0.5 }}>{pr.technologies}</Typography>
              <PreviewBullets items={lines(pr.bullets)} />
            </Box>
          ))}
        </PreviewSection>
      )}

      {form.education.length > 0 && (
        <PreviewSection title="Education">
          {form.education.map((ed) => (
            <Box key={ed.id} sx={{ mb: 1 }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}>
                <Typography className="preview-role">{[ed.degree || 'B.S.', ed.field || 'Computer Science'].filter(Boolean).join(' in ')}</Typography>
                <Typography>{ed.endDate || 'May 2020'}</Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography>{ed.institution || 'University of Technology'}</Typography>
                {ed.score && <Typography>Score: {ed.score}</Typography>}
              </Stack>
            </Box>
          ))}
        </PreviewSection>
      )}

      {skills.length > 0 ? (
        <PreviewSection title="Skills">
          <Typography>{skills.join(' | ')}</Typography>
        </PreviewSection>
      ) : null}

      {achievements.length > 0 ? (
        <PreviewSection title="Achievements">
          <PreviewBullets items={achievements} />
        </PreviewSection>
      ) : null}
    </Box>
  )
}

function PreviewSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box className="preview-section">
      <Typography component="h3">{title}</Typography>
      {children}
    </Box>
  )
}

function PreviewBullets({ items }: { items: string[] }) {
  return (
    <Box component="ul" className="preview-bullets">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </Box>
  )
}
