"use client";
import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import StarIcon from "@mui/icons-material/Star";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DescriptionIcon from "@mui/icons-material/Description";
import SendIcon from "@mui/icons-material/Send";
import StatusChip from "./StatusChip";

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
  notes: string;
}

interface JobModalProps {
  job: Job | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (jobId: string, status: string) => void;
}

export default function JobModal({ job, open, onClose, onStatusChange }: JobModalProps) {
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!job) return null;

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id }),
      });
      if (!res.ok) throw new Error("Failed to generate documents");
      onStatusChange(job.id, "prepared");
      setSuccess("Documents generated successfully!");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSend = async () => {
    if (!recipientEmail) {
      setError("Please enter a recipient email");
      return;
    }
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id, recipientEmail }),
      });
      if (!res.ok) throw new Error("Failed to send email");
      onStatusChange(job.id, "sent");
      setSuccess("Application sent successfully!");
      setShowSendDialog(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  const scoreStars = Array.from({ length: 5 }, (_, i) => (
    <StarIcon key={i} sx={{ color: i < job.score ? "#faaf00" : "#e0e0e0", fontSize: 20 }} />
  ));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" component="div" fontWeight={700}>
          {job.title}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {job.company} — {job.location}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center", flexWrap: "wrap" }}>
          <StatusChip status={job.status} />
          <Box sx={{ display: "flex" }}>{scoreStars}</Box>
          <Chip label={job.source} variant="outlined" size="small" />
          {job.remote && <Chip label="Remote" color="success" variant="outlined" size="small" />}
          {job.visa_sponsorship && <Chip label="Visa Sponsor" color="primary" variant="outlined" size="small" />}
        </Box>

        {job.salary && (
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Salary:</strong> {job.salary}
          </Typography>
        )}

        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Posted:</strong> {job.posted_at}
        </Typography>

        {job.tags && job.tags.length > 0 && (
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mb: 2 }}>
            {job.tags.map((tag, i) => (
              <Chip key={i} label={tag} size="small" variant="outlined" sx={{ fontSize: 12 }} />
            ))}
          </Box>
        )}

        <Link href={job.url} target="_blank" rel="noopener" sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 2 }}>
          View original posting <OpenInNewIcon sx={{ fontSize: 16 }} />
        </Link>

        <Divider sx={{ my: 2 }} />

        {/* Send dialog inline */}
        {showSendDialog && (
          <Box sx={{ mb: 2, p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Send Application Email</Typography>
            <TextField
              fullWidth
              size="small"
              label="Recipient Email"
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="hr@company.com"
              sx={{ mb: 1 }}
            />
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={handleSend}
                disabled={sending}
                startIcon={sending ? <CircularProgress size={16} /> : <SendIcon />}
              >
                {sending ? "Sending..." : "Confirm & Send"}
              </Button>
              <Button size="small" onClick={() => setShowSendDialog(false)}>Cancel</Button>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        {(job.status === "new") && (
          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={generating}
            startIcon={generating ? <CircularProgress size={16} /> : <DescriptionIcon />}
          >
            {generating ? "Generating..." : "Generate Resume & Cover Letter"}
          </Button>
        )}

        {(job.status === "prepared" || job.status === "approved") && (
          <Button
            variant="contained"
            color="success"
            onClick={() => setShowSendDialog(true)}
            startIcon={<SendIcon />}
          >
            Approve & Send
          </Button>
        )}

        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
