import { createContext, useContext } from "react";
import type { AiProposalContextType } from "../types";

// ─── Context Definition ────────────────────────────────────────────────────────

/**
 * Shared context for the AI Proposal feature.
 * Provides follow-up messages, generation state, and editor panel control
 * to deeply nested child components without prop drilling.
 */
export const AiProposalContext = createContext({} as AiProposalContextType);

// ─── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Convenience hook to consume AiProposalContext.
 * Must be used inside a component wrapped by AiProposalContext.Provider.
 *
 * @throws {Error} if used outside the provider tree
 */
export const useAiProposalContext = () => {
  const context = useContext(AiProposalContext);

  if (!context) {
    throw new Error("useAiProposalContext must be used within AiProposalContext.Provider");
  }

  return context;
};