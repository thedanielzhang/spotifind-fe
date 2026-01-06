// src/pages/Admin/CreatePlaylist.tsx
import React, { useEffect, useState } from "react";

interface PlaylistConfigStatus {
  exists: boolean;
  name: string | null;
  spotify_playlist_id: string | null;
  description: string | null;
  cover_image_url: string | null;
}

interface CreatePlaylistProps {
  onConfigured?: () => void;
}

const CreatePlaylist: React.FC<CreatePlaylistProps> = ({ onConfigured }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");

  const [playlistExists, setPlaylistExists] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch playlist config status
  useEffect(() => {
    async function loadStatus() {
      try {
        const res = await fetch("http://127.0.0.1:8000/playlist/config");
        const data: PlaylistConfigStatus = await res.json();
        setPlaylistExists(data.exists);
        if (!data.exists) {
          setName(data.name || "");
          setDescription(data.description || "");
          setCoverImageUrl(data.cover_image_url || "");
        }
      } catch {
        setPlaylistExists(false);
      }
    }
    loadStatus();
  }, []);

  if (playlistExists === null) {
    return <CenteredScreen>Checking playlist status…</CenteredScreen>;
  }

  if (playlistExists === true) {
    return (
      <CenteredScreen>
        <div style={boxStyle}>
          <h2>Playlist already configured</h2>
          <p style={{ opacity: 0.8 }}>
            You may return to the admin panel.
          </p>
        </div>
      </CenteredScreen>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("http://127.0.0.1:8000/playlist/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          description,
          cover_image_url: coverImageUrl,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.detail || `Failed (status ${res.status})`);
        return;
      }

      onConfigured?.();
    } catch {
      setError("Unexpected error saving configuration.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CenteredScreen>
      <div style={wrapperStyle}>
        <div style={leftColStyle}>
          <img
            src={coverImageUrl}
            alt="cover preview"
            style={{
              width: 220,
              height: 220,
              borderRadius: 16,
              objectFit: "cover",
              border: "1px solid rgba(148,163,184,0.5)",
            }}
          />
          <div style={{ fontSize: 13, marginTop: 8, opacity: 0.7 }}>
            Cover preview
          </div>
        </div>

        <div style={rightColStyle}>
          <h1 style={{ fontSize: 24, marginBottom: 12 }}>Create Playlist</h1>
          <p style={{ opacity: 0.75, marginBottom: 16 }}>
            This defines the single playlist for your app.
          </p>

          {error && <div style={errorBoxStyle}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <Field label="Playlist name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
                disabled={true}
                required
              />
            </Field>

            <Field label="Description">
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ ...inputStyle, resize: "vertical" }}
                disabled={true}
              />
            </Field>

            <Field label="Cover image URL">
              <input
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                style={inputStyle}
                placeholder="https://…"
              />
            </Field>

            <button
              type="submit"
              disabled={submitting}
              style={buttonStyle(submitting)}
            >
              {submitting ? "Saving…" : "Save configuration"}
            </button>
          </form>
        </div>
      </div>
    </CenteredScreen>
  );
};

export default CreatePlaylist;

//
// ---- Helpers + Styles ----
//

function CenteredScreen({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "#e5e7eb",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", marginBottom: 6, opacity: 0.85 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const wrapperStyle: React.CSSProperties = {
  background: "#0b1120",
  borderRadius: 16,
  padding: 32,
  display: "flex",
  gap: 32,
  border: "1px solid rgba(148,163,184,0.3)",
  width: "800px",
  boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
};

const leftColStyle: React.CSSProperties = {
  flex: "0 0 240px",
  textAlign: "center",
};

const rightColStyle: React.CSSProperties = {
  flex: 1,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid rgba(148,163,184,0.4)",
  background: "#020617",
  color: "#e5e7eb",
  fontSize: 14,
};

const buttonStyle = (disabled: boolean): React.CSSProperties => ({
  padding: "10px 18px",
  borderRadius: 999,
  border: "none",
  background:
    "linear-gradient(135deg, #22c55e 0%, #4ade80 50%, #a3e635 100%)",
  color: "#020617",
  fontWeight: 600,
  cursor: disabled ? "default" : "pointer",
  opacity: disabled ? 0.6 : 1,
  fontSize: 14,
  marginTop: 8,
});

const errorBoxStyle: React.CSSProperties = {
  marginBottom: 16,
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid rgba(248,113,113,0.5)",
  background: "rgba(248,113,113,0.15)",
  color: "#fecaca",
};

const boxStyle: React.CSSProperties = {
  padding: "24px 32px",
  background: "#0b1120",
  border: "1px solid rgba(148,163,184,0.4)",
  borderRadius: 12,
  textAlign: "center",
};
