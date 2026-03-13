"use client";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import JobsTable from "./components/JobsTable";

export default function JobsPage() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0a0a0a" }}>
      <Box
        component="header"
        sx={{
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          px: 3,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: "6px",
            background: "linear-gradient(135deg, #333 0%, #555 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 7V5a4 4 0 0 0-8 0v2" />
          </svg>
        </Box>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 600,
            fontSize: 14,
            color: "#ededed",
            letterSpacing: "-0.01em",
          }}
        >
          Jobs
        </Typography>
      </Box>

      <Box sx={{ px: 3, py: 2 }}>
        <JobsTable />
      </Box>
    </Box>
  );
}
