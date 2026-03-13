"use client";

import { motion } from "motion/react";
import ContactModal from "./ContactModal";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const pillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 24px",
  borderRadius: 9999,
  border: "1px solid rgba(255,255,255,0.15)",
  color: "rgba(255,255,255,0.7)",
  fontSize: 14,
  fontWeight: 500,
  textDecoration: "none",
  transition: "border-color 0.15s, color 0.15s",
  cursor: "pointer",
};

export default function HeroAnimated() {
  return (
    <div style={{ textAlign: "center", maxWidth: 800 }}>
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, ease: "easeOut" }}
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
        Looking for work
      </motion.div>

      <motion.h1
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
        style={{
          fontSize: "clamp(40px, 6vw, 64px)",
          fontWeight: 700,
          lineHeight: 1.1,
          margin: "0 0 20px 0",
          letterSpacing: "-0.03em",
        }}
      >
        Lucas Johnson
        <br />
        <span style={{ color: "rgba(255,255,255,0.5)" }}>
          Frontend Engineer
        </span>
      </motion.h1>

      <motion.p
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
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
        9+ years of experience building production web applications with React,
        TypeScript, and Next.js.
      </motion.p>

      <div
        style={{
          display: "flex",
          gap: 16,
          justifyContent: "center",
        }}
      >
        <motion.a
          className="pill-link"
          href="https://github.com/lucasjohnson"
          target="_blank"
          rel="noopener noreferrer"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.5 }}
          style={pillStyle}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          GitHub
        </motion.a>
        <motion.a
          className="pill-link"
          href="https://www.linkedin.com/in/wpkdlkftmi/"
          target="_blank"
          rel="noopener noreferrer"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.65 }}
          style={pillStyle}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          LinkedIn
        </motion.a>
        <motion.a
          className="pill-link"
          href="/Lucas-Johnson-Frontend-Engineer-Resume.pdf"
          download
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.8 }}
          style={pillStyle}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Resume
        </motion.a>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.95 }}
        >
          <ContactModal />
        </motion.div>
      </div>
    </div>
  );
}
