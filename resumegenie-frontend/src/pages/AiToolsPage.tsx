import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { getApiError } from '../api/client'
import { rewriteText } from '../api/aiApi'
import { SectionHeader } from '../components/SectionHeader'

const sectionTypes = ['Summary', 'Experience', 'Project', 'Achievement', 'Skills']

export function AiToolsPage() {
  const [targetRole, setTargetRole] = useState('')
  const [sectionType, setSectionType] = useState('Experience')
  const [originalText, setOriginalText] = useState('')
  const [improvedText, setImprovedText] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setImprovedText('')
    setLoading(true)

    try {
      const response = await rewriteText({ targetRole, sectionType, originalText })
      setImprovedText(response.improvedText)
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setLoading(false)
    }
  }

  async function copyText() {
    await navigator.clipboard.writeText(improvedText)
  }

  return (
    <Box>
      <SectionHeader
        title="AI Tools"
        subtitle="Rewrite one section at a time using the backend AI service."
      />

      {error ? <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert> : null}

      <Box className="ai-grid">
        <Card elevation={0}>
          <CardContent>
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                <TextField
                  label="Target role"
                  value={targetRole}
                  onChange={(event) => setTargetRole(event.target.value)}
                  required
                  fullWidth
                />
                <TextField
                  select
                  label="Section type"
                  value={sectionType}
                  onChange={(event) => setSectionType(event.target.value)}
                  fullWidth
                >
                  {sectionTypes.map((item) => (
                    <MenuItem key={item} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Original text"
                  value={originalText}
                  onChange={(event) => setOriginalText(event.target.value)}
                  multiline
                  minRows={10}
                  required
                  fullWidth
                />
                <Button type="submit" variant="contained" size="large" startIcon={<AutoAwesomeIcon />} disabled={loading}>
                  {loading ? 'Rewriting...' : 'Rewrite section'}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        <Card elevation={0} className="result-card">
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Improved text</Typography>
                <Button
                  variant="outlined"
                  startIcon={<ContentCopyIcon />}
                  disabled={!improvedText}
                  onClick={copyText}
                >
                  Copy
                </Button>
              </Stack>
              <Typography color={improvedText ? 'text.primary' : 'text.secondary'} sx={{ whiteSpace: 'pre-wrap' }}>
                {improvedText || 'The rewritten section will appear here.'}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}
