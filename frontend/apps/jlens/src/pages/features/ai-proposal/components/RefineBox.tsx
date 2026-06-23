import React from "react";
import { MessageSquare, Upload, Send } from "lucide-react";
import { Textarea } from "@ui/components/ui/textarea";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface RefineBoxProps {
  /** Current value of the follow-up prompt input */
  currentUserPrompt: string;

  /** Setter to update the follow-up prompt input value */
  setCurrentUserPrompt: (value: string) => void;

  /** Callback fired when the user submits a follow-up message */
  handleFollowUpSend: () => void;

  /** Callback fired when the user selects files to attach */
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;

  /** Disables inputs while the AI is generating a response */
  isCurrentlyGenerating: boolean;

  /** Active conversation ID — upload button is hidden when absent */
  convId: string;
}

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * RefineBox renders the follow-up prompt area shown after a proposal is generated.
 * Allows the user to type additional instructions and optionally attach files
 * to further refine the AI-generated proposal.
 */
const RefineBox = ({
  currentUserPrompt,
  setCurrentUserPrompt,
  handleFollowUpSend,
  handleFileUpload,
  isCurrentlyGenerating,
  convId,
}: RefineBoxProps) => (
  <div className="mt-4">
    <div className="border border-gray-200 rounded p-3">

      {/* Section heading */}
      <div className="text-xs font-medium text-gray-800 mb-2 flex items-center gap-2">
        <MessageSquare className="w-3 h-3 text-[#19105B]" />
        Refine Your Proposal
      </div>

      {/* Prompt textarea with action bar overlay */}
      <div className="relative">
        <Textarea
          value={currentUserPrompt}
          onChange={(e) => setCurrentUserPrompt(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleFollowUpSend();
            }
          }}
          placeholder="Ask follow-up questions to refine your proposal..."
          className="w-full min-h-[120px] max-h-[120px] resize-none px-2 pt-2 pb-8 border border-gray-300 rounded bg-gray-50 text-xs focus:outline-none focus:border-[#19105B]"
          disabled={isCurrentlyGenerating}
        />

        {/* Action bar: upload + send */}
        <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between">

          {/* File upload — only shown when a conversation exists */}
          {convId && (
            <label
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-blue-600 cursor-pointer border border-gray-300 rounded hover:border-gray-400 bg-white shadow-sm transition-colors"
              style={{ height: "30px" }}
            >
              <Upload className="w-3 h-3" />
              <span>Upload</span>
              <input type="file" multiple className="hidden" onChange={handleFileUpload} />
            </label>
          )}

          {/* Send button */}
          <button
            type="button"
            onClick={handleFollowUpSend}
            disabled={isCurrentlyGenerating || !currentUserPrompt.trim()}
            className="flex items-center gap-1 px-2 py-1 bg-[#19105B] text-white rounded text-xs hover:bg-[#19105B]/90 disabled:opacity-50"
          >
            <Send className="w-3 h-3" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default RefineBox;