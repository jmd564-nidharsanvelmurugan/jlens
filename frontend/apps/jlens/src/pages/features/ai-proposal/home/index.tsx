// index.tsx
import React, { useMemo, useEffect, useRef, useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useWorkspaces }      from "@query/layout/workspace/hooks";
import { useLocation }        from "react-router-dom";
import { useWorkspaceContext } from "../../../../context/WorkspaceContext";
import { useSidebarContext }   from "@/context/SidebarContext";

import ProposalChat             from "../chat-area/ProposalChat";
import SalesCallQAs             from "../components/SalesCallQAs";
import StepCreateConversation   from "../components/StepCreateConversation";
import StepGenerateProposal     from "../components/StepGenerateProposal";
import StepPostGenerate         from "../components/StepPostGenerate";
import { AiProposalContext }    from "../context/AiProposalContext";
import { useConversationManager } from "../hooks/useConversationManager";
import { useProposalActions }     from "../hooks/useProposalActions";

// ─── Re-export context hook for consumers ──────────────────────────────────────
export { useAiProposalContext } from "../context/AiProposalContext";

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * AiProposal is the top-level orchestrator for the proposal generator feature.
 * It renders a two-panel layout: a left conversation panel (steps 1–4) and
 * a right editor panel. Logic is delegated to focused hooks; UI to step components.
 */
const AiProposal = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const feature  = pathname.split("/")[2];
  const convId   = pathname.split("/")[4];

  // ── UI layout state ─────────────────────────────────────────────────────────
  const [isEditorPanelOpen,       setIsEditorPanelOpen]       = useState(false);
  const [isConversationPanelOpen, setIsConversationPanelOpen] = useState(true);

  // ── Proposal flow state ─────────────────────────────────────────────────────
  const [conversationTitle,  setConversationTitle]  = useState("");
  const [isQAcomplete,       setIsQAcomplete]       = useState(false);
  const [followUpMessages,   setFollowUpMessages]   = useState<any[]>([]);
  const [currentUserPrompt,  setCurrentUserPrompt]  = useState("");
  const [docxUserPrompt,     setDocxUserPrompt]     = useState("");
  const [isSalesQAsUploaded, setIsSalesQAsUploaded] = useState(false);

  // ── Context & sidebar ───────────────────────────────────────────────────────
  const { setSelectedWorkspace }                     = useWorkspaceContext();
  const { isSidebarCollapsed, setIsSidebarCollapsed } = useSidebarContext();

  const bottomRef = useRef<HTMLDivElement>(null);

  // ── Workspace resolution ────────────────────────────────────────────────────

  const { data: workspaces } = useWorkspaces() as {
    data: Array<{
      id: string; name: string; description: string | null;
      pre_prompt: string | null; is_private: boolean;
      created_at: string; updated_at: string;
    }>;
  };

  /** Locates the dedicated AI Proposal workspace from the full workspace list */
  const aiProposalWorkspace = useMemo(
    () => workspaces?.find((ws) => ws.name === "AI Proposal"),
    [workspaces]
  );

  // ── Domain hooks ────────────────────────────────────────────────────────────

  const {
    isCreatingConversation,
    historyMessages,
    historyMessagesLoading,
    historyMessagesError,
    handleCreateConversation,
    loadConversationHistory,
  } = useConversationManager({
    convId,
    feature,
    aiProposalWorkspace,
    setFollowUpMessages,
    setIsQAcomplete,
    setIsSalesQAsUploaded,
  });

  const {
    isCurrentlyGenerating,
    handleGenerateWithDocx,
    handleFollowUpSend: sendFollowUp,
    handleFileUpload,
  } = useProposalActions({ convId, setFollowUpMessages, setIsQAcomplete });

  // ── Stable context value ────────────────────────────────────────────────────

  /** Shared context object passed to all children via AiProposalContext */
  const contextValue = useMemo(
    () => ({ followUpMessages, isGenerating: isCurrentlyGenerating, setIsEditorPanelOpen }),
    [followUpMessages, isCurrentlyGenerating]
  );

  // ── Effects ─────────────────────────────────────────────────────────────────

  /** Reopen conversation panel whenever the editor is closed */
  useEffect(() => {
    if (!isEditorPanelOpen) setIsConversationPanelOpen(true);
  }, [isEditorPanelOpen]);

  /** Sync selected workspace; clear it on unmount to avoid stale global state */
  useEffect(() => {
    if (aiProposalWorkspace) setSelectedWorkspace(aiProposalWorkspace as any);
    return () => { setSelectedWorkspace(null); };
  }, [aiProposalWorkspace]);

  /** Scroll the bottom of the panel into view when QA completes */
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [isQAcomplete]);

  /** Reset all state when convId changes; hydrate history once messages arrive */
  useEffect(() => {
    if (!convId) {
      setConversationTitle("");
      setIsQAcomplete(false);
      setFollowUpMessages([]);
      setIsEditorPanelOpen(false);
      setIsSalesQAsUploaded(false);
      setIsConversationPanelOpen(true);
      setCurrentUserPrompt("");
      setDocxUserPrompt("");
      return;
    }
    if (historyMessagesLoading || historyMessagesError) return;
    loadConversationHistory();
  }, [convId, historyMessages]);

  // ── Derived handler wrappers ────────────────────────────────────────────────

  /** Injects prompt state into the action hook's follow-up send */
  const handleFollowUpSend = () => sendFollowUp(currentUserPrompt, setCurrentUserPrompt);

  /** Injects the DOCX prompt value into the generate action */
  const handleGenerate = () => handleGenerateWithDocx(docxUserPrompt);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <AiProposalContext.Provider value={contextValue}>
      <div className={`flex ${isConversationPanelOpen ? "justify-center" : ""} mx-auto h-full bg-white`}>

        {/* ── LEFT PANEL ──────────────────────────────────────────────────── */}
        <div
          className={`relative flex-shrink-0 transition-all duration-300 ${
            isConversationPanelOpen ? "w-[50%]" : "w-[48px]"
          }`}
        >
          {/* Panel collapse / expand toggle */}
          <button
            onClick={() =>
              setIsConversationPanelOpen((p) => {
                if (p) {
                  if (!isEditorPanelOpen)  setIsEditorPanelOpen(true);
                  if (!isSidebarCollapsed) setIsSidebarCollapsed(true);
                }
                return !p;
              })
            }
            disabled={!(isQAcomplete && followUpMessages.length > 0)}
            className="absolute top-2 right-2 z-10 text-xs px-2 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConversationPanelOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
          </button>

          {/* Scrollable panel body */}
          <div
            className={`h-full overflow-y-auto transition-opacity duration-200 ${
              isConversationPanelOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold text-[#19105B] mb-1">AI Proposal Generator</h1>
              <p className="text-gray-600 text-xs">Create your perfect proposal</p>
            </div>

            {/* STEP 1 — Name the proposal (before convId exists) */}
            {!convId && (
              <StepCreateConversation
                conversationTitle={conversationTitle}
                setConversationTitle={setConversationTitle}
                isCreatingConversation={isCreatingConversation}
                onStart={handleCreateConversation}
              />
            )}

            {/* STEP 2 — Upload sales call DOCX (convId exists, not yet uploaded) */}
            {convId && !isSalesQAsUploaded && !isQAcomplete && (
              <SalesCallQAs
                isUploaded={isSalesQAsUploaded}
                convId={convId}
                onUpload={() => {
                  setIsSalesQAsUploaded(true);
                  localStorage.setItem(`isSalesQas----${convId}`, "true");
                  setFollowUpMessages([]);
                }}
              />
            )}

            {/* STEP 3 — Optional prompt + generate (after upload, before generation) */}
            {convId && isSalesQAsUploaded && !isQAcomplete && (
              <StepGenerateProposal
                docxUserPrompt={docxUserPrompt}
                setDocxUserPrompt={setDocxUserPrompt}
                isCurrentlyGenerating={isCurrentlyGenerating}
                onGenerate={handleGenerate}
              />
            )}

            {/* STEP 4 — Post-generate: editor button + refine box */}
            {convId && (isQAcomplete || isCurrentlyGenerating) && (
              <StepPostGenerate
                isCurrentlyGenerating={isCurrentlyGenerating}
                isEditorPanelOpen={isEditorPanelOpen}
                isSidebarCollapsed={isSidebarCollapsed}
                setIsEditorPanelOpen={setIsEditorPanelOpen}
                setIsSidebarCollapsed={setIsSidebarCollapsed}
                currentUserPrompt={currentUserPrompt}
                setCurrentUserPrompt={setCurrentUserPrompt}
                handleFollowUpSend={handleFollowUpSend}
                handleFileUpload={handleFileUpload}
                convId={convId}
                bottomRef={bottomRef}
              />
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL — Editor ─────────────────────────────────────────── */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-y-auto border-l border-gray-200 ${
            isEditorPanelOpen
              ? "flex-1 opacity-100 translate-x-0"
              : "flex-[0] opacity-0 translate-x-4 pointer-events-none"
          }`}
        >
          <ProposalChat />
        </div>
      </div>
    </AiProposalContext.Provider>
  );
};

export default AiProposal;