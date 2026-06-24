import React                        from "react";
import { useLocation }              from "react-router-dom";
import { aiProposalApi }            from "@query/ai-proposal/actions";
import { useAiProposalContext }     from "../home";
import EditorPanel                  from "./EditorPanel";
import ProposalToolbar              from "../components/ProposalToolbar";
import CitationList                 from "../components/CitationList";
import { useProposalNavigation }    from "../hooks/useProposalNavigation";

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * ProposalChat renders the right-hand editor panel of the AI Proposal feature.
 * It displays the currently selected proposal version in an editable Tiptap editor,
 * with a sticky toolbar for navigation/download and a citations block below the content.
 *
 * Proposal version pagination and message resolution are handled by useProposalNavigation.
 */
const ProposalChat = () => {
  const {
    followUpMessages: messages,
    setIsEditorPanelOpen,
  } = useAiProposalContext();

  /** Extract convId from the current route */
  const pathname = useLocation().pathname;
  const convId   = pathname.split("/")[4];

  // ── Local state ─────────────────────────────────────────────────────────────
  
  const [isDownloading, setIsDownloading] = React.useState(false);

  // ── Navigation hook ─────────────────────────────────────────────────────────

  const {
    assistantMessages,
    currentProposalIndex,
    handlePrevious,
    handleNext,
    getMessagesForProposal,
  } = useProposalNavigation(messages);

  // ── Toolbar handlers ────────────────────────────────────────────────────────

  /** Closes the editor panel by updating the shared context state */
  const handleClose    = () => setIsEditorPanelOpen?.(false);

  /** Triggers a proposal download via the API */
  const handleDownload = async () => {
    if (!convId) return;
    
    try {
      setIsDownloading(true);
      await aiProposalApi.downloadProposal(convId);
    } catch (error) {
      console.error("Download failed:", error);
      // Optionally show error toast/notification here
    } finally {
      setIsDownloading(false);
    }
  };

  // ── Resolve current proposal bundle ────────────────────────────────────────

  const { userMsg, assistant, citations } = getMessagesForProposal(currentProposalIndex);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col w-full relative px-4">
      {/* Blur overlay when downloading */}
      {isDownloading && (
        <div className="absolute inset-0 backdrop-blur-sm bg-white/30 z-50 flex items-center justify-center rounded-lg">
          <div className="flex flex-col items-center gap-3 p-6 bg-white/90 rounded-xl shadow-lg">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-gray-700 font-medium text-lg">Preparing to Download...</p>
            <p className="text-gray-500 text-sm">Your proposal is being generated</p>
          </div>
        </div>
      )}

      {/* Sticky toolbar: download, close, and version pagination */}
      <ProposalToolbar
        totalProposals={assistantMessages.length}
        currentProposalIndex={currentProposalIndex}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onDownload={handleDownload}
        onClose={handleClose}
        isDownloading={isDownloading}  // Pass this to disable download button
      />

      {/* Scrollable proposal content area */}
      <div className="space-y-3 overflow-y-auto flex-1">
        {assistant && (
          <div className="space-y-3">
            {/* User follow-up prompt that triggered this version (if any) */}
            {userMsg && <p>{userMsg}</p>}

            {/* Editable proposal content */}
            <div className="rounded-lg break-words prose prose-custom text-[0.875rem] text-gray-800 leading-relaxed h-screen flex flex-col">
              <EditorPanel
                content={assistant.content}
                convId={convId}
                msgId={assistant.id}
              />
            </div>

            {/* Citation sources rendered below the proposal body */}
            <CitationList citations={citations} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalChat;