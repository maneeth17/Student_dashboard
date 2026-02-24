import React, { useState } from "react";
import { loginUser } from "./Api";
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Snackbar,
  Alert
} from "@mui/material";

export default function Login({ login, goToRegister }) {
  const [form, setForm] = useState({
    username: "",
    password: ""
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info"
  });

  const notify = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleLogin = async () => {
    if (!form.username || !form.password) {
      notify("Enter username & password", "warning");
      return;
    }

    try {
      const res = await loginUser({
        username: form.username,
        password: form.password
      });

      console.log("LOGIN RESPONSE:", res.data);

      if (res.data?.token && res.data?.role) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);
        localStorage.setItem("username", res.data.username || form.username);
        login(res.data.role);
      } else {
        notify("Invalid credentials", "error");
      }
    } catch (err) {
      console.error("Login error:", err?.response || err);
      const message = err?.response?.data?.message || err?.response?.data || "Login failed. Backend not reachable.";
      notify(message, "error");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 20% 20%, #1d4ed8 0%, #0b1220 38%, #0a1020 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        position: "relative",
        overflow: "hidden"
      }}
    >
      <Box
        sx={{
          position: "absolute",
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.35), rgba(59,130,246,0))",
          top: "8%",
          left: "7%"
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16,185,129,0.24), rgba(16,185,129,0))",
          bottom: "7%",
          right: "10%"
        }}
      />
      <Container maxWidth="sm">
        <Card
          sx={{
            borderRadius: 5,
            boxShadow: "0 20px 50px rgba(2, 8, 23, 0.6)",
            backgroundColor: "rgba(15, 23, 42, 0.88)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(148, 163, 184, 0.25)",
            color: "#f8fafc"
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
            <Typography variant="h3" align="center" sx={{ fontWeight: 600, letterSpacing: 0.2 }}>
              Dashboard Login
            </Typography>

            <Typography
              variant="body2"
              align="center"
              sx={{ color: "#cbd5e1", mt: 1.2, mb: 3.2, fontSize: "1rem" }}
            >
              Welcome back! Please login to continue
            </Typography>

            <TextField
              label="Username"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiOutlinedInput-root": { backgroundColor: "rgba(15, 23, 42, 0.7)" },
                "& .MuiInputBase-input": { color: "#f8fafc" },
                "& .MuiInputLabel-root": { color: "#94a3b8" },
                "& .MuiInputLabel-root.Mui-focused": { color: "#60a5fa" },
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#334155" },
                "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#60a5fa" },
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#60a5fa" }
              }}
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiOutlinedInput-root": { backgroundColor: "rgba(15, 23, 42, 0.7)" },
                "& .MuiInputBase-input": { color: "#f8fafc" },
                "& .MuiInputLabel-root": { color: "#94a3b8" },
                "& .MuiInputLabel-root.Mui-focused": { color: "#60a5fa" },
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#334155" },
                "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#60a5fa" },
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#60a5fa" }
              }}
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />

            <Button
              variant="contained"
              fullWidth
              size="large"
              sx={{
                mt: 3,
                borderRadius: 2.2,
                py: 1.3,
                fontSize: "1rem",
                fontWeight: 700,
                textTransform: "none",
                background: "linear-gradient(90deg, #2563eb, #3b82f6)",
                boxShadow: "0 10px 20px rgba(37, 99, 235, 0.35)",
                "&:hover": { background: "linear-gradient(90deg, #1d4ed8, #2563eb)" }
              }}
              onClick={handleLogin}
            >
              Login
            </Button>

            <Typography align="center" sx={{ mt: 3, color: "#cbd5e1" }}>
              New user?
              <Button size="small" sx={{ ml: 1, fontWeight: 700 }} onClick={goToRegister}>
                Register
              </Button>
            </Typography>
          </CardContent>
        </Card>
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
