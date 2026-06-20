import type React from "react"

import { useLocation, useNavigate } from "react-router-dom"
import { useState, useCallback, useEffect, useRef } from "react"
import {
  useConversationMessages,
  useSendMessage,
  useSendJLensMessage,
  useCreateConversation,
} from "../../../../store/layout/conversations/hooks"
import { useConversationContext } from "../../../../context/ConversationContext"
import { useWorkspaceContext } from "../../../../context/WorkspaceContext"
import { useModelChatContext, mapChatTypeForAPI } from "../../../../context/ModelContext"
import { useUploadWorkspaceFiles } from "../../../../store/layout/workspace/hooks"
import { useUserContext } from "../../../../context/UserContext"
import CitationSidebar from "../chat-area/citation-sidebar"
import { ChatInput } from "@/components/chat-area"
import { ChatMessages } from "../chat-area/chat-messages"
import { UploadProgressBar, type FileUploadStatus } from "@/components/chat-area/upload-progress-bar"
import { toast } from "sonner"
import { SSOCallbackHandler } from "@/auth/sso-callback-handler"

interface Message {
  id: string
  role: "user" | "assistant" | "tool"
  content: string
  timestamp: Date
}

const ChatContainer = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const pathname = location.pathname
  const feature = pathname.split("/")[2]
  const workspaceId = pathname.split("/")[3]
  const conversationId = pathname.split("/")[4]

  const [input, setInput] = useState("")
  const [pendingMessages, setPendingMessages] = useState<Message[]>([])
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)
  const [isCitationSidebarOpen, setIsCitationSidebarOpen] = useState(false)
  const [citationContent, setCitationContent] = useState("")

  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadFileName, setUploadFileName] = useState<string>()
  const [uploadAbortController, setUploadAbortController] = useState<AbortController>()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [fileStatuses, setFileStatuses] = useState<FileUploadStatus[]>([])

  const { selectedWorkspace } = useWorkspaceContext()
  const { selectedModel, selectedChatType } = useModelChatContext()
  const { setSelectedConversation } = useConversationContext()

  const { mutate: createConversation } = useCreateConversation()
  const { mutateAsync: sendMessage, isPending } = useSendMessage()
  const { mutateAsync: sendJLensMessage } = useSendJLensMessage()
  const { data: serverMessages, refetch: refetchMessages } = useConversationMessages(conversationId)
  const { mutateAsync: uploadFilesMutation } = useUploadWorkspaceFiles()
  const { access } = useUserContext()
  
  const isJLensWorkspace = selectedWorkspace?.name === "JLens"

  // Handle new chat creation
  const handleNewChat = useCallback(() => {
    if (!selectedWorkspace?.id) {
      toast.error("Please select a workspace first");
      return;
    }

    // Clear current state
    setInput("");
    setPendingMessages([]);
    setSelectedFiles([]);
    
    // Navigate to main chat page while maintaining workspace context
    navigate(`/app/chat`);
    toast.success("Ready to start new chat!");
  }, [selectedWorkspace, navigate]);

  useEffect(() =>{
    if (conversationId && !location.state?.autoSendMessage) {
      setPendingMessages([])
      refetchMessages()
    }
  }, [conversationId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to bottom when conversation changes
  useEffect(() => {
    if (conversationId && serverMessages) {
      setTimeout(() => {
        const chatContainer = document.querySelector('[data-radix-scroll-area-viewport]');
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 150);
    }
  }, [conversationId]);
  useEffect(() => {
    const autoSendMessage = location.state?.autoSendMessage
    if (autoSendMessage && conversationId && !isPending) {
      navigate(location.pathname, { replace: true, state: {} })
      setPendingMessages([]) // Clear the temp user message from creation step
      setTimeout(() => {
        handleSend(autoSendMessage)
      }, 100)
    }
  }, [conversationId, location.state?.autoSendMessage])

  // Auto-scroll during streaming (throttled)
  const lastScrollTime = useRef(0);
  useEffect(() => {
    if (pendingMessages.length > 0) {
      const now = Date.now();
      if (now - lastScrollTime.current < 200) return;
      lastScrollTime.current = now;
      const chatContainer = document.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
      if (chatContainer) {
        const isNearBottom = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < 150;
        if (isNearBottom) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }
    }
  }, [pendingMessages]);

  // Remove auto-opening - let user click references to open
  // useEffect(() => {
  //   if (citationContent) {
  //     setIsCitationSidebarOpen(true)
  //   }
  // }, [citationContent])

  // Listen for refresh conversation event
  useEffect(() => {
    const handleRefreshConversation = () => {
      if (conversationId) {
        refetchMessages()
      }
    }

    window.addEventListener('refresh-conversation', handleRefreshConversation)
    return () => {
      window.removeEventListener('refresh-conversation', handleRefreshConversation)
    }
  }, [conversationId, refetchMessages])

  // Listen for citation clicks to open sidebar
  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }; // cleanup on unmount
  }, []);
  useEffect(() => {
    const handleCitationClick = (event: CustomEvent) => {
      const { content } = event.detail;
      setCitationContent(content);
      // Only open if not already open
      if (!isCitationSidebarOpen) {
        setIsCitationSidebarOpen(true);
      }
    };

    window.addEventListener('citation-clicked', handleCitationClick as EventListener);
    
    return () => {
      window.removeEventListener('citation-clicked', handleCitationClick as EventListener);
    };
  }, [isCitationSidebarOpen]);

  // Listen for citations-ready event from streaming
  useEffect(() => {
    const handleCitationsReady = (event: CustomEvent) => {
      const { citations, messageId } = event.detail;
      if (citations && citations.length > 0) {
        setCitationContent(JSON.stringify(citations, null, 2));
        // Don't auto-open sidebar - let user click references to open
      }
    };

    window.addEventListener('citations-ready', handleCitationsReady as EventListener);
    
    return () => {
      window.removeEventListener('citations-ready', handleCitationsReady as EventListener);
    };
  }, []);

  const uploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    // For JLens workspace, just store files temporarily
    if (isJLensWorkspace) {
      const fileArray = Array.from(files)
      setSelectedFiles(fileArray)
      
      // Show user which files are selected
      const fileNames = fileArray.map(f => f.name).join(', ')

      
      // Clear the input
      e.target.value = ''
      return
    }
    
    // For other workspaces, use the existing upload logic
    const allowedExtensions = [
      ".docx",
      ".pdf",
      ".txt",
      ".csv",
      ".ppt",
      ".pptx",
    ];
    const MAX_SIZE_MB = 64;
    for (const file of Array.from(files)) {
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      if (!allowedExtensions.includes(ext)) {
      toast.error(`File "${file.name}" has an unsupported extension.`);
      return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File "${file.name}" exceeds the 64MB size limit.`);
      return;
      }
    }
    
    setIsUploading(true)
    setUploadFileName(files.length === 1 ? files[0].name : `${files.length} files`)

    // Initialize per-file statuses
    const initialStatuses: FileUploadStatus[] = Array.from(files).map(f => ({
      filename: f.name,
      stage: "uploading" as const,
    }))
    setFileStatuses(initialStatuses)

    try {
      // Stage 1: Uploading (0-40%)
      setUploadProgress(10)
      await new Promise(resolve => setTimeout(resolve, 300))
      setUploadProgress(30)
      
      const result = await uploadFilesMutation({
        workspaceId: selectedWorkspace?.id || "",
        files,
      })
      
      // Stage 2: Indexing (40-80%)
      setUploadProgress(50)
      setFileStatuses(prev => prev.map(f => ({ ...f, stage: "indexing" as const })))
      await new Promise(resolve => setTimeout(resolve, 500))
      setUploadProgress(70)
      
      // Stage 3: Done (80-100%)
      setUploadProgress(90)
      
      // Update per-file statuses from backend response
      const resultFiles = result?.files || []
      setFileStatuses(prev => prev.map(f => {
        const match = resultFiles.find((r: any) => r.filename === f.filename)
        if (match?.error) return { ...f, stage: "error" as const, error: match.error }
        return { ...f, stage: "done" as const }
      }))
      
      setUploadProgress(100)

      // Show success message
      const successCount = result?.successful ?? files.length
      const failedFiles = resultFiles.filter((f: any) => f.error)
      if (failedFiles.length > 0 && successCount === 0) {
        toast.error(failedFiles[0].error, { duration: 6000 })
      } else if (failedFiles.length > 0) {
        toast.warning(`${successCount} uploaded, ${failedFiles.length} failed: ${failedFiles[0].error}`, { duration: 6000 })
      } else {
        toast.success(`${successCount} file(s) uploaded and indexed successfully`)
      }

      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
        setUploadFileName(undefined)
        setFileStatuses([])
      }, 2000)
    } catch (error) {
      toast.error("Upload failed. Please try again.")
      setIsUploading(false)
      setUploadProgress(0)
      setUploadFileName(undefined)
      setFileStatuses([])
    }
  }

  const handleCancelUpload = () => {
    if (uploadAbortController) {
      uploadAbortController.abort()
      setIsUploading(false)
      setUploadProgress(0)
      setUploadFileName(undefined)
      setUploadAbortController(undefined)
    }
  }

  const handleCreateConversation = async (text: string): Promise<string | null> => {
    if (isCreatingConversation) return null

    setIsCreatingConversation(true)

    const payload = {
      title: text.slice(0, 50) + (text.length > 50 ? "..." : ""), // Use first part of message as title
      workspace_id: selectedWorkspace?.id || "",
      component_type: "chat",
    }

    try {
      const res = await new Promise<any>((resolve, reject) => {
        createConversation(payload, {
          onSuccess: resolve,
          onError: reject,
        })
      })

      if (res?.id) {
        setSelectedConversation({
          id: res.id,
          title: res.title,
          workspace_id: res.workspace_id,
          component_type: "chat",
        })

        // Navigate to the new conversation with the message to auto-send
        navigate(`/app/${feature}/${selectedWorkspace?.id}/${res.id}`, {
          replace: true,
          state: {
            autoSendMessage: text,
          },
        })

        return res.id
      }
    } catch (err) {
    } finally {
      setIsCreatingConversation(false)
      setPendingMessages([])
    }

    return null
  }


  // Combine server messages and pending messages, removing duplicates
  const displayedMessages = [
    ...(serverMessages || []).map((msg: any) => ({
      id: msg.id,
      role: msg.role as "user" | "assistant" | "tool",
      content: msg.content,
      timestamp: new Date(msg.created_at)
    })),
    ...pendingMessages
  ]
  .filter((msg, index, arr) => {
    if (msg.id.startsWith('temp-')) {
      if (msg.role === 'user') {
        const normalize = (s: string) => s.replace(/<div[\s\S]*$/,'').trim()
        const msgText = normalize(msg.content)
        // Only remove if a server message with same content is NEWER (created after this temp)
        return !arr.some(m => {
          if (m.id.startsWith('temp-') || m.role !== 'user') return false
          return normalize(m.content) === msgText && m.timestamp >= msg.timestamp
        })
      }
      return true
    }
    return arr.findIndex(m => m.id === msg.id) === index
  })
  .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

  

  const streamBufferRef = useRef("");
  const rafRef = useRef<number>();
  const streamMsgIdRef = useRef("");

  const flushStream = useCallback(() => {
    if (streamBufferRef.current) {
      const chunk = streamBufferRef.current;
      streamBufferRef.current = "";
      setPendingMessages((prev) =>
        prev.map((msg) =>
          msg.id === streamMsgIdRef.current
            ? { ...msg, content: msg.content + chunk }
            : msg
        )
      );
    }
    rafRef.current = requestAnimationFrame(flushStream);
  }, []);

  const startStreamFlush = (msgId: string) => {
    streamBufferRef.current = "";
    streamMsgIdRef.current = msgId;
    rafRef.current = requestAnimationFrame(flushStream);
  };

  const stopStreamFlush = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    // Flush remaining
    if (streamBufferRef.current) {
      const chunk = streamBufferRef.current;
      streamBufferRef.current = "";
      setPendingMessages((prev) =>
        prev.map((msg) =>
          msg.id === streamMsgIdRef.current
            ? { ...msg, content: msg.content + chunk }
            : msg
        )
      );
    }
  };

  const isInChatView = !!conversationId
  const [isLoading, setIsLoading] = useState(false)
  const handleSend = useCallback(
    async (text: string) => {
      if (!selectedWorkspace || !feature || !text.trim()) return

      // Create user message with formatted content for display and storage
      const formattedContent = isJLensWorkspace && selectedFiles.length > 0 
        ? `${text.trim()}\n\n<div style="margin-top:8px;padding:6px 12px;border-radius:8px;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);font-size:13px;">📎 ${selectedFiles.map(f => `<span style="margin-right:8px;">${f.name} <span style="opacity:0.7;font-size:11px;">(${(f.size / 1024).toFixed(0)}KB)</span></span>`).join('')}</div>`
        : text.trim();

      const tempUserMessage: Message = {
        id: `temp-user-${Date.now()}`,
        role: "user",
        content: formattedContent,
        timestamp: new Date(),
      }
      const tempStreamingMessage: Message = {
        id: `temp-assistant-${Date.now()}`,
        role: "assistant",
        content: "",
        timestamp: new Date(tempUserMessage.timestamp.getTime() + 2000),
      }

      // If no conversation exists, create one first
      if (!conversationId) {
        setPendingMessages([tempUserMessage])
        await handleCreateConversation(text.trim())
        return
      }

      // Add pending message immediately for UI feedback
      setPendingMessages((prev) => [
        ...prev,
        tempUserMessage,
        tempStreamingMessage,
      ])

      const payload : any = {
        conversation_id: conversationId,
        workspace_id: workspaceId,
        content: text.trim(),
        role: "user" as const,
        model_type: selectedModel,
        chat_type: mapChatTypeForAPI(selectedChatType),
        component_type: "chat",
        input_tokens: 0,
        output_tokens: 0,
      }

      if(selectedChatType == 'standalone') {
        payload['pre_prompt'] = selectedWorkspace.pre_prompt
      }

      try {
        setIsLoading(true)
        
        // Use JLens message sending for JLens workspace
        if (isJLensWorkspace) {
          setSelectedFiles([]); // Clear files immediately
          startStreamFlush(tempStreamingMessage.id);
          await sendJLensMessage({
            conversation_id: conversationId,
            workspace_id: workspaceId,
            content: formattedContent,
            model_type: selectedModel,
            files: selectedFiles.length > 0 ? selectedFiles : undefined,
            onTokenAccumulator: (token: string) => {
              setIsLoading(false);
              streamBufferRef.current += token;
            },
          });
          stopStreamFlush();
        } else {
          // Use regular message sending for other workspaces
          startStreamFlush(tempStreamingMessage.id);
          await sendMessage({
            ...payload,
            onTokenAccumulator: (token: string) => {
              setIsLoading(false);
              streamBufferRef.current += token;
            },
          });
          stopStreamFlush();
        }

        // Streaming complete - refetch then clear pending
        setIsLoading(false)
        
        setTimeout(async () => {
          try {
            await refetchMessages()
          } catch { /* ignore */ }
          setPendingMessages([])
        }, 50)

      } catch (err) {
        setPendingMessages((prev) => prev.filter((pm) => pm.id !== tempUserMessage.id))
      }finally {
        setIsLoading(false)
      }
    },
    [conversationId, workspaceId, selectedWorkspace, selectedModel, selectedChatType, sendMessage, sendJLensMessage, isJLensWorkspace, selectedFiles],
  )

  return (
    <div className="flex h-full">
      <SSOCallbackHandler />
      
      {/* Main Chat Area */}
      <div className="flex-1 overflow-hidden relative">
        <div className="flex flex-col h-full dark:bg-gray-900 flex-1">
          <UploadProgressBar
        isUploading={isUploading}
        progress={uploadProgress}
        fileName={uploadFileName}
        onCancel={handleCancelUpload}
        fileStatuses={fileStatuses}
      />
          {isInChatView ? (
            <>
              <ChatMessages
                messages={displayedMessages}
                isLoading={isLoading}
                setCitationContent={setCitationContent}
                workspaceName={selectedWorkspace?.name}
              />
              
              <ChatInput
                input={input}
                setInput={setInput}
                isLoading={isLoading}
                messagesLength={displayedMessages.length}
                conversationId={conversationId}
                onSend={handleSend}
                uploadFiles={uploadFiles}
                selectedFilesCount={isJLensWorkspace ? selectedFiles.length : 0}
                selectedFiles={isJLensWorkspace ? selectedFiles : []}
                onRemoveFile={(index) => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                onClearFiles={() => setSelectedFiles([])}
                onNewChat={handleNewChat}
                showNewChatButton={!!conversationId}
              />
            </>
          ) : (
            <div className="flex flex-col h-full justify-center items-center px-4">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-2 text-primary">
                  {selectedWorkspace?.name ? `${selectedWorkspace.name}` : 'Start Your Conversation'}
                </h1>
                <p className="text-muted-foreground mb-6">
                  {selectedWorkspace?.description || 'Select a workspace from the sidebar to begin chatting with your documents'}
                </p>
              </div>
              <div className="w-full max-w-[52rem]">
                <ChatInput
                  input={input}
                  setInput={setInput}
                  isLoading={isLoading}
                  messagesLength={0}
                  onSend={handleSend}
                  uploadFiles={uploadFiles}
                  selectedFilesCount={isJLensWorkspace ? selectedFiles.length : 0}
                  selectedFiles={isJLensWorkspace ? selectedFiles : []}
                  onRemoveFile={(index) => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                  onClearFiles={() => setSelectedFiles([])}
                  onNewChat={handleNewChat}
                  showNewChatButton={false}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Citation Sidebar */}
      {isCitationSidebarOpen && (
        <div className="w-80 border-l border-gray-300 dark:border-gray-700">
          <CitationSidebar
            content={citationContent}
            onClose={() => {
              setIsCitationSidebarOpen(false)
              setCitationContent("")
            }}
          />
        </div>
      )}
    </div>
  )
}

export default ChatContainer
