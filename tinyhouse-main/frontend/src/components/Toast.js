import React, { useEffect } from "react";

export default function Toast({ message, type = "info", onClose, duration = 3000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose && onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  let bgColor = "#2563eb"; // info
  if (type === "success") bgColor = "#22c55e";
  if (type === "error") bgColor = "#ef4444";

  return (
    <div
      style={{
        position: "fixed",
        top: 24,
        right: 24,
        zIndex: 9999,
        background: bgColor,
        color: "#fff",
        padding: "1rem 2rem",
        borderRadius: 12,
        boxShadow: "0 4px 24px 0 rgba(0,0,0,0.13)",
        fontWeight: 600,
        minWidth: 220,
        display: "flex",
        alignItems: "center",
        gap: 12,
        fontSize: 16,
      }}
      role="alert"
    >
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{ background: "transparent", border: "none", color: "#fff", fontWeight: 700, fontSize: 18, cursor: "pointer" }}
        aria-label="Kapat"
      >
        ×
      </button>
    </div>
  );
} 