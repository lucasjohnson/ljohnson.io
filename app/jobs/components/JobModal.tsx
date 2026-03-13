"use client";
import { useState, useEffect } from "react";
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
import Skeleton from "@mui/material/Skeleton";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DescriptionIcon from "@mui/icons-material/Description";
import SendIcon from "@mui/icons-material/Send";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
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
  status: string;
  source: string;
  posted_at: string;
  notes: string;
  apply_email: string | null;
  apply_subject: string | null;
}

interface JobModalProps {
  job: Job | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (jobId: string, status: string) => void;
  onDelete: (jobId: string) => void;
}

function wrapHtml(html: string | null): string {
  if (!html) return "<p style='padding:16px;color:#999'>No preview available</p>";
  return `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      padding: 24px;
      margin: 0;
      color: #333;
    }
    h1 { font-size: 18px; margin: 16px 0 8px; }
    h2 { font-size: 16px; margin: 12px 0 6px; }
    p { margin: 4px 0; }
    ul, ol { margin: 4px 0; padding-left: 24px; }
  </style>
</head>
<body>${html}</body>
</html>`;
}

const PREVIEW_STATUSES = ["prepared", "approved", "sent"];

export default function JobModal({ job, open, onClose, onStatusChange, onDelete }: JobModalProps) {
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [markingApplied, setMarkingApplied] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [coverLetterHtml, setCoverLetterHtml] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (open) {
      setGenerating(false);
      setSending(false);
      setShowSendDialog(false);
      setRecipientEmail(job?.apply_email || "");
      setError("");
      setSuccess("");
      setCoverLetterHtml(null);
      setPreviewLoading(false);
      setDownloading(false);
      setDeleting(false);
      setMarkingApplied(false);
    }
  }, [open, job?.id]);

  useEffect(() => {
    if (!open || !job) return;
    if (!PREVIEW_STATUSES.includes(job.status)) return;

    const fetchPreviews = async () => {
      setPreviewLoading(true);
      try {
        const coverRes = await fetch(`/api/applications/preview?jobId=${job.id}&doc=cover-letter`);
        if (coverRes.ok) {
          const { html } = await coverRes.json();
          setCoverLetterHtml(html);
        }
      } catch {
        // Previews are non-critical
      } finally {
        setPreviewLoading(false);
      }
    };

    fetchPreviews();
  }, [open, job?.id, job?.status]);

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
      if (!res.ok) throw new Error("Failed to generate cover letter");
      onStatusChange(job.id, "prepared");
      setSuccess("Cover letter generated!");

      // Fetch preview immediately after generation
      const coverRes = await fetch(`/api/applications/preview?jobId=${job.id}&doc=cover-letter`);
      if (coverRes.ok) setCoverLetterHtml((await coverRes.json()).html);
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

  const handleDownload = async () => {
    setDownloading(true);
    setError("");
    try {
      const res = await fetch("/api/applications/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id }),
      });
      if (!res.ok) throw new Error("Failed to download documents");
      const { path } = await res.json();
      setSuccess(`Documents saved to ${path}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/jobs/${job.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete job");
      onDelete(job.id);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  const handleMarkApplied = async () => {
    setMarkingApplied(true);
    setError("");
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "applied" }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      onStatusChange(job.id, "applied");
      setSuccess("Marked as applied!");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setMarkingApplied(false);
    }
  };

  const hasPreview = PREVIEW_STATUSES.includes(job.status) || coverLetterHtml;

  return (
    <Dialog open={open} onClose={onClose} maxWidth={hasPreview ? "md" : "sm"} fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" component="div" fontWeight={700}>
          {job.title}
        </Typography>
        <Typography variant="subtitle1" component="span" color="text.secondary">
          {job.company} — {job.location}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center", flexWrap: "wrap" }}>
          <StatusChip status={job.status} />
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

        {/* Document Previews */}
        {hasPreview && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Cover Letter Preview</Typography>

              {previewLoading ? (
                <Box sx={{ p: 2 }}>
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="90%" />
                  <Skeleton variant="rectangular" height={200} sx={{ mt: 1 }} />
                </Box>
              ) : (
                <Box
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    height: 400,
                    overflow: "hidden",
                  }}
                >
                  <iframe
                    srcDoc={wrapHtml(coverLetterHtml)}
                    sandbox=""
                    style={{ width: "100%", height: "100%", border: "none" }}
                    title="Cover Letter Preview"
                  />
                </Box>
              )}
            </Box>
          </>
        )}

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
            {generating ? "Generating..." : "Generate Cover Letter"}
          </Button>
        )}

        {PREVIEW_STATUSES.includes(job.status) && (
          <Button
            variant="outlined"
            onClick={handleDownload}
            disabled={downloading}
            startIcon={downloading ? <CircularProgress size={16} /> : <DownloadIcon />}
          >
            {downloading ? "Saving..." : "Download"}
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

        {job.status !== "applied" && (
          <Button
            variant="outlined"
            color="info"
            onClick={handleMarkApplied}
            disabled={markingApplied}
            startIcon={markingApplied ? <CircularProgress size={16} /> : <CheckCircleIcon />}
          >
            {markingApplied ? "Updating..." : "Mark as Applied"}
          </Button>
        )}

        <Button
          variant="outlined"
          color="error"
          onClick={handleDelete}
          disabled={deleting}
          startIcon={deleting ? <CircularProgress size={16} /> : <DeleteIcon />}
        >
          {deleting ? "Deleting..." : "Delete"}
        </Button>

        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
