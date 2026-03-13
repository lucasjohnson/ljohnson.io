"use client";

const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
  new: { bg: "rgba(59,130,246,0.1)", color: "#60a5fa", label: "New" },
  prepared: { bg: "rgba(234,179,8,0.1)", color: "#facc15", label: "Prepared" },
  approved: { bg: "rgba(168,85,247,0.1)", color: "#c084fc", label: "Approved" },
  sent: { bg: "rgba(34,197,94,0.1)", color: "#4ade80", label: "Sent" },
  applied: { bg: "rgba(34,197,94,0.15)", color: "#22c55e", label: "Applied" },
  rejected: { bg: "rgba(239,68,68,0.1)", color: "#f87171", label: "Rejected" },
};

export default function StatusChip({ status }: { status: string }) {
  const config = statusConfig[status] || { bg: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", label: status };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "2px 10px",
        borderRadius: 9999,
        fontSize: 12,
        fontWeight: 500,
        backgroundColor: config.bg,
        color: config.color,
        lineHeight: "20px",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: config.color,
        }}
      />
      {config.label}
    </span>
  );
}
