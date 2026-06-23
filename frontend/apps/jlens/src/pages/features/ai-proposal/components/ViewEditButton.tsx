import React from "react";
import { Edit3, ChevronRight } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ViewEditButtonProps {
  /** Disables the button while the AI is generating a response */
  isCurrentlyGenerating: boolean;

  /** Whether the right-hand editor panel is currently visible */
  isEditorPanelOpen: boolean;

  /** Whether the left sidebar is currently collapsed */
  isSidebarCollapsed: boolean;

  /** Setter to toggle the editor panel open/closed */
  setIsEditorPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;

  /** Setter to collapse/expand the sidebar */
  setIsSidebarCollapsed: (value: boolean) => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * ViewEditButton opens the right-hand editor panel for the generated proposal.
 * When opening the panel it also collapses the sidebar to maximise editor space.
 */
const ViewEditButton = ({
  isCurrentlyGenerating,
  isEditorPanelOpen,
  isSidebarCollapsed,
  setIsEditorPanelOpen,
  setIsSidebarCollapsed,
}: ViewEditButtonProps) => {

  /**
   * Toggles the editor panel.
   * Auto-collapses the sidebar when the panel is being opened
   * to give the editor more horizontal room.
   */
  const handleClick = () => {
    setIsEditorPanelOpen((prev) => {
      if (!prev && !isSidebarCollapsed) setIsSidebarCollapsed(true);
      return !prev;
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isCurrentlyGenerating}
      className="flex items-center justify-center w-[70%] px-6 py-2 rounded-lg transition-colors duration-200 shadow-sm border text-xs font-semibold bg-[#F3F4F6] text-[#19105B] border-[#F3F4F6] hover:bg-[#e5e7eb] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#F3F4F6]"
    >
      <Edit3 className="w-4 h-4 mr-2" />
      View and Edit proposal
      <ChevronRight className="w-4 h-4 ml-2 transition-transform duration-200" />
    </button>
  );
};

export default ViewEditButton;