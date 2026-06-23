import { useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { aiProposalApi } from "@query/ai-proposal/actions";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface UseProposalActionsProps {
  convId: string;
  setFollowUpMessages: React.Dispatch<React.SetStateAction<any[]>>;
  setIsQAcomplete:     React.Dispatch<React.SetStateAction<boolean>>;
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Encapsulates all proposal mutation actions:
 *  - Generate initial proposal from DOCX content
 *  - Send a follow-up refinement message
 *  - Upload supporting files to the conversation
 *
 * Uses a per-conversation generating tracker so multiple tabs/conversations
 * don't bleed into each other's loading state.
 */
export const useProposalActions = ({
  convId,
  setFollowUpMessages,
  setIsQAcomplete,
}: UseProposalActionsProps) => {

  // ── Generating state ────────────────────────────────────────────────────────

  /** Set of conversation IDs currently awaiting an AI response */
  const [generatingConvIds, setGeneratingConvIds] = useState<Set<string>>(new Set());

  /** Whether the active conversation is currently awaiting a response */
  const isCurrentlyGenerating = generatingConvIds.has(convId);

  /** Mark a conversation as generating */
  const startGenerating = (id: string) =>
    setGeneratingConvIds((prev) => new Set(prev).add(id));

  /** Remove a conversation from the generating set */
  const stopGenerating = (id: string) =>
    setGeneratingConvIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

  // ── Actions ─────────────────────────────────────────────────────────────────

  /**
   * Generates the initial proposal using DOCX-derived Q&A content.
   * Appends both the assistant message and citations tool message to the feed.
   *
   * @param docxUserPrompt - Optional additional instructions supplied by the user
   */
  const handleGenerateWithDocx = async (docxUserPrompt: string) => {
    if (!convId) {
      toast.error("Conversation not found.");
      return;
    }

    const thisConvId = convId;
    startGenerating(thisConvId);

    try {
      const data = await aiProposalApi.generateProposal(thisConvId, docxUserPrompt);

      // Guard: ignore stale responses if the user navigated away mid-request
      if (thisConvId !== convId) return;

      const texts = data.proposal.map(
        (item: any) => (item.response ?? item.error ?? "") + "\n"
      );

      setFollowUpMessages((prev) => [
        ...prev,
        {
          id:         data.msg_id,
          role:       "assistant",
          content:    texts.join("\n"),
          created_at: new Date().toISOString(),
        },
        {
          id:         uuidv4(),
          role:       "tool",
          content:    JSON.stringify(data.citations),
          created_at: new Date().toISOString(),
        },
      ]);

      setIsQAcomplete(true);
    } catch (_err) {
      toast.error("Failed to generate proposal");
    } finally {
      stopGenerating(thisConvId);
    }
  };

  /**
   * Sends a follow-up refinement prompt and appends the AI response to the feed.
   * Optimistically adds the user message before awaiting the API call.
   *
   * @param prompt            - The user's follow-up text
   * @param setCurrentPrompt  - State setter to clear the input field after send
   */
  const handleFollowUpSend = async (
    prompt: string,
    setCurrentPrompt: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (!prompt.trim()) return;

    const thisConvId = convId;
    startGenerating(thisConvId);

    // Optimistically render the user's message immediately
    setFollowUpMessages((prev) => [
      ...prev,
      {
        id:         uuidv4(),
        content:    prompt,
        created_at: new Date().toISOString(),
        role:       "user",
      },
    ]);
    setCurrentPrompt("");

    try {
      const res = await aiProposalApi.handleFollowUpSend(thisConvId, prompt);

      // Guard: ignore stale responses if the user navigated away mid-request
      if (thisConvId !== convId) return;

      setFollowUpMessages((prev) => [
        ...prev,
        {
          id:         res.msgId,
          content:    res.assistant,
          created_at: new Date().toISOString(),
          role:       "assistant",
        },
        {
          id:         uuidv4(),
          content:    res.tool,
          created_at: new Date().toISOString(),
          role:       "tool",
        },
      ]);
    } catch (_err) {
      // Silent — user can retry by re-sending the message
    } finally {
      stopGenerating(thisConvId);
    }
  };

  /**
   * Validates and uploads one or more supporting files to the conversation.
   * Allowed types: .docx, .pdf, .txt, .csv, .ppt, .pptx (max 64 MB each).
   *
   * @param e - The native file input change event
   */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const allowedExtensions = [".docx", ".pdf", ".txt", ".csv", ".ppt", ".pptx"];

    const hasInvalidType = Array.from(files).some(
      (f) => !allowedExtensions.includes(f.name.substring(f.name.lastIndexOf(".")).toLowerCase())
    );

    if (hasInvalidType) {
      toast.error("Only .docx, .pdf, .txt, .csv, .ppt, .pptx files are allowed");
      return;
    }

    const hasOversizedFile = Array.from(files).some((f) => f.size > 64 * 1024 * 1024);
    if (hasOversizedFile) {
      toast.error("File size must not exceed 64 MB");
      return;
    }

    try {
      const toastId = toast.loading("Uploading...");
      const res     = await aiProposalApi.uploadFiles(convId, files);
      toast.dismiss(toastId);

      if (res.success) toast.success("Files uploaded successfully");
      else             toast.error("File upload unsuccessful");
    } catch {
      toast.error("File upload failed");
    }
  };

  return {
    isCurrentlyGenerating,
    handleGenerateWithDocx,
    handleFollowUpSend,
    handleFileUpload,
  };
};