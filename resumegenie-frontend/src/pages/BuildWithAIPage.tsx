import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { buildResume } from '../api/aiApi'
import { getApiError } from '../api/client'
import { SectionHeader } from '../components/SectionHeader'

export function BuildWithAIPage() {
  const navigate = useNavigate()
  const [targetRole, setTargetRole] = useState('')
  const [basicDetails, setBasicDetails] = useState('')
  const [experienceNotes, setExperienceNotes] = useState('')
  const [educationNotes, setEducationNotes] = useState('')
  const [projectNotes, setProjectNotes] = useState('')
  const [skillsNotes, setSkillsNotes] = useState('')
  const [achievementsNotes, setAchievementsNotes] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await buildResume({
        targetRole,
        basicDetails,
        experienceNotes,
        educationNotes,
        projectNotes,
        skillsNotes,
        achievementsNotes,
      })
      navigate('/resumes/new', { state: { initialData: response } })
    } catch (err) {
      setError(getApiError(err))
      setLoading(false)
    }
  }

  return (
    <Box>
      <SectionHeader
        title="Build with AI"
        subtitle="Provide rough notes and our AI will build a complete, professional, ATS-friendly resume."
      />

      {error ? <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert> : null}

      <Card elevation={0} sx={{ maxWidth: 800, mx: 'auto' }}>
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <Box>
                <Typography variant="h6" gutterBottom>Target Role</Typography>
                <TextField
                  placeholder="e.g. Senior Frontend Engineer"
                  value={targetRole}
                  onChange={(event) => setTargetRole(event.target.value)}
                  required
                  fullWidth
                />
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom>Basic Details</Typography>
                <TextField
                  placeholder="Name, Email, Phone, LinkedIn URL..."
                  value={basicDetails}
                  onChange={(event) => setBasicDetails(event.target.value)}
                  multiline
                  minRows={2}
                  fullWidth
                />
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom>Experience Notes</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  List your past roles, companies, and rough ideas of what you accomplished. We'll turn these into impactful bullet points.
                </Typography>
                <TextField
                  placeholder="Worked at Google from 2020-2023. Built a scalable API using Node.js..."
                  value={experienceNotes}
                  onChange={(event) => setExperienceNotes(event.target.value)}
                  multiline
                  minRows={4}
                  fullWidth
                />
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom>Education Notes</Typography>
                <TextField
                  placeholder="BS in Computer Science from MIT, graduated 2019..."
                  value={educationNotes}
                  onChange={(event) => setEducationNotes(event.target.value)}
                  multiline
                  minRows={2}
                  fullWidth
                />
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom>Project Notes</Typography>
                <TextField
                  placeholder="Built a task manager app using React and Firebase..."
                  value={projectNotes}
                  onChange={(event) => setProjectNotes(event.target.value)}
                  multiline
                  minRows={3}
                  fullWidth
                />
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom>Skills & Tools</Typography>
                <TextField
                  placeholder="JavaScript, TypeScript, React, Node.js, AWS..."
                  value={skillsNotes}
                  onChange={(event) => setSkillsNotes(event.target.value)}
                  multiline
                  minRows={2}
                  fullWidth
                />
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom>Achievements Notes</Typography>
                <TextField
                  placeholder="Won hackathon 2021, Employee of the month..."
                  value={achievementsNotes}
                  onChange={(event) => setAchievementsNotes(event.target.value)}
                  multiline
                  minRows={2}
                  fullWidth
                />
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<AutoAwesomeIcon />}
                disabled={loading}
                sx={{ py: 1.5 }}
              >
                {loading ? 'Generating Resume (this might take a minute)...' : 'Generate Full Resume'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
