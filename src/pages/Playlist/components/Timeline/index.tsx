import React from "react";
import "./Timeline.css";
import TimelineItem, { TimelineItemProps } from "./components/TimelineItem";

export type TimelineItemData = TimelineItemProps;

export interface TimelineProps {
  items: TimelineItemData[];
  className?: string;
  style?: React.CSSProperties;
  onScroll?: React.UIEventHandler<HTMLDivElement>;
}

export const Timeline: React.FC<TimelineProps> = ({ items, className, style, onScroll }) => {
  console.log(items);
  return (
    <div className={`timeline-container ${className || ""}`} style={style} onScroll={onScroll}>
      <ul className="timeline-list" role="list">
        {items.map((item, idx) => (
          <TimelineItem
            key={`${item.song}-${item.user}-${idx}`}
            song={item.song}
            artist={item.artist}
            user={item.user}
            userAvatarUrl={item.userAvatarUrl}
            comment={item.comment}
            createdAt={item.createdAt}
            albumArtUrl={item.albumArtUrl}
            songId={item.songId}
          />
        ))}
      </ul>
    </div>
  );
};

export default Timeline;

