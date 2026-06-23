import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCreateConversation, useConversationMessages } from "@query/layout/conversations/hooks";
import { useCreateWorkspace } from "@query/layout/workspace/hooks";
import { useWorkspaceContext } from "../../../../context/WorkspaceContext";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Workspace = {
  id: string;
  name: string;
  description?: string;
  pre_prompt?: string;
  is_private?: boolean;
  [key: string]: any;
};

interface UseConversationManagerProps {
  convId: string;
  feature: string;
  aiProposalWorkspace: Workspace | undefined;
  setFollowUpMessages: React.Dispatch<React.SetStateAction<any[]>>;
  setIsQAcomplete: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSalesQAsUploaded: React.Dispatch<React.SetStateAction<boolean>>;
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Manages conversation lifecycle: creation, navigation, and history hydration.
 * Encapsulates all side-effects related to starting or resuming a conversation.
 */
export const useConversationManager = ({
  convId,
  feature,
  aiProposalWorkspace,
  setFollowUpMessages,
  setIsQAcomplete,
  setIsSalesQAsUploaded,
}: UseConversationManagerProps) => {
  const navigate   = useNavigate();
  const location   = useLocation();

  const { mutateAsync: createWorkspace } = useCreateWorkspace();
  const { mutate: createConversation }   = useCreateConversation();
  const { setSelectedWorkspace }         = useWorkspaceContext();

  // ── Internal state ──────────────────────────────────────────────────────────
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  // ── Data fetching ───────────────────────────────────────────────────────────

  const {
    data: historyMessages,
    isLoading: historyMessagesLoading,
    isError: historyMessagesError,
  } = useConversationMessages(convId, 1000 * 60);

  // ── Handlers ────────────────────────────────────────────────────────────────

  /**
   * Creates a new conversation under the AI Proposal workspace.
   * Also creates the workspace itself if it doesn't exist yet.
   * Navigates to the new conversation route on success.
   *
   * @param title - User-supplied proposal title (truncated to 50 chars)
   * @returns The new conversation ID, or null if creation failed
   */
  const handleCreateConversation = async (title: string): Promise<string | null> => {
    if (isCreatingConversation || !title.trim()) return null;

    setIsCreatingConversation(true);

    // Create workspace on-demand if it hasn't been provisioned yet
    let workspace = aiProposalWorkspace;
    if (!workspace) {
      workspace = await createWorkspace({
        name: "AI Proposal",
        description: "AI Proposal Workspace",
        is_private: true,
      });
    }

    setSelectedWorkspace(workspace as Workspace);

    const truncatedTitle = title.slice(0, 50) + (title.length > 50 ? "..." : "");
    const payload = {
      title: truncatedTitle,
      workspace_id: workspace?.id || "",
      component_type: "proposal",
    };

    try {
      const res = await new Promise<any>((resolve, reject) =>
        createConversation(payload, { onSuccess: resolve, onError: reject })
      );

      if (res?.id) {
        setSelectedConversation({
          id: res.id,
          title: res.title,
          workspace_id: res.workspace_id,
          component_type: "proposal",
        });

        // Persist the sales QA flag for this conversation
        localStorage.setItem(`isSalesQas----${res.id}`, "false");

        navigate(`/app/${feature}/${workspace?.id}/${res.id}`, { replace: true });
        return res.id;
      }
    } catch (_err) {
      // Swallow — caller can surface error if needed
    } finally {
      setIsCreatingConversation(false);
    }

    return null;
  };

  /**
   * Hydrates local state from persisted conversation history.
   * Marks the conversation as QA-complete if any assistant message exists.
   * Reads the sales-QA flag from localStorage.
   */
  const loadConversationHistory = () => {
    setIsQAcomplete(false);
    setFollowUpMessages([]);

    if (!historyMessages || historyMessages.length === 0) return;

    const salesQAsFlag = localStorage.getItem(`isSalesQas----${convId}`) === "true";
    setIsSalesQAsUploaded(salesQAsFlag);

    const followUps = historyMessages.filter(
      (m) => m.role === "assistant" || m.role === "tool" || m.role === "user"
    );

    setFollowUpMessages(
      followUps.map((m) => ({
        id:         m.id,
        content:    m.content,
        created_at: m.created_at,
        role:       m.role,
      }))
    );

    // Mark QA complete if at least one assistant reply exists
    if (followUps.some((m) => m.role === "assistant")) {
      setIsQAcomplete(true);
    }
  };

  return {
    selectedConversation,
    isCreatingConversation,
    historyMessages,
    historyMessagesLoading,
    historyMessagesError,
    handleCreateConversation,
    loadConversationHistory,
  };
};