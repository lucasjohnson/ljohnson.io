"use client";
import Chip from "@mui/material/Chip";

const statusConfig: Record<string, { color: "default" | "primary" | "secondary" | "success" | "warning" | "error" | "info"; label: string }> = {
  new: { color: "info", label: "New" },
  prepared: { color: "warning", label: "Prepared" },
  approved: { color: "primary", label: "Approved" },
  sent: { color: "success", label: "Sent" },
  rejected: { color: "error", label: "Rejected" },
};

export default function StatusChip({ status }: { status: string }) {
  const config = statusConfig[status] || { color: "default" as const, label: status };
  return <Chip label={config.label} color={config.color} size="small" />;
}
