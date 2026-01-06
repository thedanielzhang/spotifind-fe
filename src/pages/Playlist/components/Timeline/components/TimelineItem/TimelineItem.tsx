import React, { useMemo, useState } from "react";
import "./TimelineItem.css";

export interface TimelineItemProps {
  song: string;
  artist?: string;
  albumArtUrl?: string;
  user: string;
  userAvatarUrl?: string;
  comment?: string;
  createdAt: string | Date;
  songId: string;
}

const toTimeAgo = (value: string | Date) => {
  const d = typeof value === "string" ? new Date(value) : value;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const TimelineItem: React.FC<TimelineItemProps> = ({
  song,
  artist,
  albumArtUrl,
  user,
  userAvatarUrl,
  comment,
  createdAt,
  songId
}) => {
  const [showMore, setShowMore] = useState(false);
  const timeAgo = useMemo(() => toTimeAgo(createdAt), [createdAt]);
  const exact = useMemo(
    () =>
      (typeof createdAt === "string" ? new Date(createdAt) : createdAt).toLocaleString(),
    [createdAt]
  );

  const trackUrl = `https://open.spotify.com/track/${songId}`;

  return (
    <li className="timeline-item">
      <div className="timeline-item-bullet" aria-hidden />
      <div className="timeline-card">
        <div className="timeline-card-media">
          {albumArtUrl ? (
            <img
              src={albumArtUrl}
              alt=""
              className="timeline-album-art"
              loading="lazy"
              width={128}
              height={128}
            />
          ) : (
            <div className="timeline-album-placeholder" aria-hidden>🎵</div>
          )}
        </div>
        <div className="timeline-card-content">
          <div className="timeline-item-header">
            <div className="timeline-item-title-block">
              <a href={trackUrl}><div className="timeline-item-title">{song}</div></a>
              {artist ? <div className="timeline-item-artist">{artist}</div> : null}
            </div>
            <div className="timeline-item-meta" title={exact}>
              <span className="timeline-item-time">{timeAgo}</span>
            </div>
          </div>
          <div className="timeline-item-submeta">
            {userAvatarUrl ? (
              <img
                src={userAvatarUrl}
                alt=""
                className="timeline-user-avatar"
                width={18}
                height={18}
                loading="lazy"
              />
            ) : (
              <div className="timeline-user-avatar fallback" aria-hidden>
                {user.slice(0, 1).toUpperCase()}
              </div>
            )}
            <span className="timeline-item-user">Added by {user}</span>
          </div>

          {comment ? (
            <div
              className={`timeline-item-comment ${showMore ? "expanded" : "clamped"}`}
            >
              {comment}
              {!showMore ? (
                <button
                  type="button"
                  className="timeline-comment-more"
                  onClick={() => setShowMore(true)}
                >
                  More
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </li>
  );
};

export default TimelineItem;

