import React, { useContext } from "react";
import { useState, useRef, useMemo, useEffect } from "react";
import {
  CheckCircle,
  Edit3,
  Send,
  Upload,
  MessageSquare,
  Sparkles,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Loading } from "@/components/common/loading";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  useCreateConversation,
  useConversationMessages,
} from "@query/layout/conversations/hooks";
import {
  useWorkspaces,
  useCreateWorkspace,
} from "@query/layout/workspace/hooks";
import { aiProposalApi } from "@query/ai-proposal/actions";
import { useLocation, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { Textarea } from "@ui/components/ui/textarea";
import { toast } from "sonner";
import { useWorkspaceContext } from "../../../../context/WorkspaceContext";
import { useSidebarContext } from "@/context/SidebarContext";
import ProposalChat from "../chat-area/ProposalChat";
import { createContext } from "react";
import type { AiProposalContextType } from "../types";
import SalesCallQAs from "../components/SalesCallQAs";

// ─── Context ──────────────────────────────────────────────────────────────────

const AiProposalContext = createContext({} as AiProposalContextType);

export const useAiProposalContext = () => {
  const context = useContext(AiProposalContext);
  if (!context) throw new Error("AiProposalContext must be used within AiProposalProvider");
  return context;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Workspace = {
  id: string;
  name: string;
  description?: string;
  pre_prompt?: string;
  is_private?: boolean;
  [key: string]: any;
};

const useConversationContext = () => {
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  return { selectedConversation, setSelectedConversation };
};

// ─── Extracted: RefineBox ─────────────────────────────────────────────────────

interface RefineBoxProps {
  currentUserPrompt: string;
  setCurrentUserPrompt: (v: string) => void;
  handleFollowUpSend: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isCurrentlyGenerating: boolean;
  convId: string;
}

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
      <div className="text-xs font-medium text-gray-800 mb-2 flex items-center gap-2">
        <MessageSquare className="w-3 h-3 text-[#19105B]" />
        Refine Your Proposal
      </div>
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
        <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between">
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
          <button
            type="button"
            className="flex items-center gap-1 px-2 py-1 bg-[#19105B] text-white rounded text-xs hover:bg-[#19105B]/90 disabled:opacity-50"
            onClick={handleFollowUpSend}
            disabled={isCurrentlyGenerating || !currentUserPrompt.trim()}
          >
            <Send className="w-3 h-3" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ─── Extracted: ViewEditButton ────────────────────────────────────────────────

interface ViewEditButtonProps {
  isCurrentlyGenerating: boolean;
  isEditorPanelOpen: boolean;
  isSidebarCollapsed: boolean;
  setIsEditorPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSidebarCollapsed: (v: boolean) => void;
}

const ViewEditButton = ({
  isCurrentlyGenerating,
  isEditorPanelOpen,
  isSidebarCollapsed,
  setIsEditorPanelOpen,
  setIsSidebarCollapsed,
}: ViewEditButtonProps) => (
  <button
    onClick={() =>
      setIsEditorPanelOpen((prev) => {
        if (!prev && !isSidebarCollapsed) setIsSidebarCollapsed(true);
        return !prev;
      })
    }
    type="button"
    disabled={isCurrentlyGenerating}
    className="flex items-center justify-center w-[70%] px-6 py-2 rounded-lg transition-colors duration-200 shadow-sm border text-xs font-semibold bg-[#F3F4F6] text-[#19105B] border-[#F3F4F6] hover:bg-[#e5e7eb] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#F3F4F6]"
  >
    <Edit3 className="w-4 h-4 mr-2" />
    View and Edit proposal
    <ChevronRight className="w-4 h-4 ml-2 transition-transform duration-200" />
  </button>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const AiProposal = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const feature = pathname.split("/")[2];
  const workspaceId = pathname.split("/")[3];
  const convId = pathname.split("/")[4];

  // ── State ──────────────────────────────────────────────────────────────────
  const [conversationTitle, setConversationTitle] = useState("");
  const [isQAcomplete, setIsQAcomplete] = useState(false);
  const [followUpMessages, setFollowUpMessages] = useState<any[]>([]);
  const [currentUserPrompt, setCurrentUserPrompt] = useState<string>("");
  const [docxUserPrompt, setDocxUserPrompt] = useState<string>("");
  const [isEditorPanelOpen, setIsEditorPanelOpen] = useState(false);
  const [isConversationPanelOpen, setIsConversationPanelOpen] = useState(true);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  // true once the SalesCallQAs upload is done
  const [isSalesQAsUploaded, setIsSalesQAsUploaded] = useState(false);

  // ── Per-conversation generating tracker ───────────────────────────────────
  const [generatingConvIds, setGeneratingConvIds] = useState<Set<string>>(new Set());
  const isCurrentlyGenerating = generatingConvIds.has(convId);

  const startGenerating = (id: string) =>
    setGeneratingConvIds((prev) => new Set(prev).add(id));

  const stopGenerating = (id: string) =>
    setGeneratingConvIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

  // ── Queries ────────────────────────────────────────────────────────────────
  const { setSelectedConversation } = useConversationContext();
  const { data: workspaces } = useWorkspaces() as {
    data: Array<{
      id: string;
      name: string;
      description: string | null;
      pre_prompt: string | null;
      is_private: boolean;
      created_at: string;
      updated_at: string;
    }>;
  };
  const { mutateAsync: createWorkspace } = useCreateWorkspace();
  const { mutate: createConversation } = useCreateConversation();
  const {
    data: historyMessages,
    isLoading: historyMessagesLoading,
    isError: historyMessagesError,
  } = useConversationMessages(convId, 1000 * 60);
  const { setSelectedWorkspace } = useWorkspaceContext();
  const { isSidebarCollapsed, setIsSidebarCollapsed } = useSidebarContext();

  const bottomRef = useRef<HTMLDivElement>(null);

  // ── Derived ────────────────────────────────────────────────────────────────
  let aiProposalWorkspace = useMemo(
    () => workspaces?.find((ws) => ws.name === "AI Proposal"),
    [workspaces]
  );

  const contextValue = useMemo(
    () => ({ followUpMessages, isGenerating: isCurrentlyGenerating, setIsEditorPanelOpen }),
    [followUpMessages, isCurrentlyGenerating]
  );

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isEditorPanelOpen) setIsConversationPanelOpen(true);
  }, [isEditorPanelOpen]);

  useEffect(() => {
    if (aiProposalWorkspace) setSelectedWorkspace(aiProposalWorkspace as Workspace);
  }, [aiProposalWorkspace]);

  useEffect(() => () => { setSelectedWorkspace(null); }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isQAcomplete]);

  // ── Reset + history loader ────────────────────────────────────────────────
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
        id: m.id,
        content: m.content,
        created_at: m.created_at,
        role: m.role,
      }))
    );
    if (followUps.some((m) => m.role === "assistant")) {
      setIsQAcomplete(true);
    }
  };

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleCreateConversation = async (title: string): Promise<string | null> => {
    if (isCreatingConversation || !title.trim()) return null;
    setIsCreatingConversation(true);
    if (!aiProposalWorkspace) {
      aiProposalWorkspace = await createWorkspace({
        name: "AI Proposal",
        description: "AI Proposal Workspace",
        is_private: true,
      });
    }
    setSelectedWorkspace(aiProposalWorkspace as Workspace);
    const payload = {
      title: title.slice(0, 50) + (title.length > 50 ? "..." : ""),
      workspace_id: aiProposalWorkspace?.id || "",
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
        localStorage.setItem(`isSalesQas----${res.id}`, "false");
        navigate(`/app/${feature}/${aiProposalWorkspace?.id}/${res.id}`, { replace: true });
        return res.id;
      }
    } catch (err) {
    } finally {
      setIsCreatingConversation(false);
    }
    return null;
  };

  const handleGenerateWithDocx = async () => {
    if (!convId) { toast.error("Conversation not found."); return; }
    const thisConvId = convId;
    startGenerating(thisConvId);
    try {
      const data = await aiProposalApi.generateProposal(thisConvId, docxUserPrompt);
      if (thisConvId !== convId) return;
      const texts = data.proposal.map(
        (item: any) => (item.response ?? item.error ?? "") + "\n"
      );
      setFollowUpMessages((prev) => [
        ...prev,
        {
          id: data.msg_id,
          role: "assistant",
          content: texts.join("\n"),
          created_at: new Date().toISOString(),
        },
        {
          id: uuidv4(),
          role: "tool",
          content: JSON.stringify(data.citations),
          created_at: new Date().toISOString(),
        },
      ]);
      setIsQAcomplete(true);
    } catch (err) {
      toast.error("Failed to generate proposal");
    } finally {
      stopGenerating(thisConvId);
    }
  };

  const handleFollowUpSend = async () => {
    if (!currentUserPrompt.trim()) return;
    const thisConvId = convId;
    const prompt = currentUserPrompt;
    startGenerating(thisConvId);
    setFollowUpMessages((prev) => [
      ...prev,
      { id: uuidv4(), content: prompt, created_at: new Date().toISOString(), role: "user" },
    ]);
    setCurrentUserPrompt("");
    try {
      const res = await aiProposalApi.handleFollowUpSend(thisConvId, prompt);
      if (thisConvId !== convId) return;
      setFollowUpMessages((prev) => [
        ...prev,
        {
          id: res.msgId,
          content: res.assistant,
          created_at: new Date().toISOString(),
          role: "assistant",
        },
        {
          id: uuidv4(),
          content: res.tool,
          created_at: new Date().toISOString(),
          role: "tool",
        },
      ]);
    } catch (err) {
    } finally {
      stopGenerating(thisConvId);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const allowed = [".docx", ".pdf", ".txt", ".csv", ".ppt", ".pptx"];
    if (
      Array.from(files).some(
        (f) => !allowed.includes(f.name.substring(f.name.lastIndexOf(".")).toLowerCase())
      )
    ) {
      toast.error("Only .docx, .pdf, .txt, .csv, .ppt, .pptx files are allowed");
      return;
    }
    if (Array.from(files).some((f) => f.size > 64 * 1024 * 1024)) {
      toast.error("File size must not exceed 64 MB");
      return;
    }
    try {
      const id = toast.loading("Uploading ...");
      const res = await aiProposalApi.uploadFiles(convId, files);
      toast.dismiss(id);
      if (res.success) toast.success("Files uploaded successfully");
      else toast.error("File upload unsuccessful");
    } catch {
      toast.error("File upload failed");
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <AiProposalContext.Provider value={contextValue}>
      <div
        className={`flex ${
          isConversationPanelOpen ? "justify-center" : ""
        } mx-auto h-full bg-white`}
      >
        {/* LEFT PANEL */}
        <div
          className={`relative flex-shrink-0 transition-all duration-300 ${
            isConversationPanelOpen ? "w-[50%]" : "w-[48px]"
          }`}
        >
          <button
            onClick={() =>
              setIsConversationPanelOpen((p) => {
                if (p) {
                  if (!isEditorPanelOpen) setIsEditorPanelOpen(true);
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

          <div
            className={`h-full overflow-y-auto transition-opacity duration-200 ${
              isConversationPanelOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold text-[#19105B] mb-1">
                AI Proposal Generator
              </h1>
              <p className="text-gray-600 text-xs">
                Create your perfect proposal
              </p>
            </div>

            {/* STEP 1 — Name the conversation (only when no convId yet) */}
            {!convId && (
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
                      handleCreateConversation(conversationTitle);
                    }
                  }}
                  placeholder="e.g. Digital transformation proposal for Acme Corp"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#19105B] resize-none min-h-[70px] text-sm"
                />
                <div className="flex justify-end">
                  <button
                    onClick={() => handleCreateConversation(conversationTitle)}
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
            )}

            {/* STEP 2 — Upload sales call doc (only once convId exists and not yet uploaded) */}
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

            {/* STEP 3 — Pre-generate: optional prompt + generate button */}
            {convId && isSalesQAsUploaded && !isQAcomplete && (
              <div className="mt-4 space-y-3">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded text-xs border border-green-200">
                    <CheckCircle className="w-3 h-3" />
                    <span>Sales call answers uploaded! Ready to generate.</span>
                  </div>
                </div>
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
                      onClick={handleGenerateWithDocx}
                      disabled={isCurrentlyGenerating}
                      className="px-4 py-2 bg-[#19105B] text-white text-xs rounded hover:bg-[#19105B]/90 flex items-center gap-2 disabled:opacity-50"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Generate Proposal</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4 — Post-generate */}
            {convId && (isQAcomplete || isCurrentlyGenerating) && (
              <div className="space-y-3 mt-4" ref={bottomRef}>
                {isCurrentlyGenerating ? (
                  <div className="p-3 bg-gray-50 border-l-2 border-[#19105B]">
                    <Loading size="sm" text="Generating..." />
                  </div>
                ) : (
                  <>
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
            )}
          </div>
        </div>

        {/* RIGHT PANEL — Editor */}
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