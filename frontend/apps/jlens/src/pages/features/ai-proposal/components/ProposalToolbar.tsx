import React from "react";
import { ChevronLeft, ChevronRight, X, Download } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ProposalToolbarProps {
  /** Total number of proposal versions (assistant messages) */
  totalProposals:       number;

  /** Index of the currently visible proposal (0-based) */
  currentProposalIndex: number;

  /** Navigate to the previous proposal version */
  onPrevious: () => void;

  /** Navigate to the next proposal version */
  onNext:     () => void;

  /** Trigger proposal file download */
  onDownload: () => void;

  /** Close the editor panel */
  onClose:    () => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * ProposalToolbar renders a sticky horizontal bar at the top of the editor panel.
 * Provides download and close actions on the left, and proposal version pagination
 * on the right (only visible when more than one proposal version exists).
 */
const ProposalToolbar = ({
  totalProposals,
  currentProposalIndex,
  onPrevious,
  onNext,
  onDownload,
  onClose,
}: ProposalToolbarProps) => (
  <div className="sticky top-0 z-10 bg-white border-b flex items-center justify-between px-4 py-2 gap-4 shadow-sm">

    {/* Left: action buttons */}
    <div className="flex items-center gap-2">
      <button
        onClick={onDownload}
        title="Download proposal"
        className="p-2 rounded hover:bg-gray-100 text-gray-500 hover:text-[#19105B]"
      >
        <Download className="w-5 h-5" />
      </button>

      <button
        onClick={onClose}
        title="Close editor"
        className="p-2 rounded hover:bg-gray-100 text-gray-500 hover:text-[#19105B]"
      >
        <X className="w-5 h-5" />
      </button>
    </div>

    {/* Right: pagination (only when multiple versions exist) */}
    {totalProposals > 1 && (
      <div className="flex items-center gap-2">
        <button
          onClick={onPrevious}
          disabled={currentProposalIndex === 0}
          className="p-1 rounded text-gray-500 hover:text-[#19105B] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-xs text-gray-600">
          Proposal {currentProposalIndex + 1} of {totalProposals}
        </span>

        <button
          onClick={onNext}
          disabled={currentProposalIndex === totalProposals - 1}
          className="p-1 rounded text-gray-500 hover:text-[#19105B] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    )}
  </div>
);

export default ProposalToolbar;