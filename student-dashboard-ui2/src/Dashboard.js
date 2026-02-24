import React, { useCallback, useEffect, useMemo, useState } from "react";
import API from "./Api";
import {
  Toolbar,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Divider,
  Chip,
  Container,
  Card,
  CardContent,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  LinearProgress,
  MenuItem,
  Slider
} from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import MenuOpenRoundedIcon from "@mui/icons-material/MenuOpenRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const ATTENDANCE_ALERT_LIMIT = 55;

const getAttendance = (student) => Number(student.attendancePercentage ?? 0);

export default function Dashboard({ logout }) {
  const username = localStorage.getItem("username") || "User";
  const role = localStorage.getItem("role");
  const isAdmin = role === "ADMIN";

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");

  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({
    id: "",
    name: "",
    branch: "",
    studentYear: "",
    attendancePercentage: ""
  });

  const [filters, setFilters] = useState({
    search: "",
    branch: "ALL",
    year: "ALL",
    attendanceRange: [0, 100],
    quick: "ALL"
  });

  const [editId, setEditId] = useState(null);
  const [avgAttendance, setAvgAttendance] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info"
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    studentId: null,
    studentName: ""
  });
  const [studentDrawer, setStudentDrawer] = useState({
    open: false,
    student: null
  });

  const drawerWidth = sidebarCollapsed ? 84 : 250;
  const cardSx = {
    width: "100%",
    borderRadius: 3,
    boxShadow: darkMode ? "0 12px 30px rgba(2,8,23,0.45)" : "0 8px 22px rgba(15,23,42,0.12)",
    padding: 2,
    backgroundColor: darkMode ? "rgba(17,24,39,0.88)" : "rgba(255,255,255,0.86)",
    backdropFilter: "blur(6px)",
    border: darkMode ? "1px solid rgba(71,85,105,0.45)" : "1px solid rgba(148,163,184,0.25)",
    color: darkMode ? "#f8fafc" : "inherit"
  };

  const formFieldSx = {
    background: darkMode ? "#1e293b" : "#ffffff",
    borderRadius: 1,
    "& .MuiInputBase-input": {
      color: darkMode ? "#f8fafc" : "inherit"
    },
    "& .MuiInputLabel-root": {
      color: darkMode ? "#cbd5e1" : "inherit"
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: darkMode ? "#93c5fd" : "inherit"
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: darkMode ? "#334155" : "rgba(0, 0, 0, 0.23)"
    },
    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: darkMode ? "#475569" : "rgba(0, 0, 0, 0.87)"
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: darkMode ? "#60a5fa" : "#1976d2"
    }
  };

  const tableSx = {
    marginTop: 2,
    background: darkMode ? "#0f172a" : "#ffffff",
    borderRadius: 2,
    "& .MuiTableHead-root .MuiTableRow-root": {
      backgroundColor: darkMode ? "#1f2937" : "#eef1f7"
    },
    "& .MuiTableHead-root .MuiTableCell-root": {
      color: darkMode ? "#f8fafc" : "inherit",
      borderBottomColor: darkMode ? "#334155" : "rgba(224, 224, 224, 1)"
    }
  };

  const rowSx = {
    backgroundColor: darkMode ? "#111827" : "inherit",
    "& td": {
      color: darkMode ? "#f8fafc" : "inherit",
      borderColor: darkMode ? "#334155" : "rgba(224, 224, 224, 1)"
    },
    "&:hover td": {
      backgroundColor: darkMode ? "#1e293b" : "#f8fafc"
    }
  };

  const actionBtnSx = {
    minWidth: 88,
    borderRadius: 999,
    textTransform: "none",
    fontWeight: 700,
    boxShadow: "none"
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    if (logout) logout();
    window.location.reload();
  }, [logout]);

  const notify = useCallback((message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const fetchStudents = useCallback(async () => {
    try {
      const res = await API.get("/api/students");
      setStudents(res.data);
      try {
        const avg = await API.get("/api/students/average-attendance");
        setAvgAttendance(avg.data);
      } catch (e) {
        console.error(e);
      }
    } catch (err) {
      console.error(err);
      if (err?.response?.status === 401) {
        notify("Session expired. Please login again.", "warning");
        handleLogout();
      }
    }
  }, [handleLogout, notify]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const branchOptions = useMemo(() => {
    const branches = [...new Set(students.map((s) => s.branch).filter(Boolean))];
    return branches.sort();
  }, [students]);

  const yearOptions = useMemo(() => {
    const years = [...new Set(students.map((s) => s.studentYear).filter((y) => y !== null && y !== undefined))];
    return years.sort((a, b) => a - b);
  }, [students]);

  const filteredStudents = useMemo(() => {
    const searchText = filters.search.trim().toLowerCase();
    return students.filter((s) => {
      const attendance = getAttendance(s);
      const matchesSearch =
        !searchText ||
        String(s.id ?? "").toLowerCase().includes(searchText) ||
        String(s.name ?? "").toLowerCase().includes(searchText);
      const matchesBranch = filters.branch === "ALL" || s.branch === filters.branch;
      const matchesYear = filters.year === "ALL" || Number(s.studentYear) === Number(filters.year);
      const matchesRange = attendance >= filters.attendanceRange[0] && attendance <= filters.attendanceRange[1];
      const matchesQuick =
        filters.quick === "ALL" ||
        (filters.quick === "AT_RISK" && attendance < ATTENDANCE_ALERT_LIMIT) ||
        (filters.quick === "TOPPER" && attendance >= 85);
      return matchesSearch && matchesBranch && matchesYear && matchesRange && matchesQuick;
    });
  }, [students, filters]);

  const lowAttendanceStudents = useMemo(
    () => students.filter((s) => getAttendance(s) < ATTENDANCE_ALERT_LIMIT),
    [students]
  );

  const branchAnalytics = useMemo(() => {
    const grouped = students.reduce((acc, s) => {
      const key = s.branch || "Unknown";
      acc[key] = acc[key] || { total: 0, count: 0 };
      acc[key].total += getAttendance(s);
      acc[key].count += 1;
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([branch, value]) => ({
        branch,
        avg: value.count ? value.total / value.count : 0
      }))
      .sort((a, b) => b.avg - a.avg);
  }, [students]);

  const attendanceDistribution = useMemo(() => {
    const buckets = [
      { label: "< 55%", min: 0, max: 54.99 },
      { label: "55-69%", min: 55, max: 69.99 },
      { label: "70-84%", min: 70, max: 84.99 },
      { label: "85-100%", min: 85, max: 100 }
    ];

    return buckets.map((bucket) => {
      const count = students.filter((s) => {
        const a = getAttendance(s);
        return a >= bucket.min && a <= bucket.max;
      }).length;
      return { ...bucket, count };
    });
  }, [students]);

  const saveStudent = async () => {
    if (!form.name || !form.branch || !form.studentYear) {
      notify("Fill all fields", "warning");
      return;
    }
    if (!isAdmin) {
      notify("Only ADMIN can add or update students.", "warning");
      return;
    }

    try {
      if (editId) {
        await API.put(`/api/students/${editId}`, {
          id: Number(form.id),
          name: form.name,
          branch: form.branch,
          studentYear: Number(form.studentYear),
          attendancePercentage: Number(form.attendancePercentage)
        });
        notify("Student updated successfully", "success");
      } else {
        await API.post("/api/students", {
          id: Number(form.id),
          name: form.name,
          branch: form.branch,
          studentYear: Number(form.studentYear),
          attendancePercentage: Number(form.attendancePercentage)
        });
        notify("Student added successfully", "success");
      }

      setForm({ id: "", name: "", branch: "", studentYear: "", attendancePercentage: "" });
      setEditId(null);
      fetchStudents();
    } catch (err) {
      console.error(err);
      const apiMessage = err?.response?.data?.message;
      notify(apiMessage || "Error saving student", "error");
    }
  };

  const deleteStudent = async (id) => {
    if (!isAdmin) {
      notify("Only ADMIN can delete students.", "warning");
      return;
    }

    try {
      await API.delete(`/api/students/${id}`);
      fetchStudents();
      notify("Student deleted successfully", "success");
    } catch (err) {
      console.error(err);
      if (err?.response?.status === 403) {
        notify("Only ADMIN can delete students.", "warning");
      } else {
        notify("Error deleting student", "error");
      }
    }
  };

  const openDeleteDialog = (student) => {
    if (!isAdmin) {
      notify("Only ADMIN can delete students.", "warning");
      return;
    }
    setDeleteDialog({
      open: true,
      studentId: student.id,
      studentName: student.name
    });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, studentId: null, studentName: "" });
  };

  const confirmDeleteStudent = async () => {
    if (deleteDialog.studentId == null) return;
    const id = deleteDialog.studentId;
    closeDeleteDialog();
    await deleteStudent(id);
  };

  const openStudentDrawer = (student) => {
    setStudentDrawer({ open: true, student });
  };

  const closeStudentDrawer = () => {
    setStudentDrawer({ open: false, student: null });
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      branch: "ALL",
      year: "ALL",
      attendanceRange: [0, 100],
      quick: "ALL"
    });
  };

  const studentTrend = useMemo(() => {
    if (!studentDrawer.student) return [];
    const base = getAttendance(studentDrawer.student);
    return [
      { label: "Week 1", value: Math.max(0, Math.min(100, base - 6)) },
      { label: "Week 2", value: Math.max(0, Math.min(100, base - 3)) },
      { label: "Week 3", value: Math.max(0, Math.min(100, base + 1)) },
      { label: "Week 4", value: Math.max(0, Math.min(100, base)) }
    ];
  }, [studentDrawer.student]);

  const editStudent = (student) => {
    if (!isAdmin) {
      notify("Only ADMIN can edit students.", "warning");
      return;
    }
    setEditId(student.id);
    setForm({
      id: student.id,
      name: student.name,
      branch: student.branch,
      studentYear: student.studentYear,
      attendancePercentage: student.attendancePercentage || ""
    });
    setCurrentPage("dashboard");
  };

  const navItems = [
    { label: "Dashboard", icon: <DashboardRoundedIcon /> },
    { label: "Students", icon: <GroupsRoundedIcon /> }
  ];

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        background: darkMode
          ? "radial-gradient(circle at 20% 20%, #1d4ed8 0%, #0b1220 38%, #0a1020 100%)"
          : "radial-gradient(circle at 20% 20%, #bfdbfe 0%, #f8fafc 55%, #e2e8f0 100%)",
        transition: "background 0.25s ease",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <Box
        sx={{
          position: "absolute",
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: darkMode
            ? "radial-gradient(circle, rgba(59,130,246,0.22), rgba(59,130,246,0))"
            : "radial-gradient(circle, rgba(59,130,246,0.16), rgba(59,130,246,0))",
          top: "10%",
          left: "18%",
          pointerEvents: "none"
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 240,
          height: 240,
          borderRadius: "50%",
          background: darkMode
            ? "radial-gradient(circle, rgba(16,185,129,0.18), rgba(16,185,129,0))"
            : "radial-gradient(circle, rgba(16,185,129,0.12), rgba(16,185,129,0))",
          bottom: "8%",
          right: "12%",
          pointerEvents: "none"
        }}
      />
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          position: "fixed",
          flexShrink: 0,
          transition: "width 0.25s ease",
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            background: darkMode
              ? "linear-gradient(180deg, #121826 0%, #1e293b 100%)"
              : "linear-gradient(180deg, #1e3a8a 0%, #1d4ed8 100%)",
            color: "#fff",
            paddingTop: 2,
            left: 0,
            display: "flex",
            borderRight: darkMode ? "1px solid #334155" : "none",
            transition: "width 0.25s ease"
          }
        }}
      >
        <Toolbar />
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
          <Box
            sx={{
              px: sidebarCollapsed ? 1 : 2,
              pt: 1,
              pb: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: sidebarCollapsed ? "center" : "space-between"
            }}
          >
            {!sidebarCollapsed && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: 0.2 }}>
                  ERP Panel
                </Typography>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>
                  {isAdmin ? "Administrator" : "Student"}
                </Typography>
              </Box>
            )}
            <IconButton onClick={() => setSidebarCollapsed((prev) => !prev)} sx={{ color: "#fff" }}>
              {sidebarCollapsed ? <MenuRoundedIcon /> : <MenuOpenRoundedIcon />}
            </IconButton>
          </Box>

          {!sidebarCollapsed && (
            <Box sx={{ px: 2, pb: 1.5 }}>
              <Box
                sx={{
                  borderRadius: 2,
                  p: 1.2,
                  backgroundColor: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.2)"
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.1 }}>
                  {username}
                </Typography>
                <Box sx={{ mt: 0.8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Chip
                    size="small"
                    icon={<SchoolRoundedIcon />}
                    label={role || "STUDENT"}
                    sx={{
                      color: "#fff",
                      backgroundColor: "rgba(15, 23, 42, 0.4)",
                      ".MuiChip-icon": { color: "#fff" }
                    }}
                  />
                  <Typography variant="caption">{students.length} students</Typography>
                </Box>
              </Box>
            </Box>
          )}

          <Divider sx={{ borderColor: "rgba(255,255,255,0.2)" }} />
          <List sx={{ px: 1.2, pt: 1.2 }}>
            {navItems.map((item) => (
              <ListItem key={item.label} disablePadding sx={{ mb: 0.6 }}>
                <Tooltip title={sidebarCollapsed ? item.label : ""} placement="right">
                  <ListItemButton
                    onClick={() => setCurrentPage(item.label.toLowerCase())}
                    sx={{
                      minHeight: 44,
                      borderRadius: 2,
                      px: sidebarCollapsed ? 1.2 : 1.6,
                      justifyContent: sidebarCollapsed ? "center" : "flex-start",
                      backgroundColor:
                        currentPage === item.label.toLowerCase()
                          ? "rgba(255,255,255,0.20)"
                          : "transparent",
                      "&:hover": {
                        backgroundColor: "rgba(255,255,255,0.15)"
                      }
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: sidebarCollapsed ? 0 : 34,
                        color: "#fff",
                        justifyContent: "center"
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {!sidebarCollapsed && (
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontWeight: currentPage === item.label.toLowerCase() ? 700 : 500
                        }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            ))}
          </List>

          <Box sx={{ mt: "auto", p: 2 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<DarkModeIcon />}
              onClick={() => setDarkMode((prev) => !prev)}
              sx={{
                backgroundColor: darkMode ? "#475569" : "#93c5fd",
                color: darkMode ? "#ffffff" : "#0f172a",
                "&:hover": {
                  backgroundColor: darkMode ? "#64748b" : "#bfdbfe"
                }
              }}
            >
              {sidebarCollapsed ? "" : darkMode ? "Light Mode" : "Dark Mode"}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<LogoutRoundedIcon />}
              sx={{
                mt: 1.5,
                color: "#ffffff",
                borderColor: "rgba(255,255,255,0.5)",
                "&:hover": { borderColor: "#ffffff", backgroundColor: "rgba(255,255,255,0.08)" }
              }}
              onClick={handleLogout}
            >
              {sidebarCollapsed ? "" : "Logout"}
            </Button>
          </Box>
        </Box>
      </Drawer>

      <Box
        sx={{
          flexGrow: 1,
          paddingTop: 2,
          paddingBottom: 4,
          paddingLeft: 3,
          paddingRight: 3,
          marginLeft: `${drawerWidth}px`,
          width: `calc(100% - ${drawerWidth}px)`,
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          transition: "margin-left 0.25s ease, width 0.25s ease"
        }}
      >
        <Container
          maxWidth={false}
          sx={{
            marginTop: 0,
            marginBottom: 4,
            paddingLeft: 0,
            paddingRight: 0,
            width: "100%",
            maxWidth: "980px",
            marginLeft: 0
          }}
        >
          {currentPage === "dashboard" && (
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 3, alignItems: "stretch", width: "100%" }}>
              <Card sx={cardSx}>
                <CardContent>
                  <Typography variant="h5">{editId ? "Update Student" : "Add Student"}</Typography>

                  <TextField
                    label="Student ID"
                    fullWidth
                    margin="normal"
                    sx={formFieldSx}
                    value={form.id || ""}
                    onChange={(e) => setForm({ ...form, id: e.target.value.replace(/\D/g, "") })}
                  />
                  <TextField
                    label="Name"
                    fullWidth
                    margin="normal"
                    sx={formFieldSx}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  <TextField
                    label="Branch"
                    fullWidth
                    margin="normal"
                    sx={formFieldSx}
                    value={form.branch}
                    onChange={(e) => setForm({ ...form, branch: e.target.value })}
                  />
                  <TextField
                    label="Year"
                    fullWidth
                    margin="normal"
                    sx={formFieldSx}
                    value={form.studentYear}
                    onChange={(e) => setForm({ ...form, studentYear: e.target.value })}
                  />
                  <TextField
                    label="Attendance %"
                    type="number"
                    fullWidth
                    margin="normal"
                    sx={formFieldSx}
                    value={form.attendancePercentage}
                    onChange={(e) => setForm({ ...form, attendancePercentage: e.target.value })}
                  />

                  <Button variant="contained" sx={{ marginTop: 2 }} onClick={saveStudent} disabled={!isAdmin}>
                    {editId ? "Update Student" : "Add Student"}
                  </Button>
                </CardContent>
              </Card>

              <Card sx={cardSx}>
                <CardContent>
                  <Typography variant="h6">Average Attendance</Typography>
                  <Typography variant="h4" sx={{ marginBottom: 2 }}>
                    {avgAttendance.toFixed(2)} %
                  </Typography>
                  <LinearProgress variant="determinate" value={avgAttendance} sx={{ height: 10, borderRadius: 5, mt: 1 }} />
                </CardContent>
              </Card>

              <Card sx={cardSx}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <WarningAmberRoundedIcon sx={{ color: "#f59e0b" }} />
                    <Typography variant="h6">Attendance Alerts (&lt; {ATTENDANCE_ALERT_LIMIT}%)</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ mb: 1.5, color: darkMode ? "#cbd5e1" : "text.secondary" }}>
                    {lowAttendanceStudents.length} students are below the attendance threshold.
                  </Typography>
                  {lowAttendanceStudents.slice(0, 5).map((student) => (
                    <Box
                      key={`alert-${student.id}`}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderRadius: 1.5,
                        px: 1.5,
                        py: 1,
                        mb: 0.8,
                        backgroundColor: darkMode ? "#1f2937" : "#fff7ed"
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {student.name} (ID: {student.id})
                      </Typography>
                      <Chip label={`${getAttendance(student)}%`} color="warning" size="small" />
                    </Box>
                  ))}
                  {lowAttendanceStudents.length === 0 && (
                    <Typography variant="body2">No students below 55%. Great job.</Typography>
                  )}
                </CardContent>
              </Card>

              <Card sx={cardSx}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1.5 }}>Branch-wise Average Attendance</Typography>
                  {branchAnalytics.map((item) => (
                    <Box key={item.branch} sx={{ mb: 1.2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.branch}</Typography>
                        <Typography variant="body2">{item.avg.toFixed(1)}%</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(100, Math.max(0, item.avg))}
                        sx={{
                          height: 9,
                          borderRadius: 4,
                          backgroundColor: darkMode ? "#334155" : "#bfdbfe"
                        }}
                      />
                    </Box>
                  ))}
                </CardContent>
              </Card>

              <Card sx={cardSx}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1.5 }}>Attendance Distribution</Typography>
                  {attendanceDistribution.map((bucket) => {
                    const total = students.length || 1;
                    const percent = (bucket.count / total) * 100;
                    return (
                      <Box key={bucket.label} sx={{ mb: 1.2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{bucket.label}</Typography>
                          <Typography variant="body2">{bucket.count} students</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={percent}
                          color={bucket.label === "< 55%" ? "warning" : "primary"}
                          sx={{ height: 9, borderRadius: 4 }}
                        />
                      </Box>
                    );
                  })}
                </CardContent>
              </Card>
            </Box>
          )}

          {currentPage === "students" && (
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 3, width: "100%" }}>
              <Card sx={cardSx}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <FilterAltRoundedIcon color="primary" />
                    <Typography variant="h5">Students & Attendance</Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
                      gap: 1.5
                    }}
                  >
                    <TextField
                      label="Search by Name or ID"
                      sx={formFieldSx}
                      value={filters.search}
                      onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                    />
                    <TextField
                      select
                      label="Branch"
                      sx={formFieldSx}
                      value={filters.branch}
                      onChange={(e) => setFilters((prev) => ({ ...prev, branch: e.target.value }))}
                    >
                      <MenuItem value="ALL">All Branches</MenuItem>
                      {branchOptions.map((branch) => (
                        <MenuItem key={branch} value={branch}>{branch}</MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      select
                      label="Year"
                      sx={formFieldSx}
                      value={filters.year}
                      onChange={(e) => setFilters((prev) => ({ ...prev, year: e.target.value }))}
                    >
                      <MenuItem value="ALL">All Years</MenuItem>
                      {yearOptions.map((year) => (
                        <MenuItem key={year} value={year}>{year}</MenuItem>
                      ))}
                    </TextField>
                  </Box>

                  <Box sx={{ mt: 2.2 }}>
                    <Typography variant="body2" sx={{ mb: 1, color: darkMode ? "#cbd5e1" : "text.secondary" }}>
                      Attendance Range: {filters.attendanceRange[0]}% - {filters.attendanceRange[1]}%
                    </Typography>
                    <Slider
                      value={filters.attendanceRange}
                      onChange={(_, value) =>
                        setFilters((prev) => ({ ...prev, attendanceRange: value }))
                      }
                      valueLabelDisplay="auto"
                      min={0}
                      max={100}
                      disableSwap
                    />
                  </Box>

                  <Box sx={{ mt: 1.3, display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                    <Chip
                      label="All Students"
                      color={filters.quick === "ALL" ? "primary" : "default"}
                      variant={filters.quick === "ALL" ? "filled" : "outlined"}
                      sx={{
                        color: filters.quick === "ALL" ? "#ffffff" : darkMode ? "#e2e8f0" : "inherit",
                        borderColor: darkMode ? "#64748b" : undefined,
                        backgroundColor: filters.quick === "ALL"
                          ? undefined
                          : darkMode
                            ? "rgba(148,163,184,0.12)"
                            : undefined
                      }}
                      onClick={() => setFilters((prev) => ({ ...prev, quick: "ALL" }))}
                    />
                    <Chip
                      label={`At Risk (< ${ATTENDANCE_ALERT_LIMIT}%)`}
                      color={filters.quick === "AT_RISK" ? "warning" : "default"}
                      variant={filters.quick === "AT_RISK" ? "filled" : "outlined"}
                      sx={{
                        color: filters.quick === "AT_RISK" ? "#111827" : darkMode ? "#fde68a" : "inherit",
                        borderColor: darkMode ? "#f59e0b" : undefined,
                        backgroundColor: filters.quick === "AT_RISK"
                          ? undefined
                          : darkMode
                            ? "rgba(245,158,11,0.16)"
                            : undefined
                      }}
                      onClick={() => setFilters((prev) => ({ ...prev, quick: "AT_RISK" }))}
                    />
                    <Chip
                      label="Top Performers (85%+)"
                      color={filters.quick === "TOPPER" ? "success" : "default"}
                      variant={filters.quick === "TOPPER" ? "filled" : "outlined"}
                      sx={{
                        color: filters.quick === "TOPPER" ? "#ffffff" : darkMode ? "#86efac" : "inherit",
                        borderColor: darkMode ? "#22c55e" : undefined,
                        backgroundColor: filters.quick === "TOPPER"
                          ? undefined
                          : darkMode
                            ? "rgba(34,197,94,0.16)"
                            : undefined
                      }}
                      onClick={() => setFilters((prev) => ({ ...prev, quick: "TOPPER" }))}
                    />
                    <Button size="small" onClick={resetFilters}>
                      Reset Filters
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              <Card sx={cardSx}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1 }}>Students List ({filteredStudents.length})</Typography>
                  <Typography variant="body2" sx={{ color: darkMode ? "#cbd5e1" : "text.secondary", mb: 2 }}>
                    Showing only students and their attendance.
                  </Typography>

                  <Table sx={tableSx}>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Attendance</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredStudents.map((s) => (
                        <TableRow
                          key={`students-page-${s.id}`}
                          sx={{ ...rowSx, cursor: "pointer" }}
                          onClick={() => openStudentDrawer(s)}
                        >
                          <TableCell>{s.id}</TableCell>
                          <TableCell>{s.name}</TableCell>
                          <TableCell sx={{ minWidth: 210 }}>
                            {getAttendance(s)} %
                            <LinearProgress
                              variant="determinate"
                              value={getAttendance(s)}
                              color={getAttendance(s) < ATTENDANCE_ALERT_LIMIT ? "warning" : "primary"}
                              sx={{ mt: 1, height: 8, borderRadius: 5 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<EditRoundedIcon fontSize="small" />}
                                sx={{
                                  ...actionBtnSx,
                                  color: darkMode ? "#93c5fd" : "#1565c0",
                                  borderColor: darkMode ? "rgba(147,197,253,0.55)" : "#90caf9",
                                  backgroundColor: darkMode ? "rgba(37,99,235,0.14)" : "#e3f2fd",
                                  "&:hover": {
                                    borderColor: darkMode ? "#93c5fd" : "#42a5f5",
                                    backgroundColor: darkMode ? "rgba(37,99,235,0.24)" : "#dbeafe"
                                  }
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  editStudent(s);
                                }}
                                disabled={!isAdmin}
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<DeleteOutlineRoundedIcon fontSize="small" />}
                                sx={{
                                  ...actionBtnSx,
                                  color: darkMode ? "#fca5a5" : "#c62828",
                                  borderColor: darkMode ? "rgba(252,165,165,0.55)" : "#ef9a9a",
                                  backgroundColor: darkMode ? "rgba(220,38,38,0.14)" : "#ffebee",
                                  "&:hover": {
                                    borderColor: darkMode ? "#fca5a5" : "#ef5350",
                                    backgroundColor: darkMode ? "rgba(220,38,38,0.24)" : "#ffe4e6"
                                  }
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDeleteDialog(s);
                                }}
                                disabled={!isAdmin}
                              >
                                Delete
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredStudents.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} sx={{ textAlign: "center", py: 3 }}>
                            No students match the selected filters.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Box>
          )}
        </Container>
      </Box>
      <Dialog
        open={deleteDialog.open}
        onClose={closeDeleteDialog}
      >
        <DialogTitle>Delete Student</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Delete {deleteDialog.studentName ? `"${deleteDialog.studentName}"` : "this student"}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDeleteStudent}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
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
      <Drawer
        anchor="right"
        open={studentDrawer.open}
        onClose={closeStudentDrawer}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 390 },
            p: 2.2,
            backgroundColor: darkMode ? "#0f172a" : "#ffffff",
            color: darkMode ? "#f8fafc" : "inherit"
          }
        }}
      >
        {studentDrawer.student && (
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <InfoOutlinedIcon color="primary" />
              <Typography variant="h6">Student Details</Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              {studentDrawer.student.name}
            </Typography>
            <Typography variant="body2" sx={{ color: darkMode ? "#cbd5e1" : "text.secondary", mb: 2 }}>
              ID: {studentDrawer.student.id} | Branch: {studentDrawer.student.branch} | Year: {studentDrawer.student.studentYear}
            </Typography>

            <Card sx={{ ...cardSx, p: 1.4, mb: 2 }}>
              <CardContent sx={{ p: "12px !important" }}>
                <Typography variant="subtitle2">Current Attendance</Typography>
                <Typography variant="h4" sx={{ mt: 0.8 }}>
                  {getAttendance(studentDrawer.student)}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={getAttendance(studentDrawer.student)}
                  color={getAttendance(studentDrawer.student) < ATTENDANCE_ALERT_LIMIT ? "warning" : "primary"}
                  sx={{ mt: 1.2, height: 8, borderRadius: 5 }}
                />
              </CardContent>
            </Card>

            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Attendance Trend (Last 4 Weeks)
            </Typography>
            {studentTrend.map((point) => (
              <Box key={point.label} sx={{ mb: 1.1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.4 }}>
                  <Typography variant="body2">{point.label}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{point.value}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={point.value}
                  color={point.value < ATTENDANCE_ALERT_LIMIT ? "warning" : "primary"}
                  sx={{ height: 7, borderRadius: 5 }}
                />
              </Box>
            ))}
          </Box>
        )}
      </Drawer>
    </Box>
  );
}
