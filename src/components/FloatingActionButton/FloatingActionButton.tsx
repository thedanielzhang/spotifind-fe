import React from "react";
import "./FloatingActionButton.css";

export interface FloatingActionButtonProps {
  onClick?: () => void;
  ariaLabel?: string;
  children?: React.ReactNode;
  disabled: boolean;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  ariaLabel = "Add song to playlist",
  children,
  disabled
}) => {
  return (
    <button
      type="button"
      className="fab"
      onClick={onClick}
      aria-label={ariaLabel}
      tabIndex={0}
      disabled={disabled}
    >
      {children ?? <span className="fab-icon">+</span>}
    </button>
  );
};

export default FloatingActionButton;

