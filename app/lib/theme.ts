"use client";
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#ffffff" },
    secondary: { main: "#888888" },
    background: { default: "#0a0a0a", paper: "#111111" },
    text: { primary: "#ededed", secondary: "rgba(255,255,255,0.5)" },
    divider: "rgba(255,255,255,0.08)",
    action: {
      hover: "rgba(255,255,255,0.04)",
      selected: "rgba(255,255,255,0.06)",
    },
    error: { main: "#ef4444" },
    success: { main: "#22c55e" },
    warning: { main: "#eab308" },
    info: { main: "#3b82f6" },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 6,
          fontWeight: 500,
          fontSize: 13,
        },
        contained: {
          backgroundColor: "#ededed",
          color: "#0a0a0a",
          boxShadow: "none",
          "&:hover": {
            backgroundColor: "#ffffff",
            boxShadow: "none",
          },
        },
        outlined: {
          borderColor: "rgba(255,255,255,0.15)",
          color: "#ededed",
          "&:hover": {
            borderColor: "rgba(255,255,255,0.3)",
            backgroundColor: "rgba(255,255,255,0.04)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          fontSize: 12,
          borderRadius: 9999,
          height: 24,
        },
        outlined: {
          borderColor: "rgba(255,255,255,0.15)",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: "#111111",
          backgroundImage: "none",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: { padding: "20px 24px 12px" },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          borderColor: "rgba(255,255,255,0.08)",
          padding: "16px 24px",
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          borderTop: "1px solid rgba(255,255,255,0.08)",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: "rgba(255,255,255,0.08)" },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            fontSize: 14,
            "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
            "&:hover fieldset": { borderColor: "rgba(255,255,255,0.3)" },
            "&.Mui-focused fieldset": { borderColor: "rgba(255,255,255,0.5)" },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontSize: 13,
        },
        standardError: {
          backgroundColor: "rgba(239,68,68,0.1)",
          color: "#fca5a5",
          border: "1px solid rgba(239,68,68,0.2)",
        },
        standardSuccess: {
          backgroundColor: "rgba(34,197,94,0.1)",
          color: "#86efac",
          border: "1px solid rgba(34,197,94,0.2)",
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: { backgroundColor: "rgba(255,255,255,0.06)" },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: "rgba(255,255,255,0.06)",
          fontSize: 13,
          padding: "10px 16px",
        },
        head: {
          fontSize: 12,
          fontWeight: 500,
          color: "rgba(255,255,255,0.5)",
          textTransform: "uppercase" as const,
          letterSpacing: "0.04em",
        },
      },
    },
    MuiTableSortLabel: {
      styleOverrides: {
        root: {
          color: "rgba(255,255,255,0.5)",
          "&:hover": { color: "rgba(255,255,255,0.8)" },
          "&.Mui-active": { color: "#ededed" },
        },
        icon: { color: "rgba(255,255,255,0.3) !important" },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#0a0a0a",
          color: "#ededed",
        },
      },
    },
  },
});
