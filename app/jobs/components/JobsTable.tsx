"use client";
import { useState, useEffect, useCallback, forwardRef } from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { TableVirtuoso, TableComponents } from "react-virtuoso";
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
  status: string;
  source: string;
  posted_at: string;
  fetched_at: string;
  notes: string;
  apply_email: string | null;
  apply_subject: string | null;
}

interface Column {
  field: keyof Job;
  label: string;
  width?: number;
  flex?: boolean;
  render?: (value: unknown, row: Job) => React.ReactNode;
}

const columns: Column[] = [
  { field: "title", label: "Job Title", flex: true },
  { field: "company", label: "Company", width: 160 },
  { field: "location", label: "Location", width: 140 },
  {
    field: "source",
    label: "Source",
    width: 110,
    render: (value) => (
      <span
        style={{
          fontSize: 12,
          color: "rgba(255,255,255,0.5)",
          padding: "2px 8px",
          borderRadius: 9999,
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {value as string}
      </span>
    ),
  },
  {
    field: "status",
    label: "Status",
    width: 120,
    render: (value) => <StatusChip status={value as string} />,
  },
  {
    field: "posted_at",
    label: "Posted",
    width: 110,
    render: (value) => (
      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
        {value as string}
      </span>
    ),
  },
];

type SortDir = "asc" | "desc";

const VirtuosoTableComponents: TableComponents<Job> = {
  Scroller: forwardRef<HTMLDivElement>((props, ref) => (
    <TableContainer
      {...props}
      ref={ref}
      sx={{
        borderRadius: "8px",
        border: "1px solid rgba(255,255,255,0.08)",
        bgcolor: "#111111",
      }}
    />
  )),
  Table: (props) => (
    <Table {...props} sx={{ borderCollapse: "separate", tableLayout: "fixed" }} />
  ),
  TableHead: forwardRef<HTMLTableSectionElement>((props, ref) => (
    <TableHead {...props} ref={ref} />
  )),
  TableRow: ({ ...props }) => (
    <TableRow
      {...props}
      sx={{
        cursor: "pointer",
        "&:hover": { bgcolor: "rgba(255,255,255,0.03)" },
        transition: "background-color 0.1s",
      }}
    />
  ),
  TableBody: forwardRef<HTMLTableSectionElement>((props, ref) => (
    <TableBody {...props} ref={ref} />
  )),
};

export default function JobsTable() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [sortField, setSortField] = useState<keyof Job>("fetched_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("fetched_at", { ascending: false });

    if (!error && data) {
      setJobs(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSort = (field: keyof Job) => {
    const isAsc = sortField === field && sortDir === "asc";
    setSortDir(isAsc ? "desc" : "asc");
    setSortField(field);
  };

  const sortedJobs = [...jobs].sort((a, b) => {
    const aVal = a[sortField] ?? "";
    const bVal = b[sortField] ?? "";
    if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const handleRowClick = (job: Job) => {
    setSelectedJob(job);
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

  const handleDelete = (jobId: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    if (selectedJob?.id === jobId) {
      setSelectedJob(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", pt: 16 }}>
        <CircularProgress size={20} sx={{ color: "rgba(255,255,255,0.3)" }} />
      </Box>
    );
  }

  if (jobs.length === 0) {
    return (
      <Box sx={{ textAlign: "center", pt: 16 }}>
        <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
          No jobs found
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", height: "calc(100vh - 100px)" }}>
      <TableVirtuoso
        data={sortedJobs}
        components={VirtuosoTableComponents}
        fixedHeaderContent={() => (
          <TableRow sx={{ bgcolor: "#111111" }}>
            {columns.map((col) => (
              <TableCell
                key={col.field}
                sx={{
                  width: col.flex ? undefined : col.width,
                  bgcolor: "#111111",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <TableSortLabel
                  active={sortField === col.field}
                  direction={sortField === col.field ? sortDir : "asc"}
                  onClick={() => handleSort(col.field)}
                >
                  {col.label}
                </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        )}
        itemContent={(_index, job) => (
          <>
            {columns.map((col) => (
              <TableCell
                key={col.field}
                sx={{
                  width: col.flex ? undefined : col.width,
                  color: col.field === "title" ? "#ededed" : "rgba(255,255,255,0.6)",
                }}
                onClick={() => handleRowClick(job)}
              >
                {col.render ? col.render(job[col.field], job) : (job[col.field] as string)}
              </TableCell>
            ))}
          </>
        )}
      />

      <JobModal
        job={selectedJob}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />
    </Box>
  );
}
