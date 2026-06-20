import type React from "react"

import { useEffect, useMemo, useRef, useState } from "react"
import { ScrollArea, ScrollBar } from "@ui/components/ui/scroll-area"
import { Button } from "@ui/components/ui/button"
import { Copy, ThumbsUp, ThumbsDown, Check } from "lucide-react"
import { toast } from "sonner"
import he from "he"
import CitationAccordion from "./references"
import { replaceModelMarkersWithLogos } from "../../../../context/ModelContext"
import { ChartRenderer } from "./chart-renderer"
import { convertPythonToChartJson } from "./python-to-chart-converter"
import { GlobalMarkdown } from "../../../../components/common/GlobalMarkdown"

interface CitationReference {
  id: string
  citationContent: string
  filepath: string
  url?: string
}
interface Message {
  id: string
  role: "user" | "assistant" | "tool"
  content: string
  timestamp: Date
  citationReferences?: CitationReference[]
}

interface ChatMessagesProps {
  messages: Message[]
  isLoading: boolean
  setCitationContent: React.Dispatch<React.SetStateAction<string>>
  workspaceName?: string
}

export function ChatMessages({ messages, isLoading, setCitationContent, workspaceName }: ChatMessagesProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const lastMessageRef = useRef<HTMLDivElement>(null)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [reactions, setReactions] = useState<Record<string, 'like' | 'dislike' | null>>({})
  const [liveCitations, setLiveCitations] = useState<Record<string, any[]>>({})

  const handleCopy = async (content: string, messageId: string) => {
    try {
      const cleanContent = content
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/<[^>]*>/g, '')
        .replace(/\[MODEL:([^\]]+)\]/g, '$1')
        .trim()
      
      await navigator.clipboard.writeText(cleanContent)
      setCopiedMessageId(messageId)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }

  const handleReaction = (messageId: string, type: 'like' | 'dislike') => {
    setReactions(prev => ({
      ...prev,
      [messageId]: prev[messageId] === type ? null : type
    }))
    toast.success(type === 'like' ? "👍 Liked" : "👎 Feedback recorded")
  }

  const prevMessageCount = useRef(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      const scrollArea = scrollAreaRef.current
      const viewport = scrollArea?.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement

      if (viewport) {
        // New message added — always scroll to bottom
        if (messages.length !== prevMessageCount.current) {
          viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" })
          prevMessageCount.current = messages.length;
        }
      }
    }, 50)
    return () => clearTimeout(timeout)
  }, [messages.length])

  const citationMessages: CitationReference[][] = useMemo(() => {
    const dbCitations = messages
      .filter((msg) => msg.role === "tool")
      .map((citation, _, allTools) => {
        // Find the assistant message that precedes this tool message
        const citationIndex = messages.findIndex(m => m.id === citation.id)
        const assistantMsg = messages.slice(0, citationIndex).reverse().find(m => m.role === 'assistant')
        const matchId = assistantMsg ? assistantMsg.id : citation.id
        try {
          const parsedContent = JSON.parse(citation.content)
          const citationsArray = Array.isArray(parsedContent) ? parsedContent : parsedContent.citations || []
          return citationsArray.map((references: any) => ({
            id: matchId,
            citationContent: references.content,
            filepath: references.filepath,
            url: references.url || references.file_link || references.sharepoint_url,
          }))
        } catch (error) {
          console.error("Error parsing citation content:", error)
          return []
        }
      });

    // Add live citations for streaming messages
    const liveCitationArrays: CitationReference[][] = [];
    messages.forEach((msg, index) => {
      if (msg.role === 'assistant' && index > 0) {
        const prevMsg = messages[index - 1];
        if (prevMsg.role === 'user' && liveCitations[prevMsg.id]) {
          const citationsForThisMsg = liveCitations[prevMsg.id].map((ref: any) => ({
            id: msg.id, // Use assistant message ID
            citationContent: ref.content,
            filepath: ref.filepath,
            url: ref.url || ref.file_link || ref.sharepoint_url,
          }));
          liveCitationArrays.push(citationsForThisMsg);
        }
      }
    });

    return [...dbCitations, ...liveCitationArrays];
  }, [messages, isLoading, liveCitations])

  // Create filepath to URL mapping from index data
  const filepathUrlMap = useMemo(() => {
    const urlMap: Record<string, string> = {};
    
    citationMessages.flat().forEach((citation) => {
      if (citation.filepath && citation.url && !urlMap[citation.filepath]) {
        urlMap[citation.filepath] = citation.url; // Use URL from index
      }
    });
    
    return urlMap;
  }, [citationMessages]);

  const formattedMessages = useMemo(() => {
    let removeThisMsg = false
    return messages.map((msg, index) => {
      if (removeThisMsg) {
        removeThisMsg = false
        return {
          ...msg,
          citationReferences: undefined,
        }
      }
      if (msg.content.includes("The requested information is not available in the retrieved data")) removeThisMsg = true

      // Find citations for this message
      let citations = citationMessages.find((citation) => citation[0]?.id === msg.id)
      
      // For assistant messages, check if previous user message has live citations
      if (msg.role === 'assistant' && !citations && index > 0) {
        const prevMsg = messages[index - 1]
        if (prevMsg.role === 'user' && liveCitations[prevMsg.id]) {
          citations = liveCitations[prevMsg.id].map((ref: any) => ({
            id: msg.id,
            citationContent: ref.content,
            filepath: ref.filepath,
            url: ref.url || ref.file_link || ref.sharepoint_url,
          }))
        }
      }
      
      // Pass content directly to GlobalMarkdown — same as streaming path
      let content = msg.content
        .replace(/\[doc(\d+)\]/g, (_, num) => `<sup>${num}</sup>`)
      
      // Convert model markers to logos (only for server messages)
      if (!msg.id.startsWith('temp-')) {
        content = replaceModelMarkersWithLogos(content)
      }

      return {
        ...msg,
        citationReferences: citations,
        content,
      }
    })
  }, [messages, citationMessages, liveCitations])

  useEffect(() => {
    const handleCitationsReady = (event: any) => {
      const { citations, messageId } = event.detail;
      setLiveCitations(prev => ({
        ...prev,
        [messageId]: citations
      }));
    };

    window.addEventListener('citations-ready', handleCitationsReady as EventListener);
    return () => {
      window.removeEventListener('citations-ready', handleCitationsReady as EventListener);
    };
  }, []);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //   }, 3000)
  //   return () => clearInterval(interval)
  // }, [messages])

  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full" ref={scrollAreaRef}>
        {/* <div className="flex flex-col p-2 sm:p-2 space-y-4 sm:space-y-6 max-w-[52rem] mx-auto"> */}
        <div className="flex flex-col space-y-4 max-w-[52rem] mx-auto pt-4">
          {formattedMessages.map((message, index) => {
            const isUser = message.role === "user"
            const isLast = index === formattedMessages.length - 1

            return (
              <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div className={`flex max-w-[85%] sm:max-w-[80%] ${isUser ? "flex-row-reverse" : ""}`}>
                  {message.role === "user" ||
                  message.role === "assistant" ||
                  message.content.includes("The requested information is not available in the retrieved data") ? (
                    <div className="flex flex-col">
                      <div
                        className={`rounded-lg p-1 sm:p-2 text-sm leading-relaxed break-words max-w-[100ch] text-[0.875rem] ${
                          isUser
                            ? "bg-gradient-to-br from-primary to-primary/80 text-white mb-4"
                            : "bg-transparent text-card-foreground mb-2 prose prose-custom"
                        }`}
                        ref={isLast ? lastMessageRef : null}
                      >
                        <GlobalMarkdown 
                          content={message.content}
                          className={`prose prose-custom max-w-none ${isUser ? 'text-white [&_*]:text-white [&_svg]:text-white' : ''}`}
                        />
                        {/* Typing indicator — only during active streaming with content */}
                        {!isUser && message.id.startsWith('temp-') && message.role === 'assistant' && message.content.length > 0 && (
                          <span className="inline-flex items-center ml-1 gap-[3px] align-middle">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                          </span>
                        )}
                      </div>
                      
                      {/* Action buttons for assistant messages - hide during streaming */}
                      {!isUser && message.role === "assistant" && 
                       !(isLoading && isLast) && 
                       !message.id.startsWith('temp-') && (
                        <div className="flex items-center gap-1 mt-1 mb-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(message.content, message.id)}
                            className="reaction-button h-6 px-2 text-xs hover:bg-gray-100 rounded border-0"
                            title="Copy message"
                          >
                            {copiedMessageId === message.id ? (
                              <Check className="h-3 w-3 text-primary" />
                            ) : (
                              <Copy className="h-3 w-3 text-gray-500" />
                            )}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReaction(message.id, 'like')}
                            className={`reaction-button h-6 px-2 text-xs hover:bg-primary/10 rounded border-0 ${
                              reactions[message.id] === 'like' ? 'text-primary bg-primary/10 active' : 'text-gray-500'
                            }`}
                            title="Like this response"
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReaction(message.id, 'dislike')}
                            className={`reaction-button h-6 px-2 text-xs hover:bg-red-50 rounded border-0 ${
                              reactions[message.id] === 'dislike' ? 'text-red-600 bg-red-50 active' : 'text-gray-500'
                            }`}
                            title="Dislike this response"
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      
                      {/* Citations below assistant message */}
                      {!isUser && message.role === "assistant" && message.citationReferences && message.citationReferences.length > 0 && (
                        <CitationAccordion
                          messageId={message.id}
                          citationMessages={citationMessages}
                          setCitationContent={setCitationContent}
                          filepathUrlMap={filepathUrlMap}
                          workspaceName={workspaceName}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="w-full">
                      {citationMessages && message.citationReferences && (
                        <CitationAccordion
                          messageId={message.id}
                          citationMessages={citationMessages}
                          setCitationContent={setCitationContent}
                          filepathUrlMap={filepathUrlMap}
                          workspaceName={workspaceName}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] sm:max-w-[80%]">
                <div className="rounded-lg px-4 py-3 space-y-3">
                  <div className="flex items-center space-x-3">
                    <p className="text-sm text-gray-500">JLens is thinking...</p>
                    <div className="flex space-x-1.5">
                      <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <div className="h-3 bg-gray-200 rounded-full animate-pulse w-[85%]" style={{ animationDelay: "0ms" }} />
                    <div className="h-3 bg-gray-200 rounded-full animate-pulse w-[70%]" style={{ animationDelay: "150ms" }} />
                    <div className="h-3 bg-gray-200 rounded-full animate-pulse w-[55%]" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  )
}
