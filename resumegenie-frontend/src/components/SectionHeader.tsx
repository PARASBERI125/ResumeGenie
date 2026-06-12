import { Stack, Typography } from '@mui/material'

type SectionHeaderProps = {
  title: string
  subtitle?: string
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <Stack spacing={0.5} sx={{ mb: 3 }}>
      <Typography variant="h4">{title}</Typography>
      {subtitle ? (
        <Typography variant="body1" color="text.secondary">
          {subtitle}
        </Typography>
      ) : null}
    </Stack>
  )
}
