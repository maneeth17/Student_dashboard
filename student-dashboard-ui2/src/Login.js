import React, { useEffect, useRef, useState } from "react";
import { loginUser, warmupBackend } from "./Api";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Snackbar,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import {
  authFieldSx,
  authOrbs,
  authPageSx,
  authPalette,
  authShellSx
} from "./authStyles";

const glassPanelSx = {
  borderRadius: 5,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.07)",
  backdropFilter: "blur(18px)"
};

export default function Login({ login }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: ""
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info"
  });
  const [backendStatus, setBackendStatus] = useState("warming");
  const warmupPromiseRef = useRef(null);

  const notify = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
    warmupPromiseRef.current = warmupBackend()
      .then(() => {
        setBackendStatus("ready");
      })
      .catch(() => {
        setBackendStatus("unreachable");
      });
  }, []);

  const handleLogin = async () => {
    if (!form.username || !form.password) {
      notify("Enter username and password", "warning");
      return;
    }

    try {
      if (warmupPromiseRef.current) {
        await warmupPromiseRef.current.catch(() => null);
      }

      const res = await loginUser({
        username: form.username,
        password: form.password
      });

      if (res.data?.token && res.data?.role) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);
        localStorage.setItem("username", res.data.username || form.username);
        login();
      } else {
        notify("Invalid credentials", "error");
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Login failed. Backend not reachable.";
      notify(message, "error");
    }
  };

  return (
    <Box sx={authPageSx}>
      {authOrbs.map((orb) => (
        <Box
          key={`${orb.width}-${orb.height}-${orb.top || orb.bottom}`}
          sx={{
            position: "absolute",
            borderRadius: "50%",
            filter: "blur(6px)",
            pointerEvents: "none",
            ...orb
          }}
        />
      ))}

      <Container maxWidth={false} disableGutters sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={authShellSx}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1.05fr 0.95fr" },
              position: "relative",
              zIndex: 1
            }}
          >
            <Box
              sx={{
                p: { xs: 3, md: 4.75 },
                borderRight: { xs: "none", lg: "1px solid rgba(255,255,255,0.10)" },
                borderBottom: { xs: "1px solid rgba(255,255,255,0.10)", lg: "none" },
                position: "relative"
              }}
            >
              <Chip
                icon={<AutoAwesomeRoundedIcon />}
                label="Student management platform"
                sx={{
                  mb: 3,
                  px: 1,
                  color: authPalette.textPrimary,
                  backgroundColor: authPalette.pillBg,
                  border: "1px solid rgba(255,255,255,0.14)"
                }}
              />
              <Typography
                sx={{
                  fontSize: { xs: "2.4rem", md: "3.7rem" },
                  lineHeight: 0.95,
                  fontWeight: 800,
                  letterSpacing: "-0.05em",
                  color: authPalette.textPrimary,
                  maxWidth: 520
                }}
              >
                Student ERP
                <Box component="span" sx={{ display: "block", color: "#9ce9ff" }}>
                  modern access
                </Box>
              </Typography>
              <Typography
                sx={{
                  mt: 2.5,
                  maxWidth: 540,
                  color: authPalette.textMuted,
                  fontSize: { xs: "1rem", md: "1.08rem" },
                  lineHeight: 1.8
                }}
              >
                Sign in to manage student records, monitor attendance day wise, and work inside a cleaner admin experience with faster actions and better visibility.
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.4} sx={{ mt: 3.5, flexWrap: "wrap" }}>
                <Chip
                  icon={<VerifiedUserRoundedIcon />}
                  label="Secure JWT login"
                  sx={{ color: authPalette.textPrimary, backgroundColor: authPalette.pillBg }}
                />
                <Chip
                  icon={<InsightsRoundedIcon />}
                  label="Live attendance insights"
                  sx={{ color: authPalette.textPrimary, backgroundColor: authPalette.pillBg }}
                />
              </Stack>

              <Box
                sx={{
                  mt: 4,
                  p: { xs: 2.2, md: 2.8 },
                  ...glassPanelSx
                }}
              >
                <Typography sx={{ color: authPalette.textPrimary, fontWeight: 700, fontSize: "1.05rem" }}>
                  Control panel highlights
                </Typography>
                <Stack spacing={1.4} sx={{ mt: 2 }}>
                  {[
                    "Role-based access for admin and student flows",
                    "Day-wise attendance records with monthly calendar tracking",
                    "Faster visibility into branch-wise and student-wise performance"
                  ].map((item) => (
                    <Box key={item} sx={{ display: "flex", gap: 1.2, alignItems: "flex-start" }}>
                      <Box
                        sx={{
                          mt: 0.8,
                          width: 9,
                          height: 9,
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #86e5ff, #4f7fff)",
                          flexShrink: 0
                        }}
                      />
                      <Typography sx={{ color: authPalette.textMuted, lineHeight: 1.7 }}>{item}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Box>

            <Box sx={{ p: { xs: 3, md: 4.75 }, display: "flex", alignItems: "center" }}>
              <Box sx={{ width: "100%", maxWidth: 460, mx: "auto" }}>
                <Typography sx={{ color: authPalette.textPrimary, fontSize: "2rem", fontWeight: 800 }}>
                  Login
                </Typography>
                <Typography sx={{ color: authPalette.textMuted, mt: 1, mb: 3.5, lineHeight: 1.7 }}>
                  Welcome back. Enter your credentials to continue to the dashboard.
                </Typography>
                <Typography sx={{ color: authPalette.textMuted, mb: 2, fontSize: "0.95rem" }}>
                  {backendStatus === "warming" && "Connecting to server. First load after deploy can take a bit."}
                  {backendStatus === "ready" && "Server is ready."}
                  {backendStatus === "unreachable" && "Server is not reachable yet. Login may fail until it wakes up."}
                </Typography>

                <Stack spacing={2}>
                  <TextField
                    label="Username"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    onKeyDown={(event) => event.key === "Enter" && handleLogin()}
                    sx={authFieldSx}
                    InputProps={{
                      startAdornment: (
                        <PersonOutlineRoundedIcon sx={{ mr: 1.1, color: "rgba(223, 234, 255, 0.82)" }} />
                      )
                    }}
                  />

                  <TextField
                    label="Password"
                    type="password"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    onKeyDown={(event) => event.key === "Enter" && handleLogin()}
                    sx={authFieldSx}
                    InputProps={{
                      startAdornment: (
                        <LockOutlinedIcon sx={{ mr: 1.1, color: "rgba(223, 234, 255, 0.82)" }} />
                      )
                    }}
                  />
                </Stack>

                <Button
                  variant="contained"
                  fullWidth
                  endIcon={<ArrowForwardRoundedIcon />}
                  sx={{
                    mt: 3,
                    py: 1.45,
                    borderRadius: 3,
                    fontSize: "1rem",
                    fontWeight: 800,
                    textTransform: "none",
                    background: authPalette.primaryButton,
                    boxShadow: "0 18px 40px rgba(67,135,255,0.30)",
                    "&:hover": {
                      background: authPalette.primaryButtonHover
                    }
                  }}
                  onClick={handleLogin}
                >
                  Enter Dashboard
                </Button>

                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    ...glassPanelSx,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap"
                  }}
                >
                  <Box>
                    <Typography sx={{ color: authPalette.textPrimary, fontWeight: 700 }}>
                      New here?
                    </Typography>
                    <Typography sx={{ color: authPalette.textMuted, fontSize: "0.95rem", mt: 0.4 }}>
                      Create your account and continue into the dashboard.
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/register")}
                    sx={{
                      borderRadius: 999,
                      px: 2.2,
                      color: authPalette.textPrimary,
                      borderColor: "rgba(255,255,255,0.24)"
                    }}
                  >
                    Register
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2800}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
