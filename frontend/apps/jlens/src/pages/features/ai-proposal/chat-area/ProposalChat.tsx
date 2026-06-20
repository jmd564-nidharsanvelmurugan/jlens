import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, Download } from "lucide-react";
import { Loading } from "@/components/common/loading";
import EditorPanel from "./EditorPanel";
import { useAiProposalContext } from "../home";

import { useLocation, useNavigate } from "react-router-dom";
import { aiProposalApi } from "@query/ai-proposal/actions"

const parseCitations = (citationText: string) => {
    try {
        const parsed = JSON.parse(citationText);
        if (parsed.citations && Array.isArray(parsed.citations)) {
            return parsed.citations;
        }
    } catch (e) {
        // If parsing fails, return empty array
    }
    return [];
};

const ProposalChat = () => {
    const { followUpMessages: messages, isGenerating: isLoading, setIsEditorPanelOpen } = useAiProposalContext();
    const location = useLocation();

    // Always get convId from route
    const pathname = location.pathname;
    const convId = pathname.split("/")[4];

    const assistantMessages = messages.filter((msg) => msg.role === "assistant");
    
    // ✅ FIX: Always show the latest proposal
    const [currentProposalIndex, setCurrentProposalIndex] = useState(() => {
        return assistantMessages.length > 0 ? assistantMessages.length - 1 : 0;
    });

    // ✅ FIX: Update index when new messages arrive (follow-up responses)
    useEffect(() => {
        if (assistantMessages.length > 0) {
            setCurrentProposalIndex(assistantMessages.length - 1);
        }
    }, [assistantMessages.length]);

    const handlePrevious = () => {
        setCurrentProposalIndex((prev) => Math.max(0, prev - 1));
    };

    const handleNext = () => {
        setCurrentProposalIndex((prev) =>
            Math.min(assistantMessages.length - 1, prev + 1)
        );
    };

    const getMessagesForProposal = (proposalIndex: number) => {
        const currentAssistantMessage = assistantMessages[proposalIndex];
        let currentUserMessage: string | undefined = undefined;
        if (!currentAssistantMessage) return { assistant: null, citations: [] };

        // Find the index of this assistant message in the full messages array
        const assistantMessageIndex = messages.findIndex(
            (msg) => msg.id === currentAssistantMessage.id
        );
        
        // Get the user message that came before this assistant message
        if (assistantMessageIndex > 0) {
            const prevMsg = messages[assistantMessageIndex - 1];
            if (prevMsg && prevMsg.role === "user") {
                currentUserMessage = prevMsg.content;
            }
        }

        // Collect all tool messages that come after this assistant message and before the next assistant message
        const citations = [];
        for (let i = assistantMessageIndex + 1; i < messages.length; i++) {
            const msg = messages[i];
            if (msg.role === "assistant") break; // Stop at next assistant message
            if (msg.role === "tool") {
                citations.push(msg);
            }
        }
        
        return {
            userMsg: currentUserMessage,
            assistant: currentAssistantMessage,
            citations,
        };
    };

    // Toolbar handlers
    const handleClose = () => {
        if (setIsEditorPanelOpen) setIsEditorPanelOpen(false);
    };
    const handleDownload = () => {
        if (convId) aiProposalApi.downloadProposal(convId);
    };

    return (
        <div className="flex flex-col w-full relative px-4">
            {/* Combined Sticky Horizontal Toolbar */}
            <div className="sticky top-0 z-10 bg-white border-b flex items-center justify-between px-4 py-2 gap-4 shadow-sm">
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleDownload}
                        className="p-2 rounded hover:bg-gray-100 text-gray-500 hover:text-[#19105B]"
                        title="Download proposal"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleClose}
                        className="p-2 rounded hover:bg-gray-100 text-gray-500 hover:text-[#19105B]"
                        title="Close editor"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                {assistantMessages.length > 1 && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrevious}
                            disabled={currentProposalIndex === 0}
                            className="p-1 rounded text-gray-500 hover:text-[#19105B] disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="text-xs text-gray-600">
                            Proposal {currentProposalIndex + 1} of {assistantMessages.length}
                        </div>
                        <button
                            onClick={handleNext}
                            disabled={currentProposalIndex === assistantMessages.length - 1}
                            className="p-1 rounded text-gray-500 hover:text-[#19105B] disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
            <div className="space-y-3 overflow-y-auto flex-1">

                {(() => {
                    const { userMsg, assistant, citations } =
                        getMessagesForProposal(currentProposalIndex);

                    if (!assistant) return null;

                    return (
                        <div className="space-y-3">
                            {userMsg && <p>{userMsg}</p>}
                            {/* Assistant message content */}
                            <div className="rounded-lg break-words prose prose-custom text-[0.875rem] text-gray-800 leading-relaxed h-screen flex flex-col">
                                    <EditorPanel content={assistant.content} convId={convId} msgId={assistant.id} />
                            </div>

                            {/* Citations at the end */}
                            {citations.map((citation, _idx) => (
                                <div
                                    key={citation.id}
                                    className="bottom-0 p-3 bg-[#19105B]/5 border border-[#19105B]/20 rounded"
                                >
                                    {(() => {
                                        const parsedCitations = parseCitations(citation.content);
                                        if (parsedCitations.length > 0) {
                                            return (
                                                <div>
                                                    <div className="text-xs font-medium text-[#19105B] mb-2 flex items-center gap-1">
                                                        <span>📎</span>
                                                        <span>Sources & References</span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        {parsedCitations.map(
                                                            (cite: any, citationIdx: any) => (
                                                                <div
                                                                    key={citationIdx}
                                                                    className="flex items-start gap-2"
                                                                >
                                                                    <span className="text-xs text-gray-500 mt-0.5">
                                                                        {citationIdx + 1}.
                                                                    </span>
                                                                    <a
                                                                        href={cite.url}
                                                                        className="text-xs text-blue-600 hover:text-blue-800 underline flex-1 break-all"
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                    >
                                                                        {cite.filepath}
                                                                    </a>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <div className="text-xs text-gray-600 font-mono">
                                                    Citations: {citation.content}
                                                </div>
                                            );
                                        }
                                    })()}
                                </div>
                            ))}
                        </div>
                    );
                })()}

                {/* {isLoading && (
                    <div className="p-3 bg-gray-50 border-l-2 border-[#19105B]">
                        <Loading size="sm" text="Generating..." />
                    </div>
                )} */}
            </div>
        </div>
    );
};
export default ProposalChat;