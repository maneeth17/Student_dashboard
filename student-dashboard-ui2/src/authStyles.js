export const authPalette = {
  pageBg: "radial-gradient(circle at 12% 14%, rgba(70, 211, 255, 0.22) 0%, rgba(70, 211, 255, 0.05) 16%, transparent 30%), radial-gradient(circle at 86% 16%, rgba(116, 109, 255, 0.20) 0%, rgba(116, 109, 255, 0.04) 18%, transparent 32%), radial-gradient(circle at 55% 84%, rgba(16, 185, 129, 0.12) 0%, rgba(16, 185, 129, 0.02) 18%, transparent 36%), linear-gradient(135deg, #050b14 0%, #0a1422 40%, #0f1a2b 100%)",
  glassBg: "linear-gradient(180deg, rgba(15, 23, 42, 0.72) 0%, rgba(15, 23, 42, 0.52) 100%)",
  glassBorder: "1px solid rgba(148, 163, 184, 0.16)",
  textPrimary: "#f8fbff",
  textMuted: "rgba(203, 217, 239, 0.78)",
  inputBg: "rgba(6, 15, 26, 0.48)",
  inputBorder: "rgba(148, 163, 184, 0.20)",
  inputLabel: "rgba(224, 234, 248, 0.82)",
  pillBg: "rgba(255,255,255,0.08)",
  primaryButton: "linear-gradient(135deg, #2dd4bf 0%, #2563eb 55%, #4f46e5 100%)",
  primaryButtonHover: "linear-gradient(135deg, #22c7b3 0%, #1d56d8 55%, #4338ca 100%)"
};

export const authFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: authPalette.inputBg,
    borderRadius: 3,
    color: authPalette.textPrimary,
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    "& fieldset": {
      borderColor: authPalette.inputBorder
    },
    "&:hover fieldset": {
      borderColor: "rgba(135, 206, 250, 0.45)"
    },
    "&.Mui-focused fieldset": {
      borderColor: "#7dd3fc",
      borderWidth: 1.6
    }
  },
  "& .MuiInputBase-input": {
    color: authPalette.textPrimary
  },
  "& .MuiInputLabel-root": {
    color: authPalette.inputLabel
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#a5f3fc"
  },
  "& .MuiSvgIcon-root": {
    color: "rgba(223, 234, 255, 0.82)"
  }
};

export const authPageSx = {
  minHeight: "100vh",
  background: authPalette.pageBg,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  px: { xs: 2, md: 3 },
  py: { xs: 3, md: 5 },
  position: "relative",
  overflow: "hidden"
};

export const authOrbs = [
  {
    width: 340,
    height: 340,
    top: "-2%",
    left: "-3%",
    background: "radial-gradient(circle, rgba(45,212,191,0.24), rgba(45,212,191,0.06) 38%, transparent 68%)"
  },
  {
    width: 300,
    height: 300,
    bottom: "2%",
    right: "2%",
    background: "radial-gradient(circle, rgba(99,102,241,0.28), rgba(99,102,241,0.06) 40%, transparent 70%)"
  },
  {
    width: 220,
    height: 220,
    top: "55%",
    left: "18%",
    background: "radial-gradient(circle, rgba(56,189,248,0.16), rgba(56,189,248,0.04) 46%, transparent 72%)"
  }
];

export const authShellSx = {
  width: "100%",
  maxWidth: 1220,
  minHeight: { xs: "auto", lg: 720 },
  borderRadius: { xs: 5, md: 7 },
  border: authPalette.glassBorder,
  background: authPalette.glassBg,
  boxShadow: "0 36px 100px rgba(2, 8, 23, 0.46)",
  backdropFilter: "blur(30px)",
  WebkitBackdropFilter: "blur(30px)",
  overflow: "hidden",
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    inset: 0,
    background: "linear-gradient(120deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 26%, rgba(255,255,255,0) 56%)",
    pointerEvents: "none"
  },
  "&::after": {
    content: '""',
    position: "absolute",
    inset: 1,
    borderRadius: "inherit",
    border: "1px solid rgba(255,255,255,0.06)",
    pointerEvents: "none"
  }
};
