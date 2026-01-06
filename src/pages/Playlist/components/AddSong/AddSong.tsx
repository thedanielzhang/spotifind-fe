import React, { useEffect, useState } from "react";
import "./AddSong.css";

export interface SongResult {
  id: string;            // Spotify track ID
  title: string;         // Song title
  artist: string;        // Artist name
  duration: string;      // Duration string (computed from duration_ms)
  albumArtUrl?: string;  // Optional artwork URL
}

export interface AddSongProps {
  onCancel: () => void;
  onAdd: (song: SongResult, comment: string) => void;
}

const AddSong: React.FC<AddSongProps> = ({ onCancel, onAdd }) => {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<SongResult | null>(null);
  const [comment, setComment] = useState("");

  const [results, setResults] = useState<SongResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Spotify Search API (via backend)
  useEffect(() => {
    const trimmed = query.trim();

    // No query → show nothing
    if (trimmed.length < 2) {
      setResults([]);
      setIsLoading(false);
      setFetchError(null);
      return;
    }

    setIsLoading(true);
    setFetchError(null);

    const controller = new AbortController();

    const timeoutId = window.setTimeout(async () => {
      try {
        const resp = await fetch(
          `http://127.0.0.1:8000/spotify/search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        );

        if (!resp.ok) {
          const body = await resp.json().catch(() => null);
          console.error("Spotify search failed:", resp.status, body);
          setFetchError("Search failed. Please try again.");
          setResults([]);
          return;
        }

        const data = await resp.json();

        const tracks = Array.isArray(data)
          ? data
          : Array.isArray(data.tracks?.items)
          ? data.tracks.items
          : [];

        const mapped: SongResult[] = tracks.map((t: any) => {
          const durationMs: number = t.duration_ms ?? 0;
          const minutes = Math.floor(durationMs / 60000);
          const seconds = Math.floor((durationMs % 60000) / 1000)
            .toString();

          return {
            id: t.id,
            title: t.name,
            artist: (t.artists || []).map((a: any) => a.name).join(", "),
            duration: durationMs ? `${minutes}:${seconds}` : "",
            albumArtUrl: t.album?.images?.[0]?.url,
          };
        });

        setResults(mapped);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("Spotify search error:", err);
        setFetchError("Search failed. Please try again.");
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query]);

  const handleAdd = () => {
    if (selected) onAdd(selected, comment);
  };

  return (
    <div className="add-song">
      <div className="add-song-header">
        <h3 className="add-song-title">Add a song</h3>
        <button className="add-song-close" onClick={onCancel} aria-label="Close">✕</button>
      </div>

      <div className="add-song-search">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null); // reset selection when typing
          }}
          placeholder="Search for a song or artist…"
          className="add-song-input"
        />
      </div>

      <div className="add-song-results">
        {isLoading && <div className="add-song-status">Searching…</div>}

        {fetchError && !isLoading && (
          <div className="add-song-status error">{fetchError}</div>
        )}

        {!isLoading && !fetchError && query.length >= 2 && results.length === 0 && (
          <div className="add-song-status">No results found.</div>
        )}

        {results.map((s) => (
          <button
            key={s.id}
            className={`add-song-row ${selected?.id === s.id ? "selected" : ""}`}
            onClick={() => setSelected(s)}
          >
            {s.albumArtUrl ? (
              <img
                src={s.albumArtUrl}
                alt=""
                className="add-song-art"
                width={64}
                height={64}
              />
            ) : (
              <div className="add-song-art add-song-art--placeholder" />
            )}

            <div className="add-song-row-text">
              <div className="add-song-row-title">{s.title}</div>
              <div className="add-song-row-sub">
                {s.artist}
                {s.duration ? ` • ${s.duration}` : ""}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="add-song-selected">
        {selected ? (
          <div className="selected-card">
            {selected.albumArtUrl ? (
              <img
                src={selected.albumArtUrl}
                alt=""
                className="add-song-art"
                width={72}
                height={72}
              />
            ) : (
              <div className="add-song-art add-song-art--placeholder" />
            )}
            <div className="add-song-row-text">
              <div className="add-song-row-title">{selected.title}</div>
              <div className="add-song-row-sub">
                {selected.artist}
                {selected.duration ? ` • ${selected.duration}` : ""}
              </div>
            </div>
          </div>
        ) : (
          <div className="selected-placeholder">Pick a song to enable the button</div>
        )}
      </div>

      <div className="add-song-comment">
        <textarea
          className="add-song-textarea"
          rows={3}
          placeholder="Add a comment (optional)…"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <div className="add-song-footer">
        <button className="btn ghost" onClick={onCancel}>Cancel</button>
        <button className="btn primary" onClick={handleAdd} disabled={!selected}>
          Add to playlist
        </button>
      </div>
    </div>
  );
};

export default AddSong;
