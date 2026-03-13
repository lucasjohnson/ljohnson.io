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
        <Typography
          variant="body1"
          sx={{
            fontWeight: 600,
            fontSize: 14,
            color: "#ededed",
            letterSpacing: "-0.01em",
          }}
        >
          ljohnson.io
        </Typography>
      </Box>

      <Box sx={{ px: 3, py: 2 }}>
        <JobsTable />
      </Box>
    </Box>
  );
}
