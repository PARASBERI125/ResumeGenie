import LogoutIcon from '@mui/icons-material/Logout'
import {
  AppBar,
  Box,
  Button,
  Container,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: '#111827',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 58, md: 68 }, px: { xs: 2.5, md: 3 } }}>
          <Stack component={Link} to="/" direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
            <Box className="brand-mark">R</Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              ResumeGenie
            </Typography>
          </Stack>
          <Box sx={{ flexGrow: 1 }} />
          {user ? (
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ display: { xs: 'none', sm: 'block' }, maxWidth: 220 }}
                noWrap
              >
                {user.email}
              </Typography>
              <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
                Log out
              </Button>
            </Stack>
          ) : (
            <Stack direction="row" spacing={{ xs: 1, sm: 2 }} sx={{ alignItems: 'center' }}>
              <Button component={Link} to="/login" color="inherit" sx={{ color: 'text.secondary' }}>
                Log in
              </Button>
              <Button component={Link} to="/register" variant="contained">
                Sign Up
              </Button>
            </Stack>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, lg: 10 }, py: { xs: 4, md: 7 } }}>
        <Outlet />
      </Container>
    </Box>
  )
}
