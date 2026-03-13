"use client";
import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DescriptionIcon from "@mui/icons-material/Description";
import SendIcon from "@mui/icons-material/Send";
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
  const [coverLetterText, setCoverLetterText] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setGenerating(false);
      setSending(false);
      setShowSendDialog(false);
      setRecipientEmail(job?.apply_email || "");
      setError("");
      setSuccess("");
      setCoverLetterText(null);
      setPreviewLoading(false);
      setDeleting(false);
      setMarkingApplied(false);
    }
  }, [open, job?.id]);

  useEffect(() => {
    if (!open || !job) return;
    if (!PREVIEW_STATUSES.includes(job.status)) return;

    const fetchCoverLetter = async () => {
      setPreviewLoading(true);
      try {
        const res = await fetch(`/api/applications/text?jobId=${job.id}`);
        if (res.ok) {
          const { coverLetterText: text } = await res.json();
          setCoverLetterText(text);
        }
      } catch {
      } finally {
        setPreviewLoading(false);
      }
    };

    fetchCoverLetter();
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
      const { coverLetterText: text } = await res.json();
      setCoverLetterText(text);
      onStatusChange(job.id, "prepared");
      setSuccess("Cover letter generated!");
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

  const hasPreview = PREVIEW_STATUSES.includes(job.status) || coverLetterText;

  const Tag = ({ children }: { children: React.ReactNode }) => (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 9999,
        fontSize: 12,
        border: "1px solid rgba(255,255,255,0.1)",
        color: "rgba(255,255,255,0.5)",
      }}
    >
      {children}
    </span>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth={hasPreview ? "md" : "sm"} fullWidth>
      <Box sx={{ px: 3, pt: 2.5, pb: 1.5 }}>
        <Typography sx={{ fontSize: 18, fontWeight: 600, color: "#ededed", letterSpacing: "-0.02em" }}>
          {job.title}
        </Typography>
        <Typography sx={{ fontSize: 14, color: "rgba(255,255,255,0.45)", mt: 0.25 }}>
          {job.company} &middot; {job.location}
        </Typography>
      </Box>

      <DialogContent sx={{ pt: "12px !important" }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box sx={{ display: "flex", gap: 1, mb: 2, alignItems: "center", flexWrap: "wrap" }}>
          <StatusChip status={job.status} />
          <Tag>{job.source}</Tag>
          {job.remote && <Tag>Remote</Tag>}
          {job.visa_sponsorship && <Tag>Visa Sponsor</Tag>}
        </Box>

        {job.salary && (
          <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.6)", mb: 0.5 }}>
            <span style={{ color: "rgba(255,255,255,0.35)" }}>Salary</span> &nbsp;{job.salary}
          </Typography>
        )}

        <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.6)", mb: 1.5 }}>
          <span style={{ color: "rgba(255,255,255,0.35)" }}>Posted</span> &nbsp;{job.posted_at}
        </Typography>

        {job.tags && job.tags.length > 0 && (
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mb: 2 }}>
            {job.tags.map((tag, i) => (
              <Tag key={i}>{tag}</Tag>
            ))}
          </Box>
        )}

        <Link
          href={job.url}
          target="_blank"
          rel="noopener"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            mb: 2,
            fontSize: 13,
            color: "rgba(255,255,255,0.5)",
            textDecoration: "none",
            "&:hover": { color: "#ededed" },
            transition: "color 0.15s",
          }}
        >
          View original posting <OpenInNewIcon sx={{ fontSize: 14 }} />
        </Link>

        {hasPreview && (
          <>
            <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.08)", my: 2 }} />
            <Box>
              <Typography sx={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.04em", mb: 1 }}>
                Cover Letter
              </Typography>

              {previewLoading ? (
                <Box sx={{ p: 2 }}>
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="90%" />
                  <Skeleton variant="rectangular" height={120} sx={{ mt: 1 }} />
                </Box>
              ) : (
                <Box
                  sx={{
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                    p: 2.5,
                    maxHeight: 400,
                    overflow: "auto",
                    whiteSpace: "pre-wrap",
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: "rgba(255,255,255,0.8)",
                  }}
                >
                  {coverLetterText}
                </Box>
              )}
            </Box>
          </>
        )}

        {showSendDialog && (
          <>
            <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.08)", my: 2 }} />
            <Box sx={{ p: 2, bgcolor: "rgba(255,255,255,0.03)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#ededed", mb: 1.5 }}>
                Send Application Email
              </Typography>
              <TextField
                fullWidth
                size="small"
                label="Recipient Email"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="hr@company.com"
                sx={{ mb: 1.5 }}
              />
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleSend}
                  disabled={sending}
                  startIcon={sending ? <CircularProgress size={14} /> : <SendIcon sx={{ fontSize: 14 }} />}
                >
                  {sending ? "Sending..." : "Confirm & Send"}
                </Button>
                <Button variant="outlined" size="small" onClick={() => setShowSendDialog(false)}>
                  Cancel
                </Button>
              </Box>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        {job.status === "new" && (
          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={generating}
            startIcon={generating ? <CircularProgress size={14} /> : <DescriptionIcon sx={{ fontSize: 16 }} />}
          >
            {generating ? "Generating..." : "Generate Cover Letter"}
          </Button>
        )}

        {(job.status === "prepared" || job.status === "approved") && (
          <Button
            variant="contained"
            onClick={() => setShowSendDialog(true)}
            startIcon={<SendIcon sx={{ fontSize: 16 }} />}
          >
            Approve & Send
          </Button>
        )}

        {job.status !== "applied" && (
          <Button
            variant="outlined"
            onClick={handleMarkApplied}
            disabled={markingApplied}
            startIcon={markingApplied ? <CircularProgress size={14} /> : <CheckCircleIcon sx={{ fontSize: 16 }} />}
          >
            {markingApplied ? "Updating..." : "Mark as Applied"}
          </Button>
        )}

        <Box sx={{ flex: 1 }} />

        <Button
          variant="outlined"
          onClick={handleDelete}
          disabled={deleting}
          sx={{
            borderColor: "rgba(239,68,68,0.3)",
            color: "#f87171",
            "&:hover": { borderColor: "#ef4444", bgcolor: "rgba(239,68,68,0.08)" },
          }}
          startIcon={deleting ? <CircularProgress size={14} /> : <DeleteIcon sx={{ fontSize: 16 }} />}
        >
          {deleting ? "Deleting..." : "Delete"}
        </Button>

        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
