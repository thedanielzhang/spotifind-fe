// src/pages/Admin/AdminLogin.tsx
import React, { useState } from "react";

interface AdminLoginProps {
  onLoginSuccess?: () => void;
}

const API_BASE = process.env.API_URL;

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.detail || "Login failed.");
        return;
      }

      onLoginSuccess?.();
    } catch {
      setError("Unexpected error logging in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={screenStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Admin Login</h1>
        <p style={subtitleStyle}>Configure playlist & connect Spotify</p>

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Username</label>
          <input
            style={inputStyle}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label style={labelStyle}>Password</label>
          <input
            type="password"
            style={inputStyle}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            style={buttonStyle(submitting)}
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;

//
// ---- Styles ----
//

const screenStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#0b0c10",
  fontFamily: "system-ui, sans-serif",
  color: "#f9fafb",
};

const cardStyle: React.CSSProperties = {
  width: 380,
  padding: "32px 32px 28px",
  borderRadius: 12,
  background: "#10121a",
  boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const titleStyle: React.CSSProperties = {
  fontSize: 22,
  marginBottom: 4,
  fontWeight: 600,
};

const subtitleStyle: React.CSSProperties = {
  fontSize: 14,
  marginBottom: 20,
  color: "rgba(229,231,235,0.7)",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  marginBottom: 4,
  color: "rgba(229,231,235,0.85)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  marginBottom: 12,
  borderRadius: 8,
  border: "1px solid rgba(156,163,175,0.4)",
  background: "#020617",
  color: "#f9fafb",
  fontSize: 14,
};

const buttonStyle = (disabled: boolean): React.CSSProperties => ({
  width: "100%",
  padding: "10px 12px",
  borderRadius: 999,
  border: "none",
  fontSize: 14,
  fontWeight: 500,
  cursor: disabled ? "default" : "pointer",
  opacity: disabled ? 0.6 : 1,
  background:
    "linear-gradient(135deg, #22c55e 0%, #4ade80 50%, #a3e635 100%)",
  color: "#020617",
});

const errorStyle: React.CSSProperties = {
  marginBottom: 16,
  padding: "8px 10px",
  borderRadius: 8,
  fontSize: 13,
  background: "rgba(248,113,113,0.12)",
  color: "#fecaca",
  border: "1px solid rgba(248,113,113,0.4)",
};
