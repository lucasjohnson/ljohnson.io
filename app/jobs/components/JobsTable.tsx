"use client";
import { useState, useEffect, useCallback } from "react";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import StarIcon from "@mui/icons-material/Star";
import { supabase } from "@/lib/supabase/client";
import StatusChip from "./StatusChip";
import JobModal from "./JobModal";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  visa_sponsorship: boolean;
  salary: string | null;
  tags: string[];
  url: string;
  score: number;
  status: string;
  source: string;
  posted_at: string;
  fetched_at: string;
  notes: string;
  apply_email: string | null;
  apply_subject: string | null;
}

const columns: GridColDef[] = [
  {
    field: "score",
    headerName: "Score",
    width: 100,
    renderCell: (params: GridRenderCellParams) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
        {Array.from({ length: 5 }, (_, i) => (
          <StarIcon
            key={i}
            sx={{
              color: i < params.value ? "#faaf00" : "#e0e0e0",
              fontSize: 16,
            }}
          />
        ))}
      </Box>
    ),
  },
  { field: "title", headerName: "Job Title", flex: 1, minWidth: 200 },
  { field: "company", headerName: "Company", width: 160 },
  { field: "location", headerName: "Location", width: 140 },
  {
    field: "source",
    headerName: "Source",
    width: 110,
    renderCell: (params: GridRenderCellParams) => (
      <Chip label={params.value} size="small" variant="outlined" />
    ),
  },
  {
    field: "status",
    headerName: "Status",
    width: 110,
    renderCell: (params: GridRenderCellParams) => (
      <StatusChip status={params.value} />
    ),
  },
  { field: "posted_at", headerName: "Posted", width: 110 },
];

export default function JobsTable() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("score", { ascending: false })
      .order("fetched_at", { ascending: false });

    if (!error && data) {
      setJobs(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleRowClick = (params: { row: Job }) => {
    setSelectedJob(params.row);
    setModalOpen(true);
  };

  const handleStatusChange = (jobId: string, newStatus: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j)),
    );
    if (selectedJob?.id === jobId) {
      setSelectedJob((prev) => (prev ? { ...prev, status: newStatus } : prev));
    }
  };

  return (
    <Box sx={{ width: "100%", height: "calc(100vh - 140px)" }}>
      <DataGrid
        rows={jobs}
        columns={columns}
        loading={loading}
        onRowClick={handleRowClick}
        initialState={{
          sorting: { sortModel: [{ field: "score", sort: "desc" }] },
          pagination: { paginationModel: { pageSize: 25 } },
        }}
        pageSizeOptions={[10, 25, 50, 100]}
        sx={{
          bgcolor: "background.paper",
          borderRadius: 2,
          "& .MuiDataGrid-row": { cursor: "pointer" },
          "& .MuiDataGrid-row:hover": { bgcolor: "action.hover" },
        }}
        disableRowSelectionOnClick
      />

      <JobModal
        job={selectedJob}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onStatusChange={handleStatusChange}
      />
    </Box>
  );
}
