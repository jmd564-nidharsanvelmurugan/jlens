

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Textarea } from "@ui/components/ui/textarea"
import { Zap, Send, Paperclip, FileText, Layers, AlertTriangle, X, MessageSquare, Plus } from "lucide-react"
import { AtomicButton } from "@ui/components/atomic/atoms/button/button"
import { useWorkspaceContext } from "../../context/WorkspaceContext"
import { useUserContext } from "../../context/UserContext"
import { useModelChatContext } from "../../context/ModelContext"

const chatTypes = [
  {
    id: "document",
    name: "Document",
    icon: FileText,
    description: "Chat with document context",
  },
  {
    id: "standalone",
    name: "General",
    icon: Zap,
    description: "Independent chat session",
  },

  {
    id: "hybrid",
    name: "Hybrid",
    icon: Layers,
    description: "Combined approach",
  },
]

interface ChatInputProps {
  input: string
  setInput: (value: string) => void
  isLoading: boolean
  messagesLength: number
  conversationId?: string
  onSend: (text: string) => void
  uploadFiles?: (e: React.ChangeEvent<HTMLInputElement>) => void
  selectedFilesCount?: number
  selectedFiles?: File[]
  onRemoveFile?: (index: number) => void
  onClearFiles?: () => void
  onNewChat?: () => void
  showNewChatButton?: boolean
}

export function ChatInput({
  input,
  setInput,
  isLoading,
  onSend,
  uploadFiles,
  selectedFilesCount = 0,
  selectedFiles = [],
  onRemoveFile,
  onClearFiles,
  onNewChat,
  showNewChatButton = false,
}: ChatInputProps) {
  const [alertMessage, setAlertMessage] = useState("")
  const [showAlert, setShowAlert] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { selectedWorkspace, isLoading: workspaceLoading } = useWorkspaceContext()
  const { access, user } = useUserContext()
  const { selectedModel, selectedChatType, setSelectedChatType } = useModelChatContext()
  const isJinMcpWorkspace = selectedWorkspace?.name.toLowerCase() === "jin mcp";
  const isJLensWorkspace = selectedWorkspace?.name === "JLens";

  const getWorkspaceType = (): 'system' | 'user' | 'shared' => {
    if (!selectedWorkspace) return 'user';
    if (selectedWorkspace.is_system_workspace) return 'system';
    if (String(selectedWorkspace.user_id) === String(user?.id)) return 'user';
    return 'shared';
  };

  const workspaceType = getWorkspaceType();

  const handleSend = (overrideText?: string) => {
    const content = overrideText || input
    if (!content.trim()) return

    if (!selectedWorkspace) {
      setAlertMessage("Please select a workspace before sending a message.")
      setShowAlert(true)
      return
    }

    if (!selectedModel) {
      setAlertMessage("No model selected. Please create or choose a workspace to continue.")
      setShowAlert(true)
      return
    }

    onSend(content)
    setInput("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      const maxH = 150
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, maxH)}px`
    }
  }

  useEffect(() => {
    if (showAlert) {
      const timeout = setTimeout(() => {
        setShowAlert(false)
      }, 5000)
      return () => clearTimeout(timeout)
    }
  }, [showAlert])

  useEffect(() => {
    if (!input && textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }, [input])

  useEffect(() => {
    sessionStorage.setItem("chatType", selectedChatType)
  }, [selectedChatType])

  useEffect(() => {
  if (isJinMcpWorkspace && selectedChatType !== "standalone") {
    setSelectedChatType("standalone");
  }
}, [isJinMcpWorkspace, selectedChatType, setSelectedChatType]);

  // Focus textarea when streaming completes
  useEffect(() => {
    if (!isLoading && !workspaceLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading, workspaceLoading]);


  const selectedChatTypeData = chatTypes.find((t) => t.id === selectedChatType)

  return (
    <>
    <div className="pb-2">
      <div className="max-w-[52rem] p-1 mx-auto">
        <div className="w-full max-w-xl sm:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto">
          <div className="flex flex-col justify-end">
            <div className="border border-primary/30 rounded-md bg-background focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all duration-200">
              <div className="relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={workspaceLoading ? "Loading workspace..." : "Type your message here..."}
                className={`min-h-[60px] max-h-[150px] resize-none overflow-y-auto px-4 pb-3 !border-0 rounded-md bg-transparent text-foreground text-sm !outline-none !ring-0 !shadow-none focus:!outline-none focus:!ring-0 focus:!border-0 focus:!shadow-none ${
                  isJLensWorkspace && selectedFiles.length > 0 ? 'pt-10' : 'pt-3'
                }`}
                disabled={isLoading || workspaceLoading}
                rows={1}
              />

              {/* JLens Selected Files Display - Inside textarea area */}
              {isJLensWorkspace && selectedFiles.length > 0 && (
                <div className="absolute top-2 left-2 right-12 flex flex-wrap gap-1">
                  {selectedFiles.map((file, index) => (
                    <span key={index} className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      {file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name}
                      <button
                        onClick={() => onRemoveFile?.(index)}
                        className="text-primary hover:text-red-500 ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              </div>

              <div className="flex items-center justify-between px-3 py-1.5">
                {/* Left Side - New Chat Button (only show in conversations) */}
                {showNewChatButton ? (
                  <div className="flex items-center">
                    <button
                      onClick={() => {
                        // Clear current conversation and start new chat
                        setInput('');
                        if (onNewChat) {
                          onNewChat();
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-primary bg-gray-50 border border-primary rounded-md hover:bg-primary hover:text-white hover:border-primary hover:shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      title="Start New Chat"
                    >
                      <Plus className="w-3 h-3" />
                      New Chat
                    </button>
                  </div>
                ) : (
                  <div></div>
                )}

                {/* Right Side Actions */}
                <div className="flex items-center gap-1.5">
                  {/* Chat Type Toggle - Hidden for JLens and Jman Sales workspaces */}
                  {!isJLensWorkspace && selectedWorkspace?.name !== "Jman Sales" && (
                    <AtomicButton
                      onClick={() => {
                        const newChatType = selectedChatType === "document" ? "standalone" : "document";
                        setSelectedChatType(newChatType);
                      }}
                      variant="ghost"
                      size="sm"
                      text=""
                      title={selectedChatType === "document" ? "Switch to General Chat" : "Switch to Document Chat"}
                      icon={selectedChatType === "document" ? 
                        <FileText className="w-3.5 h-3.5" /> : 
                        <MessageSquare className="w-3.5 h-3.5" />
                      }
                      iconWrapperClass={`h-7 w-7 rounded-lg transition-all duration-200 ${
                        selectedChatType === "document" 
                          ? "bg-primary text-white shadow-sm" 
                          : "bg-gray-100 text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                      className="p-0 h-7 w-7 border-0"
                    />
                  )}
                  
                  <input type="file" id="chat-file-input" multiple hidden onChange={uploadFiles} />
                  {(workspaceType !== 'system' || isJLensWorkspace) && (
                    <div className="relative">
                      <AtomicButton
                        onClick={() => {
                          if (!selectedWorkspace?.id) {
                            setAlertMessage("Please select a workspace before uploading files.")
                            setShowAlert(true)
                            return
                          }
                          document.getElementById("chat-file-input")?.click()
                        }}
                        variant="ghost"
                        size="sm"
                        text=""
                        icon={<Paperclip className="w-3.5 h-3.5" />}
                        iconWrapperClass={`h-7 w-7 rounded-lg transition-all duration-200 ${
                          selectedFilesCount > 0 
                            ? "bg-primary text-white shadow-sm" 
                            : "bg-gray-100 text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                        className="p-0 h-7 w-7 border-0"
                        title={selectedFilesCount > 0 ? `${selectedFilesCount} files selected` : "Upload files"}
                      />
                      {selectedFilesCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          {selectedFilesCount}
                        </span>
                      )}
                    </div>
                  )}
                  <AtomicButton
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isLoading || workspaceLoading}
                    size="sm"
                    text=""
                    icon={<Send className="w-3.5 h-3.5" />}
                    iconWrapperClass={`h-7 w-7 rounded-lg transition-all duration-200 ${!input.trim() || isLoading || workspaceLoading
                        ? "bg-muted text-white opacity-50 cursor-not-allowed"
                        : "bg-primary text-white hover:bg-primary/90 shadow-sm"
                      }`}
                    className="p-0 h-7 w-7 border-0"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 text-xs text-muted-foreground">
            <div className="flex flex-wrap gap-4">
              <span className="flex items-center gap-1">
                <span className="text-muted-foreground/70">Chat Type:</span>
                <span className="font-medium text-foreground">{selectedChatTypeData?.name}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="text-muted-foreground/70">Mode:</span>
                <span className="font-medium text-foreground">{selectedModel}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="text-muted-foreground/70">Workspace:</span>
                <span className="font-medium text-foreground">{selectedWorkspace?.name || 'None'}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Professional Alert */}
      {showAlert && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800 rounded-xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4">
              <div className="flex items-center space-x-3">
                {/* <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div> */}
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Workspace Required</h3>
                  {/* <p className="text-sm text-gray-500 dark:text-gray-400">Please complete the following step</p> */}
                </div>
              </div>
              <button
                onClick={() => setShowAlert(false)}
                className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors duration-200"
                aria-label="Close alert"
              >
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 pb-6">
              <p className="text-gray-700 font-semibold py-4 text-center dark:text-gray-300 leading-relaxed">{alertMessage}</p>
            </div>

            {/* Progress Bar */}
            <div className="px-6 pb-6">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                <span>Auto-closing</span>
                {/* <span>5s</span> */}
              </div>
              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
  className="h-full bg-gradient-to-r from-primary to-primary2 rounded-full animate-shrink"
/>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style> */}
    </div>
    </>
  )
}
