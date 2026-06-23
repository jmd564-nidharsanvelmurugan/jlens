import React from "react";
import { CheckCircle, Sparkles } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface StepGenerateProposalProps {
  /** Optional additional instructions supplied by the user */
  docxUserPrompt: string;

  /** Setter to update the additional prompt value */
  setDocxUserPrompt: (value: string) => void;

  /** Whether the AI is currently generating a response */
  isCurrentlyGenerating: boolean;

  /** Initiates proposal generation using the DOCX content + optional prompt */
  onGenerate: () => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * StepGenerateProposal renders step 3 of the proposal flow.
 * Shown after the sales call DOCX has been uploaded but before generation starts.
 * Provides a confirmation badge, an optional prompt textarea, and a generate button.
 */
const StepGenerateProposal = ({
  docxUserPrompt,
  setDocxUserPrompt,
  isCurrentlyGenerating,
  onGenerate,
}: StepGenerateProposalProps) => (
  <div className="mt-4 space-y-3">

    {/* Upload confirmation badge */}
    <div className="text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded text-xs border border-green-200">
        <CheckCircle className="w-3 h-3" />
        <span>Sales call answers uploaded! Ready to generate.</span>
      </div>
    </div>

    {/* Optional additional prompt */}
    <div className="border border-gray-200 rounded p-3 space-y-2">
      <label className="text-xs font-medium text-gray-700">
        Additional prompt{" "}
        <span className="text-gray-400 font-normal">(optional)</span>
      </label>

      <textarea
        value={docxUserPrompt}
        onChange={(e) => setDocxUserPrompt(e.target.value)}
        placeholder="Enter any additional instructions for your proposal..."
        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#19105B] resize-none min-h-[80px] text-sm"
      />

      <div className="flex justify-end">
        <button
          onClick={onGenerate}
          disabled={isCurrentlyGenerating}
          className="px-4 py-2 bg-[#19105B] text-white text-xs rounded hover:bg-[#19105B]/90 flex items-center gap-2 disabled:opacity-50"
        >
          <Sparkles className="w-3 h-3" />
          <span>Generate Proposal</span>
        </button>
      </div>
    </div>
  </div>
);

export default StepGenerateProposal;