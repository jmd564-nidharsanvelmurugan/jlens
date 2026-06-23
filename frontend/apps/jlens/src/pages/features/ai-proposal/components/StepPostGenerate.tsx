import React from "react";
import { Sparkles } from "lucide-react";
import { Loading } from "@/components/common/loading";
import RefineBox      from "./RefineBox";
import ViewEditButton from "./ViewEditButton";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface StepPostGenerateProps {
  /** Whether the AI is currently generating a response */
  isCurrentlyGenerating: boolean;

  /** Whether the right-hand editor panel is currently visible */
  isEditorPanelOpen: boolean;

  /** Whether the left sidebar is currently collapsed */
  isSidebarCollapsed: boolean;

  /** Setter to toggle the editor panel open/closed */
  setIsEditorPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;

  /** Setter to collapse/expand the sidebar */
  setIsSidebarCollapsed: (value: boolean) => void;

  /** Current value of the follow-up prompt input */
  currentUserPrompt: string;

  /** Setter to update the follow-up prompt */
  setCurrentUserPrompt: (value: string) => void;

  /** Submits the current follow-up prompt to the AI */
  handleFollowUpSend: () => void;

  /** Handles file selection from the upload input */
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;

  /** Active conversation ID passed through to RefineBox */
  convId: string;

  /** Ref attached to the bottom of this panel for auto-scroll */
  bottomRef: React.RefObject<HTMLDivElement>;
}

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * StepPostGenerate renders step 4 of the proposal flow.
 * Shows a loading indicator while generating, then surfaces:
 *  - The generated proposal header with a View/Edit button
 *  - The RefineBox for follow-up prompts and file uploads
 */
const StepPostGenerate = ({
  isCurrentlyGenerating,
  isEditorPanelOpen,
  isSidebarCollapsed,
  setIsEditorPanelOpen,
  setIsSidebarCollapsed,
  currentUserPrompt,
  setCurrentUserPrompt,
  handleFollowUpSend,
  handleFileUpload,
  convId,
  bottomRef,
}: StepPostGenerateProps) => (
  <div className="space-y-3 mt-4" ref={bottomRef}>
    {isCurrentlyGenerating ? (

      /* Loading state */
      <div className="p-3 bg-gray-50 border-l-2 border-[#19105B]">
        <Loading size="sm" text="Generating..." />
      </div>

    ) : (
      <>
        {/* Generated proposal header + View/Edit button */}
        <div className="border border-gray-200 rounded">
          <div className="bg-[#19105B] px-3 py-2">
            <h3 className="text-white font-medium text-xs flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              Generated Proposal
            </h3>
          </div>
          <div className="p-3">
            <ViewEditButton
              isCurrentlyGenerating={isCurrentlyGenerating}
              isEditorPanelOpen={isEditorPanelOpen}
              isSidebarCollapsed={isSidebarCollapsed}
              setIsEditorPanelOpen={setIsEditorPanelOpen}
              setIsSidebarCollapsed={setIsSidebarCollapsed}
            />
          </div>
        </div>

        {/* Refine box for follow-up messages and file uploads */}
        <RefineBox
          currentUserPrompt={currentUserPrompt}
          setCurrentUserPrompt={setCurrentUserPrompt}
          handleFollowUpSend={handleFollowUpSend}
          handleFileUpload={handleFileUpload}
          isCurrentlyGenerating={isCurrentlyGenerating}
          convId={convId}
        />
      </>
    )}
  </div>
);

export default StepPostGenerate;