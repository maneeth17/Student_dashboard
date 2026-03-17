import React, { useState } from "react";
import { registerUser } from "./Api";
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
import HowToRegRoundedIcon from "@mui/icons-material/HowToRegRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
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

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: ""
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info"
  });

  const notify = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleRegister = async () => {
    if (!form.username || !form.password || !form.confirmPassword) {
      notify("Please fill all fields", "warning");
      return;
    }

    if (form.password !== form.confirmPassword) {
      notify("Passwords do not match", "warning");
      return;
    }

    try {
      await registerUser({
        username: form.username,
        password: form.password
      });

      // On success, notify the user and redirect them to the login page.
      notify("Registered successfully. Please login.", "success");
      navigate("/login");
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Registration failed. Username may already exist.";
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
              gridTemplateColumns: { xs: "1fr", lg: "0.98fr 1.02fr" },
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
                label="Smart onboarding"
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
                  fontSize: { xs: "2.35rem", md: "3.55rem" },
                  lineHeight: 0.97,
                  fontWeight: 800,
                  letterSpacing: "-0.05em",
                  color: authPalette.textPrimary,
                  maxWidth: 520
                }}
              >
                Create your
                <Box component="span" sx={{ display: "block", color: "#9ce9ff" }}>
                  student account
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
                Register once and move straight into the attendance calendar, student roster, and analytics modules with a cleaner modern interface.
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.4} sx={{ mt: 3.5, flexWrap: "wrap" }}>
                <Chip
                  icon={<HowToRegRoundedIcon />}
                  label="Quick account setup"
                  sx={{ color: authPalette.textPrimary, backgroundColor: authPalette.pillBg }}
                />
                <Chip
                  icon={<CalendarMonthRoundedIcon />}
                  label="Attendance-ready workspace"
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
                  After signup you can
                </Typography>
                <Stack spacing={1.4} sx={{ mt: 2 }}>
                  {[
                    "Access secure role-based login with JWT authentication",
                    "Track attendance month by month from a calendar-driven interface",
                    "Manage and review student records inside a single ERP flow"
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
                  Register
                </Typography>
                <Typography sx={{ color: authPalette.textMuted, mt: 1, mb: 3.5, lineHeight: 1.7 }}>
                  Create your credentials and move back to login once registration is complete.
                </Typography>

                <Stack spacing={2}>
                  <TextField
                    label="Username"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    onKeyDown={(event) => event.key === "Enter" && handleRegister()}
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
                    onKeyDown={(event) => event.key === "Enter" && handleRegister()}
                    sx={authFieldSx}
                    InputProps={{
                      startAdornment: (
                        <LockOutlinedIcon sx={{ mr: 1.1, color: "rgba(223, 234, 255, 0.82)" }} />
                      )
                    }}
                  />

                  <TextField
                    label="Confirm Password"
                    type="password"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    onKeyDown={(event) => event.key === "Enter" && handleRegister()}
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
                  onClick={handleRegister}
                >
                  Create Account
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
                      Already registered?
                    </Typography>
                    <Typography sx={{ color: authPalette.textMuted, fontSize: "0.95rem", mt: 0.4 }}>
                      Jump back to login and enter the dashboard.
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/login")}
                    sx={{
                      borderRadius: 999,
                      px: 2.2,
                      color: authPalette.textPrimary,
                      borderColor: "rgba(255,255,255,0.24)"
                    }}
                  >
                    Login
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
