import React from "react";
import { Sparkles } from "lucide-react";
import { Loading } from "@/components/common/loading";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface StepCreateConversationProps {
  /** Current value of the proposal title input */
  conversationTitle: string;

  /** Setter to update the proposal title */
  setConversationTitle: (value: string) => void;

  /** Whether the conversation creation API call is in-flight */
  isCreatingConversation: boolean;

  /** Initiates conversation creation with the current title */
  onStart: (title: string) => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * StepCreateConversation renders the first step of the proposal flow.
 * Shown only before a conversation ID exists. Lets the user name their proposal
 * and kick off the creation request via the Start button or Enter key.
 */
const StepCreateConversation = ({
  conversationTitle,
  setConversationTitle,
  isCreatingConversation,
  onStart,
}: StepCreateConversationProps) => (
  <div className="border border-gray-200 rounded p-3 space-y-2 mb-4">

    <label className="text-xs font-medium text-gray-700">
      What is this proposal for?
    </label>

    <textarea
      value={conversationTitle}
      onChange={(e) => setConversationTitle(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          onStart(conversationTitle);
        }
      }}
      placeholder="e.g. Digital transformation proposal for Acme Corp"
      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#19105B] resize-none min-h-[70px] text-sm"
    />

    <div className="flex justify-end">
      <button
        onClick={() => onStart(conversationTitle)}
        disabled={isCreatingConversation || !conversationTitle.trim()}
        className="px-4 py-2 bg-[#19105B] text-white text-xs rounded hover:bg-[#19105B]/90 flex items-center gap-2 disabled:opacity-50"
      >
        {isCreatingConversation ? (
          <Loading size="sm" text="Creating..." />
        ) : (
          <>
            <Sparkles className="w-3 h-3" />
            <span>Start</span>
          </>
        )}
      </button>
    </div>
  </div>
);

export default StepCreateConversation;