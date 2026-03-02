import Link from "next/link";

export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#000000",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
        padding: "0 24px",
      }}
    >
      {/* Hero */}
      <div style={{ textAlign: "center", maxWidth: 640 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 32,
            padding: "6px 16px",
            borderRadius: 9999,
            border: "1px solid rgba(255,255,255,0.15)",
            fontSize: 13,
            color: "rgba(255,255,255,0.7)",
            letterSpacing: "0.02em",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: "#22c55e",
              display: "inline-block",
            }}
          />
          Automated daily
        </div>

        <h1
          style={{
            fontSize: "clamp(40px, 6vw, 64px)",
            fontWeight: 700,
            lineHeight: 1.1,
            margin: "0 0 20px 0",
            letterSpacing: "-0.03em",
          }}
        >
          Job Search
          <br />
          <span style={{ color: "rgba(255,255,255,0.5)" }}>Autopilot</span>
        </h1>

        <p
          style={{
            fontSize: 18,
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.5)",
            margin: "0 0 40px 0",
            maxWidth: 480,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Fetches, scores, and prepares applications for React &amp; Next.js roles — automatically, every morning.
        </p>

        <Link
          href="/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 32px",
            borderRadius: 9999,
            backgroundColor: "#ffffff",
            color: "#000000",
            fontSize: 15,
            fontWeight: 500,
            textDecoration: "none",
            transition: "opacity 0.15s",
          }}
        >
          Open Dashboard
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "flex",
          gap: 48,
          marginTop: 80,
          paddingTop: 40,
          borderTop: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {[
          { label: "Sources", value: "3" },
          { label: "Scored 1–5", value: "Auto" },
          { label: "Docs Generated", value: "Per Job" },
        ].map((stat) => (
          <div key={stat.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>{stat.value}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          fontSize: 12,
          color: "rgba(255,255,255,0.25)",
        }}
      >
        Arbeitnow &middot; LinkedIn &middot; Remotive
      </div>
    </div>
  );
}
