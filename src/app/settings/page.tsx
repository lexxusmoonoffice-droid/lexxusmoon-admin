"use client";

import { useState } from "react";
import api from "@/lib/api";
import AdminLayout from "@/components/AdminLayout";

function SettingsPageContent() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }
    if (newPassword === currentPassword) {
      setError("New password must be different from the current password.");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/auth/change-password", { currentPassword, newPassword });
      setSuccess("Password changed successfully! Use your new password next time you log in.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    fontSize: 14,
    color: "#171200",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 8,
    color: "#4b5563",
  };

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24, color: "#E02222" }}>Settings</h1>

      <div style={{ maxWidth: 520, padding: 24, backgroundColor: "#ffffff", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: "#171200" }}>Change Password</h2>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>Update the password you use to sign in to the admin panel.</p>

        {error && (
          <div style={{ marginBottom: 16, padding: 14, backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 8, color: "#ef4444", fontSize: 14 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ marginBottom: 16, padding: 14, backgroundColor: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.4)", borderRadius: 8, color: "#22c55e", fontSize: 14 }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelStyle}>Current Password</label>
            <input type={show ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} style={inputStyle} autoComplete="current-password" />
          </div>
          <div>
            <label style={labelStyle}>New Password</label>
            <input type={show ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={inputStyle} autoComplete="new-password" />
          </div>
          <div>
            <label style={labelStyle}>Confirm New Password</label>
            <input type={show ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={inputStyle} autoComplete="new-password" />
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#6b7280", cursor: "pointer" }}>
            <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} />
            Show passwords
          </label>

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: "12px 20px",
              backgroundColor: "#E02222",
              color: "#ffffff",
              fontWeight: 600,
              borderRadius: 8,
              border: "none",
              cursor: submitting ? "not-allowed" : "pointer",
              fontSize: 14,
              opacity: submitting ? 0.7 : 1,
              transition: "all 0.2s ease",
              marginTop: 4,
            }}
          >
            {submitting ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AdminLayout>
      <SettingsPageContent />
    </AdminLayout>
  );
}
