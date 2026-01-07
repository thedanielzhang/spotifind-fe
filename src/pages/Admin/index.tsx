// src/pages/Admin/Admin.tsx
import React, { useEffect, useState } from "react";
import AdminLogin from "./components/AdminLogin";
import CreatePlaylist from "./components/CreatePlaylist";
import ConnectSpotify from "./components/ConnectSpotify";

interface PlaylistConfigStatus {
  exists: boolean;
  name: string | null;
  spotify_playlist_id: string | null;
}

const API_BASE = process.env.API_URL;

export function Admin() {
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [playlistConfigured, setPlaylistConfigured] = useState<boolean | null>(null);
  const [spotifyConnected, setSpotifyConnected] = useState<boolean | null>(null);

  // --- 1. Check admin authentication via /admin/me ---
  useEffect(() => {
    async function checkAdmin() {
      try {
        const res = await fetch(`${API_BASE}/admin/me`, {
          credentials: "include",
        });
        setIsAdmin(res.ok);
      } catch {
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    }

    checkAdmin();
  }, []);

  // --- 2. If admin, check playlist configuration + spotify linkage ---
  useEffect(() => {
    if (!isAdmin) return;

    async function checkConfig() {
      try {
        const res = await fetch(`${API_BASE}/playlist/config`);
        if (!res.ok) {
          throw new Error(`Status ${res.status}`);
        }
        const data: PlaylistConfigStatus = await res.json();

        setPlaylistConfigured(data.exists);

        if (data.exists) {
          // Use presence of spotify_playlist_id as proxy for "connected"
          setSpotifyConnected(!!data.spotify_playlist_id);
        } else {
          setSpotifyConnected(false);
        }
      } catch {
        setPlaylistConfigured(false);
        setSpotifyConnected(false);
      }
    }

    checkConfig();
  }, [isAdmin]);

  // ---------- Rendering logic ----------

  // Still checking admin auth
  if (checkingAdmin) {
    return (
      <AdminScreen>
        <p>Loading…</p>
      </AdminScreen>
    );
  }

  // Not logged in → show admin login
  if (!isAdmin) {
    return (
      <AdminLogin
        onLoginSuccess={() => {
          setIsAdmin(true);
        }}
      />
    );
  }

  // Admin logged in but we haven't resolved config status yet
  if (playlistConfigured === null || spotifyConnected === null) {
    return (
      <AdminScreen>
        <p>Checking playlist status…</p>
      </AdminScreen>
    );
  }

  // Admin logged in, playlist NOT configured → CreatePlaylist step
  if (!playlistConfigured) {
    return (
      <CreatePlaylist
        onConfigured={() => {
          setPlaylistConfigured(true);
          setSpotifyConnected(false); // next step is Spotify connect
        }}
      />
    );
  }

  // Admin logged in, playlist configured but Spotify NOT connected → ConnectSpotify step
  if (playlistConfigured && !spotifyConnected) {
    return (
      <ConnectSpotify
        onConnected={() => {
          setSpotifyConnected(true);
        }}
      />
    );
  }

  // Admin logged in, playlist configured AND Spotify connected → Admin dashboard
  return (
    <AdminScreen>
      <div
        style={{
          background: "#0b1120",
          borderRadius: 16,
          padding: 32,
          border: "1px solid rgba(148,163,184,0.4)",
          minWidth: 420,
          maxWidth: 720,
        }}
      >
        <h1
          style={{
            fontSize: 28,
            marginBottom: 10,
            fontWeight: 600,
          }}
        >
          Admin Panel
        </h1>
        <p
          style={{
            color: "rgba(209,213,219,0.8)",
            marginBottom: 24,
            fontSize: 15,
          }}
        >
          The playlist is configured and connected to Spotify.
          <br />
          You can extend this panel with more admin tools later (debug info,
          resync, stats, etc.).
        </p>

        <button
          onClick={async () => {
            await fetch(`${API_BASE}/admin/logout`, {
              method: "POST",
              credentials: "include",
            });
            setIsAdmin(false);
            setPlaylistConfigured(null);
            setSpotifyConnected(null);
          }}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            border: "1px solid rgba(148,163,184,0.5)",
            background: "#020617",
            color: "#e5e7eb",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Log out
        </button>
      </div>
    </AdminScreen>
  );
}

function AdminScreen({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "#e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {children}
    </div>
  );
}
