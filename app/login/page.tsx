"use client";
import { useState, FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const returnUrl = searchParams.get("return_url") || "/jobs";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(returnUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ password, return_url: returnUrl }),
        redirect: "follow",
      });

      if (res.redirected) {
        router.push(res.url);
        return;
      }

      if (res.ok) {
        router.push(returnUrl);
      } else {
        setError("Incorrect password");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#000000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
        padding: "0 24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 380, textAlign: "center" }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: "linear-gradient(135deg, #333 0%, #555 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 6H16L14.5 3H9.5L8 6H4C3.45 6 3 6.45 3 7V19C3 19.55 3.45 20 4 20H20C20.55 20 21 19.55 21 19V7C21 6.45 20.55 6 20 6Z"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M9 14L11 16L15 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: "#ffffff",
            margin: "0 0 8px 0",
            letterSpacing: "-0.02em",
          }}
        >
          Welcome back
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.45)",
            margin: "0 0 32px 0",
          }}
        >
          Enter your password to access the dashboard
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            autoFocus
            style={{
              width: "100%",
              padding: "12px 16px",
              fontSize: 14,
              backgroundColor: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 8,
              color: "#ffffff",
              outline: "none",
              marginBottom: error ? 12 : 16,
              boxSizing: "border-box",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)")}
          />

          {error && (
            <p
              style={{
                fontSize: 13,
                color: "#ef4444",
                margin: "0 0 12px 0",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px 24px",
              fontSize: 14,
              fontWeight: 500,
              backgroundColor: "#ffffff",
              color: "#000000",
              border: "none",
              borderRadius: 8,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "opacity 0.15s",
            }}
          >
            {loading ? "Signing in..." : "Continue"}
          </button>
        </form>

        <a
          href="/"
          style={{
            display: "inline-block",
            marginTop: 24,
            fontSize: 13,
            color: "rgba(255,255,255,0.35)",
            textDecoration: "none",
          }}
        >
          &larr; Back to home
        </a>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "100vh", backgroundColor: "#000000" }} />
      }
    >
      <LoginForm />
    </Suspense>
  );
}
