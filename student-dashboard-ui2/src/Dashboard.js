import React, { useCallback, useEffect, useMemo, useState } from "react";
import API, {
  createAttendance,
  deleteAttendanceRecord,
  getAttendanceForDate,
  getAttendanceForMonth,
  getAttendanceSummary,
  getStudents,
  importStudentsCsv,
  saveAttendanceForDate,
  updateAttendanceRecord
} from "./Api";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Drawer,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Tooltip,
  Typography
} from "@mui/material";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import MenuOpenRoundedIcon from "@mui/icons-material/MenuOpenRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";

const ATTENDANCE_ALERT_LIMIT = 55;
const BRANCH_OPTIONS = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "AI", "AI-DS", "AIML", "IT"];
const STATUS_OPTIONS = ["PRESENT", "ABSENT", "LATE", "LEAVE"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getMonthKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const getDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const buildCalendarGrid = (monthValue) => {
  const [yearValue, monthPart] = monthValue.split("-").map(Number);
  const firstDay = new Date(yearValue, monthPart - 1, 1);
  const start = new Date(firstDay);
  start.setDate(1 - firstDay.getDay());
  const days = [];
  for (let index = 0; index < 42; index += 1) {
    const current = new Date(start);
    current.setDate(start.getDate() + index);
    const iso = getDateKey(current);
    days.push({
      iso,
      label: current.getDate(),
      inCurrentMonth: current.getMonth() === monthPart - 1
    });
  }
  return days;
};

const getStatusColor = (status) => {
  if (status === "PRESENT") return { bg: "#dcfce7", fg: "#166534" };
  if (status === "ABSENT") return { bg: "#fee2e2", fg: "#b91c1c" };
  if (status === "LATE") return { bg: "#fef3c7", fg: "#b45309" };
  if (status === "LEAVE") return { bg: "#dbeafe", fg: "#1d4ed8" };
  return { bg: "#e5e7eb", fg: "#374151" };
};

const formatMonthLabel = (monthValue) => {
  const [year, month] = monthValue.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric"
  });
};

const THEME_STORAGE_KEY = "student-dashboard-theme";

const getDashboardTheme = (isDarkMode) => {
  if (isDarkMode) {
    return {
      appBg: "radial-gradient(circle at 10% 14%, rgba(45, 212, 191, 0.16) 0%, rgba(45, 212, 191, 0.03) 18%, transparent 34%), radial-gradient(circle at 86% 14%, rgba(99, 102, 241, 0.18) 0%, rgba(99, 102, 241, 0.04) 20%, transparent 36%), radial-gradient(circle at 56% 88%, rgba(56, 189, 248, 0.10) 0%, rgba(56, 189, 248, 0.02) 18%, transparent 34%), linear-gradient(135deg, #04070d 0%, #09111d 38%, #0e1726 100%)",
      panelBg: "linear-gradient(180deg, rgba(15, 23, 42, 0.72) 0%, rgba(15, 23, 42, 0.52) 100%)",
      panelBorder: "1px solid rgba(148, 163, 184, 0.16)",
      panelShadow: "0 26px 72px rgba(2, 8, 23, 0.42)",
      primaryText: "#f8fbff",
      mutedText: "#b8c8df",
      tableHeaderBg: "rgba(8, 15, 27, 0.66)",
      tableHeaderText: "#f8fbff",
      rowSelectedBg: "rgba(45, 212, 191, 0.12)",
      tableBorder: "rgba(148, 163, 184, 0.12)",
      inputBg: "rgba(5, 13, 24, 0.48)",
      inputText: "#f8fbff",
      inputLabel: "#c4d2e7",
      inputBorder: "rgba(148, 163, 184, 0.22)",
      sidebarBg: "linear-gradient(180deg, rgba(10, 16, 27, 0.74) 0%, rgba(10, 16, 27, 0.58) 100%)",
      sidebarText: "#ffffff",
      sidebarMuted: "rgba(194, 209, 232, 0.74)",
      sidebarSurface: "rgba(255,255,255,0.05)",
      selectedNavBg: "linear-gradient(135deg, rgba(45,212,191,0.16) 0%, rgba(59,130,246,0.16) 100%)",
      outlinedButtonColor: "#c7f9f1",
      outlinedButtonBorder: "rgba(94, 234, 212, 0.32)",
      calendarEmptyBg: "rgba(255,255,255,0.04)",
      calendarHoverBg: "rgba(255,255,255,0.08)",
      calendarOtherMonthText: "#70839f",
      dialogBg: "#0a1220",
      divider: "rgba(148, 163, 184, 0.18)",
      shellBorder: "rgba(148, 163, 184, 0.12)",
      ambientOverlay: "radial-gradient(circle at 20% 18%, rgba(45, 212, 191, 0.06) 0%, rgba(45, 212, 191, 0) 20%), radial-gradient(circle at 78% 14%, rgba(99, 102, 241, 0.08) 0%, rgba(99, 102, 241, 0) 24%)"
    };
  }

  return {
    appBg: "radial-gradient(circle at 12% 14%, rgba(45, 212, 191, 0.14) 0%, rgba(45, 212, 191, 0.03) 18%, transparent 34%), radial-gradient(circle at 86% 14%, rgba(96, 165, 250, 0.14) 0%, rgba(96, 165, 250, 0.03) 18%, transparent 32%), linear-gradient(180deg, #edf5ff 0%, #f6f9ff 40%, #eef4ff 100%)",
    panelBg: "linear-gradient(180deg, rgba(255,255,255,0.58) 0%, rgba(255,255,255,0.36) 100%)",
    panelBorder: "1px solid rgba(255,255,255,0.70)",
    panelShadow: "0 22px 54px rgba(111, 144, 184, 0.14)",
    primaryText: "#172235",
    mutedText: "#64748b",
    tableHeaderBg: "rgba(240, 247, 255, 0.88)",
      tableHeaderText: "#132238",
    rowSelectedBg: "rgba(37, 99, 235, 0.06)",
      tableBorder: "rgba(148, 163, 184, 0.18)",
    inputBg: "rgba(255,255,255,0.42)",
    inputText: "#172235",
    inputLabel: "#5d6c84",
    inputBorder: "rgba(148, 163, 184, 0.28)",
    sidebarBg: "linear-gradient(180deg, rgba(255,255,255,0.52) 0%, rgba(255,255,255,0.34) 100%)",
    sidebarText: "#172235",
    sidebarMuted: "#6b7b92",
    sidebarSurface: "rgba(255,255,255,0.18)",
    selectedNavBg: "linear-gradient(135deg, rgba(45,212,191,0.14) 0%, rgba(59,130,246,0.12) 100%)",
    outlinedButtonColor: "#1d4ed8",
    outlinedButtonBorder: "rgba(37, 99, 235, 0.28)",
    calendarEmptyBg: "rgba(255,255,255,0.24)",
    calendarHoverBg: "rgba(255,255,255,0.38)",
    calendarOtherMonthText: "#94a3b8",
    dialogBg: "#ffffff",
    divider: "rgba(148, 163, 184, 0.22)",
    shellBorder: "rgba(255,255,255,0.56)",
    ambientOverlay: "radial-gradient(circle at 18% 16%, rgba(45, 212, 191, 0.05) 0%, rgba(45, 212, 191, 0) 18%), radial-gradient(circle at 80% 14%, rgba(96, 165, 250, 0.06) 0%, rgba(96, 165, 250, 0) 20%)"
  };
};

export default function Dashboard({ logout }) {
  const username = localStorage.getItem("username") || "User";
  const role = localStorage.getItem("role");
  const isAdmin = role === "ADMIN";

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return savedTheme ? savedTheme === "dark" : false;
  });
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [students, setStudents] = useState([]);
  const [avgAttendance, setAvgAttendance] = useState(0);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(getMonthKey(new Date()));
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [attendanceForm, setAttendanceForm] = useState({
    recordId: null,
    studentId: "",
    attendanceDate: getDateKey(new Date()),
    status: "PRESENT",
    remarks: ""
  });
  const [studentForm, setStudentForm] = useState({
    id: "",
    name: "",
    branch: "",
    studentYear: ""
  });
  const [editStudentId, setEditStudentId] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, recordId: null });
  const [importingStudents, setImportingStudents] = useState(false);
  const [dayAttendanceDialog, setDayAttendanceDialog] = useState({
    open: false,
    date: getDateKey(new Date()),
    rows: []
  });
  const [loadingDayAttendance, setLoadingDayAttendance] = useState(false);
  const [savingDayAttendance, setSavingDayAttendance] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info"
  });

  const drawerWidth = sidebarCollapsed ? 88 : 250;
  const theme = useMemo(() => getDashboardTheme(isDarkMode), [isDarkMode]);

  const textFieldSx = useMemo(
    () => ({
        "& .MuiOutlinedInput-root": {
          backgroundColor: theme.inputBg,
          color: theme.inputText,
          borderRadius: 2,
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          "& fieldset": {
            borderColor: theme.inputBorder
          },
        "&:hover fieldset": {
          borderColor: theme.outlinedButtonColor
        },
        "&.Mui-focused fieldset": {
          borderColor: "#3b82f6",
          borderWidth: 1.5
        }
      },
      "& .MuiInputBase-input": {
        color: theme.inputText
      },
      "& .MuiInputLabel-root": {
        color: theme.inputLabel
      },
      "& .MuiInputLabel-root.Mui-focused": {
        color: "#60a5fa"
      },
      "& .MuiSvgIcon-root": {
        color: theme.inputLabel
      },
      "& .MuiSelect-icon": {
        color: theme.inputLabel
      }
    }),
    [theme]
  );

  const daySheetFieldSx = useMemo(
    () => ({
      "& .MuiOutlinedInput-root": {
        backgroundColor: isDarkMode ? "rgba(8, 15, 27, 0.92)" : "rgba(255,255,255,0.96)",
        color: theme.primaryText,
        borderRadius: 2,
        "& fieldset": {
          borderColor: isDarkMode ? "rgba(96, 165, 250, 0.28)" : "rgba(71, 85, 105, 0.22)"
        },
        "&:hover fieldset": {
          borderColor: "#3b82f6"
        },
        "&.Mui-focused fieldset": {
          borderColor: "#60a5fa",
          borderWidth: 1.5
        }
      },
      "& .MuiInputBase-input": {
        color: theme.primaryText,
        fontWeight: 600
      },
      "& .MuiSelect-select": {
        color: theme.primaryText,
        fontWeight: 700
      },
      "& .MuiSvgIcon-root": {
        color: theme.primaryText
      }
    }),
    [isDarkMode, theme]
  );

  const getDayStatusButtonSx = useCallback((status, selectedStatus) => {
    const active = status === selectedStatus;
    const palettes = {
      PRESENT: {
        activeBg: "rgba(34, 197, 94, 0.18)",
        activeBorder: "rgba(74, 222, 128, 0.8)",
        activeColor: "#dcfce7"
      },
      ABSENT: {
        activeBg: "rgba(239, 68, 68, 0.18)",
        activeBorder: "rgba(248, 113, 113, 0.8)",
        activeColor: "#fee2e2"
      },
      LATE: {
        activeBg: "rgba(245, 158, 11, 0.18)",
        activeBorder: "rgba(251, 191, 36, 0.8)",
        activeColor: "#fef3c7"
      },
      LEAVE: {
        activeBg: "rgba(59, 130, 246, 0.18)",
        activeBorder: "rgba(96, 165, 250, 0.8)",
        activeColor: "#dbeafe"
      }
    };
    const palette = palettes[status];

    return {
      minWidth: 0,
      px: 1.4,
      py: 0.8,
      borderRadius: 999,
      border: "1px solid",
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: 0.3,
      backgroundColor: active ? palette.activeBg : "transparent",
      borderColor: active ? palette.activeBorder : theme.inputBorder,
      color: active ? palette.activeColor : theme.mutedText,
      "&:hover": {
        backgroundColor: active ? palette.activeBg : (isDarkMode ? "rgba(148, 163, 184, 0.08)" : "rgba(15, 23, 42, 0.05)"),
        borderColor: active ? palette.activeBorder : theme.outlinedButtonColor
      }
    };
  }, [isDarkMode, theme]);

  const cardSx = useMemo(
    () => ({
      position: "relative",
      overflow: "hidden",
      borderRadius: 4,
      background: theme.panelBg,
      border: theme.panelBorder,
      color: theme.primaryText,
      boxShadow: theme.panelShadow,
      backdropFilter: "blur(22px)",
      WebkitBackdropFilter: "blur(22px)",
      "&::before": {
        content: '""',
        position: "absolute",
        inset: 0,
        background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 18%, rgba(255,255,255,0) 40%)",
        pointerEvents: "none"
      },
      "&::after": {
        content: '""',
        position: "absolute",
        inset: 1,
        borderRadius: "inherit",
        border: "1px solid rgba(255,255,255,0.05)",
        pointerEvents: "none"
      }
    }),
    [theme]
  );

  const notify = useCallback((message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    if (logout) logout();
  }, [logout]);

  const handleApiError = useCallback((error, fallbackMessage) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message || fallbackMessage;
    if (status === 401) {
      notify("Session expired. Please login again.", "warning");
      handleLogout();
      return;
    }
    notify(message, "error");
  }, [handleLogout, notify]);

  const fetchStudentsData = useCallback(async () => {
    try {
      const [studentResponse, avgResponse] = await Promise.all([
        getStudents(),
        API.get("/api/students/average-attendance")
      ]);
      const nextStudents = studentResponse.data;
      setStudents(nextStudents);
      setAvgAttendance(Number(avgResponse.data || 0));

      if (!selectedStudentId && nextStudents.length) {
        const firstStudentId = String(nextStudents[0].id);
        setSelectedStudentId(firstStudentId);
        setAttendanceForm((prev) => ({ ...prev, studentId: firstStudentId }));
      } else if (
        selectedStudentId &&
        !nextStudents.some((student) => String(student.id) === String(selectedStudentId))
      ) {
        const fallbackId = nextStudents[0] ? String(nextStudents[0].id) : "";
        setSelectedStudentId(fallbackId);
        setAttendanceForm((prev) => ({ ...prev, studentId: fallbackId }));
      }
    } catch (error) {
      console.error(error);
      handleApiError(error, "Unable to load student data");
    }
  }, [handleApiError, selectedStudentId]);

  const fetchAttendanceData = useCallback(async () => {
    if (!selectedStudentId) {
      setAttendanceRecords([]);
      setAttendanceSummary(null);
      return;
    }

    const [year, month] = selectedMonth.split("-").map(Number);

    try {
      const [recordsResponse, summaryResponse] = await Promise.all([
        getAttendanceForMonth(selectedStudentId, year, month),
        getAttendanceSummary(selectedStudentId)
      ]);
      setAttendanceRecords(recordsResponse.data);
      setAttendanceSummary(summaryResponse.data);
    } catch (error) {
      console.error(error);
      handleApiError(error, "Unable to load attendance calendar");
    }
  }, [handleApiError, selectedMonth, selectedStudentId]);

  useEffect(() => {
    fetchStudentsData();
  }, [fetchStudentsData]);

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  const selectedStudent = useMemo(
    () => students.find((student) => String(student.id) === String(selectedStudentId)) || null,
    [students, selectedStudentId]
  );

  const recordsByDate = useMemo(() => {
    const map = new Map();
    attendanceRecords.forEach((record) => {
      map.set(record.attendanceDate, record);
    });
    return map;
  }, [attendanceRecords]);

  const lowAttendanceStudents = useMemo(
    () => students.filter((student) => Number(student.attendancePercentage || 0) < ATTENDANCE_ALERT_LIMIT),
    [students]
  );

  const branchAnalytics = useMemo(() => {
    const grouped = students.reduce((accumulator, student) => {
      const branch = student.branch || "Unknown";
      const current = accumulator[branch] || { total: 0, count: 0 };
      current.total += Number(student.attendancePercentage || 0);
      current.count += 1;
      accumulator[branch] = current;
      return accumulator;
    }, {});

    return Object.entries(grouped)
      .map(([branch, value]) => ({
        branch,
        average: value.count ? value.total / value.count : 0
      }))
      .sort((first, second) => second.average - first.average);
  }, [students]);

  const attendanceDistribution = useMemo(() => {
    const buckets = [
      { label: "< 55%", min: 0, max: 54.99 },
      { label: "55-69%", min: 55, max: 69.99 },
      { label: "70-84%", min: 70, max: 84.99 },
      { label: "85-100%", min: 85, max: 100 }
    ];

    return buckets.map((bucket) => ({
      ...bucket,
      count: students.filter((student) => {
        const percentage = Number(student.attendancePercentage || 0);
        return percentage >= bucket.min && percentage <= bucket.max;
      }).length
    }));
  }, [students]);

  const calendarDays = useMemo(() => buildCalendarGrid(selectedMonth), [selectedMonth]);

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: <DashboardRoundedIcon /> },
    { key: "students", label: "Students", icon: <GroupsRoundedIcon /> },
    { key: "attendance", label: "Attendance", icon: <CalendarMonthRoundedIcon /> }
  ];

  const resetStudentForm = () => {
    setStudentForm({ id: "", name: "", branch: "", studentYear: "" });
    setEditStudentId(null);
  };

  const saveStudent = async () => {
    if (!isAdmin) {
      notify("Only ADMIN can add or update students.", "warning");
      return;
    }

    if (!studentForm.id || !studentForm.name || !studentForm.branch || !studentForm.studentYear) {
      notify("Fill all student fields", "warning");
      return;
    }

    const payload = {
      id: Number(studentForm.id),
      name: studentForm.name,
      branch: studentForm.branch,
      studentYear: Number(studentForm.studentYear)
    };

    try {
      if (editStudentId) {
        await API.put(`/api/students/${editStudentId}`, payload);
        notify("Student updated successfully", "success");
      } else {
        await API.post("/api/students", payload);
        notify("Student added successfully", "success");
      }
      resetStudentForm();
      await fetchStudentsData();
    } catch (error) {
      console.error(error);
      handleApiError(error, "Unable to save student");
    }
  };

  const editStudent = (student) => {
    if (!isAdmin) {
      notify("Only ADMIN can edit students.", "warning");
      return;
    }
    setEditStudentId(student.id);
    setStudentForm({
      id: String(student.id),
      name: student.name,
      branch: student.branch,
      studentYear: String(student.studentYear)
    });
    setCurrentPage("students");
  };

  const handleStudentCsvImport = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!isAdmin) {
      notify("Only ADMIN can import student CSV files.", "warning");
      return;
    }

    const fileName = file.name?.toLowerCase() || "";
    if (!fileName.endsWith(".csv")) {
      notify("Choose a .csv file exported from Numbers, Excel, or Sheets.", "warning");
      return;
    }

    setImportingStudents(true);
    try {
      const response = await importStudentsCsv(file);
      await fetchStudentsData();
      const { importedCount, createdCount, updatedCount } = response.data;
      notify(
        `Imported ${importedCount} students (${createdCount} new, ${updatedCount} updated)`,
        "success"
      );
    } catch (error) {
      console.error(error);
      handleApiError(error, "Unable to import student CSV");
    } finally {
      setImportingStudents(false);
    }
  };

  const openAttendanceEditor = (dateValue) => {
      const record = recordsByDate.get(dateValue);
    setAttendanceForm({
      recordId: record?.id || null,
      studentId: selectedStudentId,
      attendanceDate: dateValue,
      status: record?.status || "PRESENT",
      remarks: record?.remarks || ""
    });
  };

  const saveAttendance = async () => {
    if (!isAdmin) {
      notify("Only ADMIN can mark attendance.", "warning");
      return;
    }
    if (!attendanceForm.studentId || !attendanceForm.attendanceDate || !attendanceForm.status) {
      notify("Select a student, date, and status", "warning");
      return;
    }

    const payload = {
      studentId: Number(attendanceForm.studentId),
      attendanceDate: attendanceForm.attendanceDate,
      status: attendanceForm.status,
      remarks: attendanceForm.remarks.trim() || null
    };

    try {
      if (attendanceForm.recordId) {
        await updateAttendanceRecord(attendanceForm.recordId, payload);
        notify("Attendance updated", "success");
      } else {
        await createAttendance(payload);
        notify("Attendance saved", "success");
      }
      await Promise.all([fetchAttendanceData(), fetchStudentsData()]);
      setAttendanceForm((prev) => ({
        ...prev,
        recordId: null,
        status: "PRESENT",
        remarks: ""
      }));
    } catch (error) {
      console.error(error);
      handleApiError(error, "Unable to save attendance");
    }
  };

  const confirmDeleteAttendance = async () => {
    if (!deleteDialog.recordId) return;
    try {
      await deleteAttendanceRecord(deleteDialog.recordId);
      notify("Attendance deleted", "success");
      setDeleteDialog({ open: false, recordId: null });
      setAttendanceForm((prev) => ({ ...prev, recordId: null, remarks: "", status: "PRESENT" }));
      await Promise.all([fetchAttendanceData(), fetchStudentsData()]);
    } catch (error) {
      console.error(error);
      handleApiError(error, "Unable to delete attendance");
    }
  };

  const loadDayAttendance = useCallback(async (dateValue, openDialog = false) => {
    setLoadingDayAttendance(true);
    try {
      const response = await getAttendanceForDate(dateValue);
      setDayAttendanceDialog((prev) => ({
        open: openDialog || prev.open,
        date: dateValue,
        rows: response.data.map((row) => ({
          ...row,
          status: row.status || "PRESENT",
          remarks: row.remarks || ""
        }))
      }));
    } catch (error) {
      console.error(error);
      handleApiError(error, "Unable to load attendance sheet");
    } finally {
      setLoadingDayAttendance(false);
    }
  }, [handleApiError]);

  const openDayAttendanceDialog = async (dateValue = attendanceForm.attendanceDate) => {
    if (!isAdmin) {
      notify("Only ADMIN can take day-wise attendance.", "warning");
      return;
    }

    await loadDayAttendance(dateValue, true);
  };

  const closeDayAttendanceDialog = () => {
    if (savingDayAttendance) {
      return;
    }

    setDayAttendanceDialog((prev) => ({
      ...prev,
      open: false
    }));
  };

  const updateDayAttendanceRow = (studentId, field, value) => {
    setDayAttendanceDialog((prev) => ({
      ...prev,
      rows: prev.rows.map((row) => (
        row.studentId === studentId
          ? { ...row, [field]: value }
          : row
      ))
    }));
  };

  const applyStatusToAll = (status) => {
    setDayAttendanceDialog((prev) => ({
      ...prev,
      rows: prev.rows.map((row) => ({
        ...row,
        status
      }))
    }));
  };

  const saveDayAttendanceSheet = async () => {
    if (!dayAttendanceDialog.rows.length) {
      notify("No students available for this attendance date", "warning");
      return;
    }

    setSavingDayAttendance(true);
    try {
      const payload = {
        attendanceDate: dayAttendanceDialog.date,
        entries: dayAttendanceDialog.rows.map((row) => ({
          studentId: row.studentId,
          status: row.status,
          remarks: row.remarks.trim() || null
        }))
      };

      const response = await saveAttendanceForDate(payload);
      setDayAttendanceDialog((prev) => ({
        ...prev,
        rows: response.data.map((row) => ({
          ...row,
          status: row.status || "PRESENT",
          remarks: row.remarks || ""
        })),
        open: false
      }));

      await Promise.all([fetchAttendanceData(), fetchStudentsData()]);
      notify(`Saved attendance for ${dayAttendanceDialog.date}`, "success");
    } catch (error) {
      console.error(error);
      handleApiError(error, "Unable to save date-wise attendance");
    } finally {
      setSavingDayAttendance(false);
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        minHeight: "100vh",
        background: theme.appBg,
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background: theme.ambientOverlay,
          pointerEvents: "none"
        }
      }}
    >
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            background: theme.sidebarBg,
            color: theme.sidebarText,
            borderRight: `1px solid ${theme.shellBorder}`,
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: "18px 0 40px rgba(2, 8, 23, 0.12)"
          }
        }}
      >
        <Toolbar />
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: sidebarCollapsed ? "center" : "space-between", px: 2, py: 1 }}>
            {!sidebarCollapsed && (
              <Box>
                <Typography sx={{ fontWeight: 700 }}>Student ERP</Typography>
                <Typography variant="caption" sx={{ color: theme.sidebarMuted }}>
                  {isAdmin ? "Admin Console" : "Student Portal"}
                </Typography>
              </Box>
            )}
            <IconButton onClick={() => setSidebarCollapsed((prev) => !prev)} sx={{ color: theme.sidebarText }}>
              {sidebarCollapsed ? <MenuRoundedIcon /> : <MenuOpenRoundedIcon />}
            </IconButton>
          </Box>
          <Divider sx={{ borderColor: theme.shellBorder }} />
          <List sx={{ px: 1.2, pt: 1.2 }}>
            {navItems.map((item) => (
              <ListItem key={item.key} disablePadding sx={{ mb: 0.6 }}>
                <Tooltip title={sidebarCollapsed ? item.label : ""} placement="right">
                  <ListItemButton
                    selected={currentPage === item.key}
                    onClick={() => setCurrentPage(item.key)}
                    sx={{
                      minHeight: 44,
                      borderRadius: 2,
                      justifyContent: sidebarCollapsed ? "center" : "flex-start",
                      "&.Mui-selected": {
                        backgroundColor: theme.selectedNavBg
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: sidebarCollapsed ? 0 : 36, color: theme.sidebarText }}>
                      {item.icon}
                    </ListItemIcon>
                    {!sidebarCollapsed && <ListItemText primary={item.label} />}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            ))}
          </List>

          <Box sx={{ mt: "auto", p: 2 }}>
            {!sidebarCollapsed && (
              <Box
                sx={{
                  borderRadius: 2,
                  p: 1.5,
                  mb: 1.5,
                  backgroundColor: theme.sidebarSurface,
                  border: "1px solid rgba(255,255,255,0.08)"
                }}
              >
                <Typography sx={{ fontWeight: 700 }}>{username}</Typography>
                <Chip
                  size="small"
                  icon={<SchoolRoundedIcon />}
                  label={role || "STUDENT"}
                  sx={{ mt: 1, color: theme.sidebarText, backgroundColor: theme.sidebarSurface }}
                />
              </Box>
            )}
            <Button
              fullWidth
              variant="outlined"
              startIcon={isDarkMode ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
              onClick={() => setIsDarkMode((prev) => !prev)}
              sx={{ mb: 1.2, color: theme.sidebarText, borderColor: theme.shellBorder, backgroundColor: theme.sidebarSurface }}
            >
              {sidebarCollapsed ? "" : isDarkMode ? "Light Mode" : "Dark Mode"}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<LogoutRoundedIcon />}
              onClick={handleLogout}
              sx={{ color: theme.sidebarText, borderColor: theme.shellBorder, backgroundColor: theme.sidebarSurface }}
            >
              {sidebarCollapsed ? "" : "Logout"}
            </Button>
          </Box>
        </Box>
      </Drawer>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Container
          maxWidth={false}
          sx={{
            py: 3,
            px: { xs: 2, md: 3 },
            width: "100%",
            maxWidth: 1480,
            mx: "auto"
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: theme.primaryText }}>
              Student Dashboard
            </Typography>
            <Typography variant="body1" sx={{ color: theme.mutedText, mt: 0.5 }}>
              Manage student records and capture attendance day wise with a monthly calendar.
            </Typography>
          </Box>

          {currentPage === "dashboard" && (
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 2.5 }}>
              <Card sx={cardSx}>
                <CardContent>
                  <Typography variant="overline" sx={{ color: theme.mutedText }}>Average Attendance</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, mt: 0.5 }}>{avgAttendance.toFixed(1)}%</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={avgAttendance}
                    sx={{ mt: 2, height: 10, borderRadius: 5 }}
                  />
                </CardContent>
              </Card>

              <Card sx={cardSx}>
                <CardContent>
                  <Typography variant="overline" sx={{ color: theme.mutedText }}>Students Requiring Attention</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, mt: 0.5 }}>{lowAttendanceStudents.length}</Typography>
                  <Typography sx={{ color: theme.mutedText, mt: 1 }}>Below {ATTENDANCE_ALERT_LIMIT}% attendance</Typography>
                </CardContent>
              </Card>

              <Card sx={cardSx}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Branch Performance</Typography>
                  {branchAnalytics.map((item) => (
                    <Box key={item.branch} sx={{ mb: 1.4 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.6 }}>
                        <Typography>{item.branch}</Typography>
                        <Typography>{item.average.toFixed(1)}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={item.average} sx={{ height: 9, borderRadius: 5 }} />
                    </Box>
                  ))}
                </CardContent>
              </Card>

              <Card sx={cardSx}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Attendance Distribution</Typography>
                  {attendanceDistribution.map((bucket) => (
                    <Box key={bucket.label} sx={{ mb: 1.4 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.6 }}>
                        <Typography>{bucket.label}</Typography>
                        <Typography>{bucket.count}</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={students.length ? (bucket.count / students.length) * 100 : 0}
                        color={bucket.label === "< 55%" ? "warning" : "primary"}
                        sx={{ height: 9, borderRadius: 5 }}
                      />
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Box>
          )}

          {currentPage === "students" && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "360px 1fr" },
                gap: 2.5,
                alignItems: "start"
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <Card sx={{ ...cardSx, alignSelf: "start" }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                      {editStudentId ? "Update Student" : "Add Student"}
                    </Typography>
                    <TextField
                      label="Student ID"
                      fullWidth
                      margin="normal"
                      value={studentForm.id}
                      onChange={(event) => setStudentForm((prev) => ({ ...prev, id: event.target.value.replace(/\D/g, "") }))}
                      sx={textFieldSx}
                    />
                    <TextField
                      label="Student Name"
                      fullWidth
                      margin="normal"
                      value={studentForm.name}
                      onChange={(event) => setStudentForm((prev) => ({ ...prev, name: event.target.value }))}
                      sx={textFieldSx}
                    />
                    <TextField
                      select
                      label="Branch"
                      fullWidth
                      margin="normal"
                      value={studentForm.branch}
                      onChange={(event) => setStudentForm((prev) => ({ ...prev, branch: event.target.value }))}
                      sx={textFieldSx}
                    >
                      {BRANCH_OPTIONS.map((branch) => (
                        <MenuItem key={branch} value={branch}>{branch}</MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      select
                      label="Year"
                      fullWidth
                      margin="normal"
                      value={studentForm.studentYear}
                      onChange={(event) => setStudentForm((prev) => ({ ...prev, studentYear: event.target.value }))}
                      sx={textFieldSx}
                    >
                      {[1, 2, 3, 4].map((year) => (
                        <MenuItem key={year} value={String(year)}>{`Year ${year}`}</MenuItem>
                      ))}
                    </TextField>
                    <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
                      <Button variant="contained" onClick={saveStudent} disabled={!isAdmin}>
                        {editStudentId ? "Update" : "Add"}
                      </Button>
                      <Button variant="outlined" onClick={resetStudentForm}>Clear</Button>
                      <Button
                        variant="outlined"
                        component="label"
                        disabled={!isAdmin || importingStudents}
                      >
                        {importingStudents ? "Importing..." : "Import CSV"}
                        <input type="file" hidden accept=".csv,text/csv" onChange={handleStudentCsvImport} />
                      </Button>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme.mutedText, mt: 1.5 }}>
                      CSV format: <Box component="span" sx={{ fontFamily: "monospace" }}>id,name,branch,studentYear</Box>
                    </Typography>
                    {!isAdmin && (
                      <Typography variant="body2" sx={{ color: theme.mutedText, mt: 1.5 }}>
                        Student accounts can view records but only admins can edit them.
                      </Typography>
                    )}
                  </CardContent>
                </Card>

                <Card sx={{ ...cardSx, alignSelf: "start" }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                      {selectedStudent ? `${selectedStudent.name} Details` : "Student Details"}
                    </Typography>
                    {selectedStudent ? (
                      <>
                        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 1.4, mb: 2 }}>
                          <Box>
                            <Typography variant="caption" sx={{ color: theme.mutedText }}>ID</Typography>
                            <Typography sx={{ fontWeight: 700 }}>{selectedStudent.id}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: theme.mutedText }}>Year</Typography>
                            <Typography sx={{ fontWeight: 700 }}>{selectedStudent.studentYear}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: theme.mutedText }}>Branch</Typography>
                            <Typography sx={{ fontWeight: 700 }}>{selectedStudent.branch}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: theme.mutedText }}>Attendance</Typography>
                            <Typography sx={{ fontWeight: 700 }}>{Number(selectedStudent.attendancePercentage || 0).toFixed(1)}%</Typography>
                          </Box>
                        </Box>

                        <Divider sx={{ my: 2, borderColor: theme.divider }} />

                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          Attendance Entry
                        </Typography>
                        <TextField
                          type="date"
                          label="Attendance Date"
                          fullWidth
                          margin="normal"
                          InputLabelProps={{ shrink: true }}
                          value={attendanceForm.attendanceDate}
                          onChange={(event) => setAttendanceForm((prev) => ({ ...prev, attendanceDate: event.target.value }))}
                          sx={textFieldSx}
                        />
                        <TextField
                          select
                          label="Status"
                          fullWidth
                          margin="normal"
                          value={attendanceForm.status}
                          onChange={(event) => setAttendanceForm((prev) => ({ ...prev, status: event.target.value }))}
                          sx={textFieldSx}
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <MenuItem key={status} value={status}>{status}</MenuItem>
                          ))}
                        </TextField>
                        <TextField
                          label="Remarks"
                          fullWidth
                          multiline
                          minRows={3}
                          margin="normal"
                          value={attendanceForm.remarks}
                          onChange={(event) => setAttendanceForm((prev) => ({ ...prev, remarks: event.target.value }))}
                          sx={textFieldSx}
                        />

                        <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
                          <Button variant="contained" onClick={saveAttendance} disabled={!isAdmin}>
                            {attendanceForm.recordId ? "Update Attendance" : "Save Attendance"}
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={() =>
                              setAttendanceForm((prev) => ({
                                ...prev,
                                recordId: null,
                                attendanceDate: getDateKey(new Date()),
                                status: "PRESENT",
                                remarks: ""
                              }))
                            }
                          >
                            Reset
                          </Button>
                          {attendanceForm.recordId && isAdmin && (
                            <Button
                              color="error"
                              startIcon={<DeleteOutlineRoundedIcon />}
                              onClick={() => setDeleteDialog({ open: true, recordId: attendanceForm.recordId })}
                            >
                              Delete
                            </Button>
                          )}
                        </Box>

                        {attendanceSummary && (
                          <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                              Summary
                            </Typography>
                            <Typography variant="body2" sx={{ color: theme.mutedText }}>Marked days: {attendanceSummary.totalMarkedDays}</Typography>
                            <Typography variant="body2" sx={{ color: theme.mutedText }}>Present: {attendanceSummary.presentDays}</Typography>
                            <Typography variant="body2" sx={{ color: theme.mutedText }}>Absent: {attendanceSummary.absentDays}</Typography>
                            <Typography variant="body2" sx={{ color: theme.mutedText }}>Late: {attendanceSummary.lateDays}</Typography>
                            <Typography variant="body2" sx={{ color: theme.mutedText }}>Leave: {attendanceSummary.leaveDays}</Typography>
                          </Box>
                        )}
                      </>
                    ) : (
                      <Typography variant="body2" sx={{ color: theme.mutedText }}>
                        Select a student from the roster to view student details and manage attendance.
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Box>

              <Card sx={cardSx}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    Student Roster
                  </Typography>
                  <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
                    <Table sx={{ minWidth: isAdmin ? 820 : 700 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ color: theme.tableHeaderText, backgroundColor: theme.tableHeaderBg }}>ID</TableCell>
                          <TableCell sx={{ color: theme.tableHeaderText, backgroundColor: theme.tableHeaderBg }}>Name</TableCell>
                          <TableCell sx={{ color: theme.tableHeaderText, backgroundColor: theme.tableHeaderBg }}>Branch</TableCell>
                          <TableCell sx={{ color: theme.tableHeaderText, backgroundColor: theme.tableHeaderBg }}>Year</TableCell>
                          <TableCell sx={{ minWidth: 180, color: theme.tableHeaderText, backgroundColor: theme.tableHeaderBg }}>Attendance</TableCell>
                          <TableCell sx={{ minWidth: 110, color: theme.tableHeaderText, backgroundColor: theme.tableHeaderBg }}>Marked Days</TableCell>
                          {isAdmin && <TableCell sx={{ minWidth: 120, color: theme.tableHeaderText, backgroundColor: theme.tableHeaderBg }}>Actions</TableCell>}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {students.map((student) => (
                          <TableRow
                            key={student.id}
                            hover
                            selected={String(student.id) === String(selectedStudentId)}
                            onClick={() => {
                              const value = String(student.id);
                              setSelectedStudentId(value);
                              setAttendanceForm((prev) => ({ ...prev, studentId: value }));
                            }}
                            sx={{
                              cursor: "pointer",
                              backgroundColor: String(student.id) === String(selectedStudentId) ? theme.rowSelectedBg : "transparent",
                              "& td": { color: theme.primaryText, borderColor: theme.tableBorder }
                            }}
                          >
                            <TableCell>{student.id}</TableCell>
                            <TableCell>{student.name}</TableCell>
                            <TableCell>{student.branch}</TableCell>
                            <TableCell>{student.studentYear}</TableCell>
                            <TableCell sx={{ minWidth: 180 }}>
                              <Typography variant="body2" sx={{ mb: 0.6 }}>
                                {Number(student.attendancePercentage || 0).toFixed(1)}%
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={Number(student.attendancePercentage || 0)}
                                color={Number(student.attendancePercentage || 0) < ATTENDANCE_ALERT_LIMIT ? "warning" : "primary"}
                                sx={{ height: 8, borderRadius: 4 }}
                              />
                            </TableCell>
                            <TableCell>{student.totalMarkedDays}</TableCell>
                            {isAdmin && (
                              <TableCell sx={{ minWidth: 120 }}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<EditRoundedIcon />}
                                  sx={{ color: theme.outlinedButtonColor, borderColor: theme.outlinedButtonBorder }}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    editStudent(student);
                                  }}
                                >
                                  Edit
                                </Button>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Box>
          )}

          {currentPage === "attendance" && (
            <Box>
              <Card sx={cardSx}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap", mb: 2.5 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {selectedStudent ? `${selectedStudent.name}'s Calendar` : "Attendance Calendar"}
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.mutedText }}>
                        {formatMonthLabel(selectedMonth)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                      <TextField
                        select
                        label="Student"
                        value={selectedStudentId}
                        onChange={(event) => {
                          const value = event.target.value;
                          setSelectedStudentId(value);
                          setAttendanceForm((prev) => ({ ...prev, studentId: value }));
                        }}
                        sx={{ ...textFieldSx, minWidth: 220 }}
                      >
                        {students.map((student) => (
                          <MenuItem key={student.id} value={String(student.id)}>
                            {student.name} ({student.id})
                          </MenuItem>
                        ))}
                      </TextField>
                      <TextField
                        type="month"
                        label="Calendar Month"
                        InputLabelProps={{ shrink: true }}
                        value={selectedMonth}
                        onChange={(event) => setSelectedMonth(event.target.value)}
                        sx={{ ...textFieldSx, minWidth: 170 }}
                      />
                      <Button
                        variant="outlined"
                        onClick={() => openDayAttendanceDialog(attendanceForm.attendanceDate)}
                        disabled={!isAdmin}
                      >
                        Open Day Sheet
                      </Button>
                      <Chip
                        icon={<EventAvailableRoundedIcon />}
                        label={`${attendanceRecords.length} marked days`}
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  </Box>

                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 1, mb: 1.2 }}>
                    {DAY_NAMES.map((day) => (
                      <Box key={day} sx={{ p: 1, textAlign: "center", color: theme.mutedText, fontWeight: 700 }}>
                        {day}
                      </Box>
                    ))}
                  </Box>

                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 1 }}>
                    {calendarDays.map((day) => {
                      const record = recordsByDate.get(day.iso);
                      const statusColor = getStatusColor(record?.status);
                      const isSelectedDate = attendanceForm.attendanceDate === day.iso;
                      return (
                        <Button
                          key={day.iso}
                          variant={isSelectedDate ? "contained" : "outlined"}
                          onClick={() => {
                            openAttendanceEditor(day.iso);
                            if (isAdmin) {
                              openDayAttendanceDialog(day.iso);
                            }
                          }}
                          sx={{
                            minHeight: 86,
                            borderRadius: 3,
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            flexDirection: "column",
                            color: day.inCurrentMonth ? theme.primaryText : theme.calendarOtherMonthText,
                            borderColor: isSelectedDate ? "#3b82f6" : "rgba(148,163,184,0.18)",
                            backgroundColor: record ? statusColor.bg : theme.calendarEmptyBg,
                            "&:hover": {
                              backgroundColor: record ? statusColor.bg : theme.calendarHoverBg
                            }
                          }}
                        >
                          <Typography sx={{ fontWeight: 700 }}>{day.label}</Typography>
                          {record && (
                            <Chip
                              label={record.status}
                              size="small"
                              sx={{
                                backgroundColor: statusColor.bg,
                                color: statusColor.fg,
                                fontWeight: 700
                              }}
                            />
                          )}
                        </Button>
                      );
                    })}
                  </Box>

                  <Divider sx={{ my: 2.5, borderColor: theme.divider }} />

                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                    Month Records
                  </Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: theme.tableHeaderText, backgroundColor: theme.tableHeaderBg }}>Date</TableCell>
                        <TableCell sx={{ color: theme.tableHeaderText, backgroundColor: theme.tableHeaderBg }}>Status</TableCell>
                        <TableCell sx={{ color: theme.tableHeaderText, backgroundColor: theme.tableHeaderBg }}>Remarks</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {attendanceRecords.map((record) => (
                        <TableRow
                          key={record.id}
                          hover
                          onClick={() => openAttendanceEditor(record.attendanceDate)}
                          sx={{
                            cursor: "pointer",
                            "& td": { color: theme.primaryText, borderColor: theme.tableBorder }
                          }}
                        >
                          <TableCell>{record.attendanceDate}</TableCell>
                          <TableCell>{record.status}</TableCell>
                          <TableCell>{record.remarks || "-"}</TableCell>
                        </TableRow>
                      ))}
                      {attendanceRecords.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3}>
                            <Typography variant="body2" sx={{ color: theme.mutedText }}>
                              No attendance has been marked for this month yet.
                            </Typography>
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
        onClose={() => setDeleteDialog({ open: false, recordId: null })}
        PaperProps={{
          sx: {
            background: theme.dialogBg,
            color: theme.primaryText
          }
        }}
      >
        <DialogTitle>Delete Attendance Record</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: theme.mutedText }}>
            This removes the selected day-wise attendance entry and recalculates the student attendance percentage.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, recordId: null })}>Cancel</Button>
          <Button color="error" onClick={confirmDeleteAttendance}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={dayAttendanceDialog.open}
        onClose={closeDayAttendanceDialog}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          sx: {
            background: theme.dialogBg,
            color: theme.primaryText
          }
        }}
      >
        <DialogTitle>Date-wise Attendance</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center", mb: 2 }}>
            <TextField
              type="date"
              label="Attendance Date"
              InputLabelProps={{ shrink: true }}
              value={dayAttendanceDialog.date}
              onChange={(event) => loadDayAttendance(event.target.value, true)}
              sx={{ ...textFieldSx, minWidth: 220 }}
            />
            <Button variant="outlined" onClick={() => applyStatusToAll("PRESENT")} disabled={loadingDayAttendance || savingDayAttendance}>
              Mark All Present
            </Button>
            <Button variant="outlined" onClick={() => applyStatusToAll("ABSENT")} disabled={loadingDayAttendance || savingDayAttendance}>
              Mark All Absent
            </Button>
          </Box>

          <DialogContentText sx={{ color: theme.mutedText, mb: 2 }}>
            Select one date and record attendance for every student in a single sheet.
          </DialogContentText>

          <TableContainer
            sx={{
              maxHeight: 460,
              border: `1px solid ${theme.tableBorder}`,
              borderRadius: 3,
              backgroundColor: isDarkMode ? "rgba(3, 9, 18, 0.94)" : "rgba(255,255,255,0.94)"
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: theme.tableHeaderText, backgroundColor: theme.tableHeaderBg }}>ID</TableCell>
                  <TableCell sx={{ color: theme.tableHeaderText, backgroundColor: theme.tableHeaderBg }}>Name</TableCell>
                  <TableCell sx={{ color: theme.tableHeaderText, backgroundColor: theme.tableHeaderBg }}>Branch</TableCell>
                  <TableCell sx={{ color: theme.tableHeaderText, backgroundColor: theme.tableHeaderBg }}>Year</TableCell>
                  <TableCell sx={{ color: theme.tableHeaderText, backgroundColor: theme.tableHeaderBg, minWidth: 320 }}>Status</TableCell>
                  <TableCell sx={{ color: theme.tableHeaderText, backgroundColor: theme.tableHeaderBg, minWidth: 220 }}>Remarks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dayAttendanceDialog.rows.map((row, index) => (
                  <TableRow
                    key={row.studentId}
                    sx={{
                      backgroundColor: index % 2 === 0
                        ? (isDarkMode ? "rgba(11, 19, 33, 0.98)" : "rgba(248, 250, 252, 0.98)")
                        : (isDarkMode ? "rgba(6, 12, 23, 0.98)" : "rgba(255,255,255,0.98)"),
                      "&:hover": {
                        backgroundColor: index % 2 === 0
                          ? (isDarkMode ? "rgba(16, 24, 40, 0.98)" : "rgba(241, 245, 249, 0.98)")
                          : (isDarkMode ? "rgba(10, 18, 32, 0.98)" : "rgba(248, 250, 252, 0.98)")
                      },
                      "&.MuiTableRow-hover:hover": {
                        backgroundColor: index % 2 === 0
                          ? (isDarkMode ? "rgba(16, 24, 40, 0.98)" : "rgba(241, 245, 249, 0.98)")
                          : (isDarkMode ? "rgba(10, 18, 32, 0.98)" : "rgba(248, 250, 252, 0.98)")
                      },
                      "& td": {
                        borderColor: theme.tableBorder,
                        color: theme.primaryText,
                        backgroundColor: "transparent"
                      }
                    }}
                  >
                    <TableCell sx={{ color: theme.primaryText }}>{row.studentId}</TableCell>
                    <TableCell sx={{ color: theme.primaryText }}>{row.studentName}</TableCell>
                    <TableCell sx={{ color: theme.primaryText }}>{row.branch}</TableCell>
                    <TableCell sx={{ color: theme.primaryText }}>{row.studentYear}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {STATUS_OPTIONS.map((status) => (
                          <Button
                            key={`${row.studentId}-${status}`}
                            type="button"
                            onClick={() => updateDayAttendanceRow(row.studentId, "status", status)}
                            sx={getDayStatusButtonSx(status, row.status)}
                          >
                            {status}
                          </Button>
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        value={row.remarks}
                        onChange={(event) => updateDayAttendanceRow(row.studentId, "remarks", event.target.value)}
                        sx={daySheetFieldSx}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {!loadingDayAttendance && dayAttendanceDialog.rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography variant="body2" sx={{ color: theme.mutedText }}>
                        No students found for attendance.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDayAttendanceDialog} disabled={savingDayAttendance}>Cancel</Button>
          <Button onClick={saveDayAttendanceSheet} variant="contained" disabled={loadingDayAttendance || savingDayAttendance}>
            {savingDayAttendance ? "Saving..." : "Save Attendance"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
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
