import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Link as MuiLink,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { getApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";

export function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register({ fullName, email, password });
      navigate("/", { replace: true });
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box className="auth-page">
      <Paper className="auth-panel" elevation={0}>
        <Stack spacing={3}>
          <Stack spacing={1} sx={{ alignItems: "center" }}>
            <Avatar sx={{ bgcolor: "secondary.main" }}>
              <PersonAddAltIcon />
            </Avatar>
            <Typography variant="h4">Create account</Typography>
            <Typography color="text.secondary" sx={{ textAlign: "center" }}>
              Start a clean workspace for your resumes.
            </Typography>
          </Stack>

          {error ? <Alert severity="error">{error}</Alert> : null}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Full name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                helperText="At least 8 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                fullWidth
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create account"}
              </Button>
            </Stack>
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center" }}
          >
            Already have an account?{" "}
            <MuiLink component={Link} to="/login">
              Sign in
            </MuiLink>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
