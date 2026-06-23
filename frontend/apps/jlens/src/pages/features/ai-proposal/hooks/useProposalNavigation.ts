import { useState, useEffect } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Message {
  id:         string;
  role:       "user" | "assistant" | "tool";
  content:    string;
  created_at: string;
}

interface ProposalMessages {
  userMsg:   string | undefined;
  assistant: Message | null;
  citations: Message[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Safely parses a JSON citation string into an array of citation objects.
 * Returns an empty array if the string is malformed or missing the citations key.
 *
 * @param citationText - Raw JSON string from a tool message's content field
 */
export const parseCitations = (citationText: string): any[] => {
  try {
    const parsed = JSON.parse(citationText);
    if (parsed.citations && Array.isArray(parsed.citations)) {
      return parsed.citations;
    }
  } catch {
    // Malformed JSON — fall through to empty array
  }
  return [];
};

// ─── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Manages pagination state across multiple assistant proposal messages and
 * resolves the full message bundle (user prompt + assistant content + citations)
 * for the currently selected proposal index.
 *
 * @param messages - Full flat message list from AiProposalContext
 */
export const useProposalNavigation = (messages: Message[]) => {

  /** Filtered list containing only assistant messages (one per proposal version) */
  const assistantMessages = messages.filter((msg) => msg.role === "assistant");

  /** Always initialise to the latest proposal */
  const [currentProposalIndex, setCurrentProposalIndex] = useState(() =>
    assistantMessages.length > 0 ? assistantMessages.length - 1 : 0
  );

  /** Keep index pointing at the latest proposal whenever new messages arrive */
  useEffect(() => {
    if (assistantMessages.length > 0) {
      setCurrentProposalIndex(assistantMessages.length - 1);
    }
  }, [assistantMessages.length]);

  // ── Navigation handlers ─────────────────────────────────────────────────────

  /** Navigate to the previous proposal version, clamped at index 0 */
  const handlePrevious = () =>
    setCurrentProposalIndex((prev) => Math.max(0, prev - 1));

  /** Navigate to the next proposal version, clamped at the last index */
  const handleNext = () =>
    setCurrentProposalIndex((prev) =>
      Math.min(assistantMessages.length - 1, prev + 1)
    );

  // ── Message resolver ────────────────────────────────────────────────────────

  /**
   * Resolves the full message bundle for a given proposal index:
   * - The assistant message at that index
   * - The user message that immediately preceded it (if any)
   * - All tool/citation messages that follow until the next assistant message
   *
   * @param proposalIndex - Index into the assistantMessages array
   */
  const getMessagesForProposal = (proposalIndex: number): ProposalMessages => {
    const currentAssistantMessage = assistantMessages[proposalIndex];
    if (!currentAssistantMessage) return { userMsg: undefined, assistant: null, citations: [] };

    // Locate this assistant message in the flat messages array
    const assistantMessageIndex = messages.findIndex(
      (msg) => msg.id === currentAssistantMessage.id
    );

    // Grab the immediately preceding user message if one exists
    let userMsg: string | undefined;
    if (assistantMessageIndex > 0) {
      const prevMsg = messages[assistantMessageIndex - 1];
      if (prevMsg?.role === "user") userMsg = prevMsg.content;
    }

    // Collect all tool messages between this and the next assistant message
    const citations: Message[] = [];
    for (let i = assistantMessageIndex + 1; i < messages.length; i++) {
      if (messages[i].role === "assistant") break;
      if (messages[i].role === "tool")      citations.push(messages[i]);
    }

    return { userMsg, assistant: currentAssistantMessage, citations };
  };

  return {
    assistantMessages,
    currentProposalIndex,
    handlePrevious,
    handleNext,
    getMessagesForProposal,
  };
};