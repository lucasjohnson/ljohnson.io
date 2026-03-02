"use client";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import WorkIcon from "@mui/icons-material/Work";
import JobsTable from "./components/JobsTable";

export default function JobsPage() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: "white", borderBottom: "1px solid #e0e0e0" }}>
        <Toolbar>
          <WorkIcon sx={{ mr: 1.5, color: "primary.main" }} />
          <Typography variant="h6" component="h1" sx={{ fontWeight: 700, color: "text.primary" }}>
            Job Application Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <JobsTable />
      </Container>
    </Box>
  );
}
