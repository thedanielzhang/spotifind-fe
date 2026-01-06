import React from "react";
import "./ActionSheet.css";

interface ActionSheetProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const ActionSheet: React.FC<ActionSheetProps> = ({ isVisible, onClose, children }) => {
  return (
    <div
      className={`action-sheet-overlay ${isVisible ? "visible" : ""}`}
      onClick={onClose}
    >
      <div
        className="action-sheet"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {children}
      </div>
    </div>
  );
};

export default ActionSheet;
