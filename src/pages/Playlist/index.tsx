import React, { useEffect, useState, useCallback } from "react";
import ActionSheet from "./components/ActionSheet";
import { Timeline, TimelineItemData } from "./components/Timeline";
import "./Playlist.css";
import FloatingActionButton from "../../components/FloatingActionButton";
import AddSong, { SongResult } from "./components/AddSong/AddSong";

type ConfigStatus = "loading" | "notConfigured" | "configuredNoSpotify" | "ready" | "error";

interface PlaylistConfigResponse {
  exists: boolean;
  name: string | null;
  spotify_playlist_id: string | null;
  description?: string | null;
  cover_image_url?: string | null;
}

type AuthStatus = "loading" | "loggedOut" | "loggedIn";

const API_BASE = "http://127.0.0.1:8000";

export function Playlist() {
  const [isActionSheetVisible, setActionSheetVisible] = useState<boolean>(false);
  const [items, setItems] = useState<TimelineItemData[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [configStatus, setConfigStatus] = useState<ConfigStatus>("loading");
  const [playlistConfig, setPlaylistConfig] = useState<PlaylistConfigResponse | null>(null);

  // ---- Top bar auth state (simple POC) ----
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  const openActionSheet = () => setActionSheetVisible(true);
  const closeActionSheet = () => setActionSheetVisible(false);

  // Check admin session cookie (for top bar)
  const checkSession = useCallback(async () => {
    try {
      const resp = await fetch(`${API_BASE}/admin/me`, {
        method: "GET",
        credentials: "include",
      });

      if (resp.ok) {
        setAuthStatus("loggedIn");
      } else {
        setAuthStatus("loggedOut");
      }
    } catch {
      setAuthStatus("loggedOut");
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const handleLogin = async () => {
    setLoginError(null);

    const username = loginUsername.trim();
    const password = loginPassword;

    if (!username || !password) {
      setLoginError("Enter username and password.");
      return;
    }

    try {
      const resp = await fetch(`${API_BASE}/admin/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!resp.ok) {
        const body = await resp.json().catch(() => null);
        setLoginError(body?.detail ?? "Login failed.");
        return;
      }

      setIsLoginOpen(false);
      setLoginUsername("");
      setLoginPassword("");
      await checkSession();
    } catch (e) {
      setLoginError("Login failed. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/admin/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setAuthStatus("loggedOut");
    }
  };

  // Fetch playlist config to see if app is ready and to populate sidebar card
  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch(`${API_BASE}/playlist/config`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data: PlaylistConfigResponse = await response.json();
        setPlaylistConfig(data);

        if (!data.exists) {
          setConfigStatus("notConfigured");
        } else if (data.exists && !data.spotify_playlist_id) {
          setConfigStatus("configuredNoSpotify");
        } else {
          setConfigStatus("ready");
        }
      } catch (err) {
        console.error("Failed to load playlist config:", err);
        setConfigStatus("error");
        setPlaylistConfig(null);
      }
    }

    fetchConfig();
  }, []);

  // Reusable fetch function so we can call it on mount and after adding a song
  const fetchSongs = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/songs`);
      if (!response.ok) {
        throw new Error(`HTTP error! ${response.status}`);
      }

      const data = await response.json();
      setItems(
        data.map((item: any) => ({
          song: item.song,
          artist: item.artist,
          albumArtUrl: item.album_art_url,
          user: item.user,
          userAvatarUrl: item.user_avatar_url,
          comment: item.comment,
          createdAt: item.created_at,
          songId: item.spotify_track_id
        }))
      );
    } catch (err) {
      console.error("Failed to fetch songs:", err);
    }
  }, []);

  // Load songs only when playlist is fully ready
  useEffect(() => {
    if (configStatus === "ready") {
      fetchSongs();
    }
  }, [configStatus, fetchSongs]);

  // Escape key to close action sheet / login modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActionSheetVisible(false);
        setIsLoginOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleAddSong = async (song: SongResult, comment: string) => {
    if (configStatus !== "ready") {
      console.warn("Playlist not fully configured; cannot add song.");
      return;
    }

    const payload = {
      spotify_track_id: song.id,
      spotify_track_uri: `spotify:track:${song.id}`,
      song: song.title,
      artist: song.artist,
      album_art_url: song.albumArtUrl ?? "",
      user: "test",
      user_avatar_url: "https://i.pravatar.cc/40?img=13",
      comment,
    };

    try {
      const response = await fetch(`${API_BASE}/songs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        console.error("Failed to add song:", response.status, errorBody);
        return;
      }

      await fetchSongs(); // refresh timeline
      setActionSheetVisible(false);
    } catch (err) {
      console.error("Error while adding song:", err);
    }
  };

  const handleTimelineScroll: React.UIEventHandler<HTMLElement> = (e) => {
    const top = e.currentTarget.scrollTop;
    if (!isCollapsed && top > 0) setIsCollapsed(true);
    if (isCollapsed && top === 0) setIsCollapsed(false);
  };

  const renderNotConfigured = () => {
    let title = "Playlist not configured";
    let message = "An admin must finish the setup before songs can be added.";

    if (configStatus === "configuredNoSpotify") {
      title = "Spotify not connected";
      message =
        "The playlist exists, but Spotify hasn’t been connected yet. Please complete the admin setup.";
    } else if (configStatus === "error") {
      title = "Unable to load playlist configuration";
      message = "Please try again later or contact the admin.";
    }

    return (
      <div className="empty-state">
        <div className="empty-art">⚙️</div>
        <h3>{title}</h3>
        <p>{message}</p>
      </div>
    );
  };

  const isReady = configStatus === "ready";

  // Derive some display fields from config + songs
  const playlistTitle =
    playlistConfig?.name && playlistConfig.exists ? playlistConfig.name : "Roadtrip Vibes";
  const playlistDescription =
    playlistConfig?.description && playlistConfig.exists
      ? playlistConfig.description
      : "Songs for winding roads, coastal views, and city night drives.";
  const coverImageUrl =
    playlistConfig?.cover_image_url && playlistConfig.exists
      ? playlistConfig.cover_image_url
      : "https://picsum.photos/seed/cover/240/240";

  const displayUserName = "test";
  const displayUserAvatar = "https://i.pravatar.cc/40?img=13";
  const playlistUrl = playlistConfig?.spotify_playlist_id && playlistConfig.exists ? `https://open.spotify.com/playlist/${playlistConfig?.spotify_playlist_id}`: '';

  console.log(items);

  return (
    <div className="playlist-page">
      {/* Top bar */}
      <div className="playlist-topbar">
        <div className="playlist-topbar-detail">
          {authStatus === "loading" ? (
            <div className="topbar-muted">Checking session…</div>
          ) : authStatus === "loggedIn" ? (
            <div className="topbar-user">
              <img className="topbar-avatar" src={displayUserAvatar} alt="" width={28} height={28} />
              <div className="topbar-username">{displayUserName}</div>
              <button className="topbar-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <button className="topbar-btn primary" onClick={() => setIsLoginOpen(true)}>
              Login to add songs
            </button>
          )}
        </div>
      </div>

      {/* Login modal */}
      {isLoginOpen && (
        <div className="modal-overlay" onMouseDown={() => setIsLoginOpen(false)}>
          <div
            className="modal"
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="modal-header">
              <div className="modal-title">Admin Login</div>
              <button className="modal-close" onClick={() => setIsLoginOpen(false)} aria-label="Close">
                ✕
              </button>
            </div>

            <div className="modal-body">
              <label className="modal-label">
                Username
                <input
                  className="modal-input"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  autoComplete="username"
                />
              </label>

              <label className="modal-label">
                Password
                <input
                  className="modal-input"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </label>

              {loginError && <div className="modal-error">{loginError}</div>}
            </div>

            <div className="modal-footer">
              <button className="btn ghost" onClick={() => setIsLoginOpen(false)}>
                Cancel
              </button>
              <button className="btn primary" onClick={handleLogin}>
                Login
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`playlist-layout ${isCollapsed ? "playlist-layout--collapsed" : ""}`}>
        {isReady && (
          <aside className="playlist-sidebar">
            <div className="playlist-card">
              <img className="playlist-cover" src={coverImageUrl} alt="" width={240} height={240} />
              <div className="playlist-card-body">
                <h2 className="playlist-card-title">{playlistTitle}</h2>
                <p className="playlist-card-desc">{playlistDescription}</p>
                <div className="playlist-stats">
                  <div className="pill">Songs · {items.length}</div>                  
                  <a href={playlistUrl}><div className="pill">Spotify Link 🔗</div></a>
                </div>
              </div>
            </div>
          </aside>
        )}

        <main className="playlist-timeline">
          {configStatus === "loading" ? (
            <div className="empty-state">
              <div className="empty-art">⏳</div>
              <h3>Loading playlist…</h3>
              <p>Please wait a moment.</p>
            </div>
          ) : !isReady ? (
            renderNotConfigured()
          ) : items.length === 0 ? (
            <></>
          ) : (
            <Timeline items={items} onScroll={handleTimelineScroll} />
          )}
        </main>
      </div>

      {isReady && (
        <>
          <FloatingActionButton onClick={openActionSheet} ariaLabel="Add song to playlist" disabled={authStatus !== "loggedIn"}/>

          <ActionSheet isVisible={isActionSheetVisible} onClose={closeActionSheet}>
            <AddSong onCancel={closeActionSheet} onAdd={handleAddSong} />
          </ActionSheet>
        </>
      )}
    </div>
  );
}
