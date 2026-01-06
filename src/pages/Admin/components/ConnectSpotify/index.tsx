// src/pages/Admin/ConnectSpotify.tsx
import React, { useState } from "react";

interface ConnectSpotifyProps {
  onConnected?: () => void;
}

const ConnectSpotify: React.FC<ConnectSpotifyProps> = ({ onConnected }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function beginSpotifyFlow() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://127.0.0.1:8000/admin/spotify/authorize", {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      if (!data.authorize_url) throw new Error("Missing auth URL");

      // Redirect admin to Spotify authorization
      window.location.href = data.authorize_url;
    } catch (err) {
      console.error(err);
      setError("Failed to begin Spotify authorization.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <CenteredScreen>
      <div style={cardStyle}>
        <h1 style={{ fontSize: 24, marginBottom: 12, fontWeight: 600 }}>
          Connect Spotify
        </h1>

        <p style={{ opacity: 0.7, marginBottom: 20 }}>
          To allow this app to add songs to a playlist, we need permission from
          Spotify. This process will:
        </p>

        <ul style={{ opacity: 0.75, marginBottom: 20, lineHeight: 1.5 }}>
          <li>Authenticate your Spotify account</li>
          <li>Create or link the playlist in Spotify</li>
          <li>Save a secure refresh token in the backend</li>
        </ul>

        {error && <div style={errorBoxStyle}>{error}</div>}

        <button
          onClick={beginSpotifyFlow}
          disabled={loading}
          style={buttonStyle(loading)}
        >
          {loading ? "Connecting…" : "Connect with Spotify"}
        </button>
      </div>
    </CenteredScreen>
  );
};

export default ConnectSpotify;

//
// ----- styles & helpers -----
//

function CenteredScreen({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "#e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {children}
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#0b1120",
  padding: "32px 40px",
  borderRadius: 14,
  border: "1px solid rgba(148,163,184,0.3)",
  boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
  width: 460,
};

const buttonStyle = (disabled: boolean): React.CSSProperties => ({
  width: "100%",
  padding: "12px 16px",
  borderRadius: 999,
  border: "none",
  cursor: disabled ? "default" : "pointer",
  fontSize: 15,
  fontWeight: 600,
  background:
    "linear-gradient(135deg, #22d3ee 0%, #3b82f6 50%, #a78bfa 100%)",
  color: "#020617",
  opacity: disabled ? 0.6 : 1,
});

const errorBoxStyle: React.CSSProperties = {
  marginBottom: 16,
  padding: "10px 12px",
  borderRadius: 8,
  background: "rgba(248,113,113,0.15)",
  border: "1px solid rgba(248,113,113,0.5)",
  color: "#fecaca",
};
