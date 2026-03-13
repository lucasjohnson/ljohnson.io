"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "motion/react";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  message: z.string().min(1, "Message is required"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const pillButton: React.CSSProperties = {
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
  background: "none",
  cursor: "pointer",
  fontFamily: "inherit",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.15)",
  backgroundColor: "rgba(255,255,255,0.05)",
  color: "#fff",
  fontSize: 14,
  fontFamily: "inherit",
  outline: "none",
  transition: "border-color 0.15s",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  color: "rgba(255,255,255,0.5)",
  marginBottom: 6,
  textAlign: "left",
};

const errorStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#ef4444",
  marginTop: 4,
  textAlign: "left",
};

export default function ContactModal() {
  const [open, setOpen] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setSubmitStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setSubmitStatus("sent");
      reset();
      setTimeout(() => {
        setOpen(false);
        setSubmitStatus("idle");
      }, 1000);
    } catch {
      setSubmitStatus("error");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSubmitStatus("idle");
    reset();
  };

  return (
    <>
      <button
        className="pill-link"
        onClick={() => setOpen(true)}
        style={pillButton}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M22 7l-10 6L2 7" />
        </svg>
        Contact
      </button>

      {open && (
        <div
          onClick={handleClose}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#111",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16,
              padding: 32,
              width: "100%",
              maxWidth: 440,
              position: "relative",
            }}
          >
            <button
              onClick={handleClose}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.4)",
                cursor: "pointer",
                fontSize: 20,
                lineHeight: 1,
                padding: 4,
              }}
            >
              &times;
            </button>

            <h2
              style={{
                fontSize: 22,
                fontWeight: 600,
                margin: "0 0 4px 0",
                color: "#fff",
              }}
            >
              Get in touch
            </h2>
            {/* <p
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.4)",
                margin: "0 0 24px 0",
              }}
            >
              I&apos;ll get back to you as soon as I can.
            </p> */}

            {submitStatus === "sent" ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "32px 0",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    backgroundColor: "rgba(34,197,94,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                    color: "#22c55e",
                    fontSize: 24,
                  }}
                >
                  &#10003;
                </div>
                <p style={{ fontSize: 16, fontWeight: 500, margin: "0 0 8px" }}>
                  Message sent
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div>
                  <label style={labelStyle}>Name</label>
                  <input
                    {...register("name")}
                    placeholder="Your name"
                    style={inputStyle}
                  />
                  <AnimatePresence>
                    {errors.name && (
                      <motion.p
                        key="name-error"
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 4 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          ...errorStyle,
                          overflow: "hidden",
                          marginTop: 0,
                        }}
                      >
                        {errors.name.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label style={labelStyle}>Email</label>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="you@example.com"
                    style={inputStyle}
                  />
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p
                        key="email-error"
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 4 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          ...errorStyle,
                          overflow: "hidden",
                          marginTop: 0,
                        }}
                      >
                        {errors.email.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label style={labelStyle}>Message</label>
                  <textarea
                    {...register("message")}
                    rows={4}
                    placeholder="How can I help?"
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                  <AnimatePresence>
                    {errors.message && (
                      <motion.p
                        key="message-error"
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 4 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          ...errorStyle,
                          overflow: "hidden",
                          marginTop: 0,
                        }}
                      >
                        {errors.message.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <AnimatePresence>
                  {submitStatus === "error" && (
                    <motion.p
                      key="submit-error"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        fontSize: 13,
                        color: "#ef4444",
                        margin: 0,
                        textAlign: "center",
                        overflow: "hidden",
                      }}
                    >
                      Something went wrong. Please try again.
                    </motion.p>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={submitStatus === "sending"}
                  style={{
                    padding: "12px 0",
                    borderRadius: 9999,
                    border: "none",
                    backgroundColor: "#fff",
                    color: "#000",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor:
                      submitStatus === "sending" ? "not-allowed" : "pointer",
                    opacity: submitStatus === "sending" ? 0.6 : 1,
                    transition: "opacity 0.15s",
                    fontFamily: "inherit",
                  }}
                >
                  {submitStatus === "sending" ? "Sending..." : "Send message"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
