"use client";

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { AtomicButton } from "@ui/components/atomic/atoms/button/button";
import {
  Trash2,
  MessagesSquare,
  ChevronRight,
  Edit,
  MoreHorizontal,
  BookOpen,
  Files,
  FileText,
  ImageIcon,
  Video,
  Music,
  Archive,
  Code,
  Cable,
  Building2,
  UserCircle,
  Users,
  Share2,
  Download,
  Eye,
  EyeOff
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@ui/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle, SheetDescription, VisuallyHidden } from "@ui/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@ui/components/ui/tooltip";
import { AtomicDropdown } from "@ui/components/atomic/molecules/dropdown-menu/dropdown-menu";
import { useDeleteConversation } from "../../store/layout/conversations/hooks";
import { useDeleteWorkspace } from "../../store/layout/workspace/hooks";
import { useUpdateWorkspace } from "../../store/layout/workspace/hooks";
import { useConversationContext } from "../../context/ConversationContext";
import { Input } from "@ui/components/ui/input";
import { Label } from "@ui/components/ui/label";
import { useWorkspaceFilesList, useJmanSalesFiles } from "../../store/layout/workspace/hooks";
import { AtomicModal } from "@ui/components/atomic/atoms/modal/modal";
import { useWorkspaceContext } from "../../context/WorkspaceContext"
import { Loading } from "../common/loading";
import { Sparkles } from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  isExpanded: boolean;
  is_system_workspace?: boolean;
  pre_prompt?: string;
  chats: { name: string; id: string; component_type: string }[];
}

interface WorkspaceItemProps {
  workspace: Workspace;
  isSelected: boolean;
  selectedChat: string;
  workspaceType?: 'system' | 'user' | 'shared';
  onToggle: () => void;
  onSelectChat: (chat: {
    name: string;
    id: string;
    workspaceName: string;
    component_type: "chat" | "proposal";
  }) => void;
  onAddChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onDeleteWorkspace?: (workspaceName: string) => void;
}

async function downloadFile(workspaceId: string, fileId: string, fileName: string) {
  try {
    const { axiosInstance } = await import("../../store/axios");
    const res = await axiosInstance.get(
      `/workspaces/${workspaceId}/files/${fileId}/view/?disposition=attachment`,
      { responseType: "blob" }
    );
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (err) {
    console.error("Download failed:", err);
  }
}

export function WorkspaceItem({
  workspace,
  isSelected,
  selectedChat,
  workspaceType = 'user',
  onToggle,
  onSelectChat,
  onDeleteChat,
}: WorkspaceItemProps) {
  const navigate = useNavigate();
  // const [hoveredChat, setHoveredChat] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [pre_prompt, setpre_prompt] = useState(workspace.pre_prompt || "");
  const [editpre_promptModalOpen, setEditpre_promptModalOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedChatTitle, setSelectedChatTitle] = useState<string | null>(
    null
  );
  const [workspaceDeleteModalOpen, setWorkspaceDeleteModalOpen] =
    useState(false);
  const [fileToDelete, setFileToDelete] = useState<{id: string, name: string} | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filesDrawerOpen, setFilesDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  
  const itemsPerPage = 10;
  
  const isJmanSales = workspace.name === "Jman Sales";
  const { data: workspaceFiles, isLoading: workspaceFilesLoading, refetch: refetchFiles } = useWorkspaceFilesList(
    workspace.id,
    filesDrawerOpen && !isJmanSales
  );
  const { data: jmanSalesFiles, isLoading: jmanSalesFilesLoading } = useJmanSalesFiles(
    filesDrawerOpen && isJmanSales
  );
  
  const filesList = isJmanSales ? jmanSalesFiles?.files : workspaceFiles;
  const totalFilesFromAPI = isJmanSales ? jmanSalesFiles?.total_count : null;
  const filesLoading = isJmanSales ? jmanSalesFilesLoading : workspaceFilesLoading;
  
  const filteredFiles = Array.isArray(filesList)
    ? filesList.filter((file: any) => 
        file.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.sharepoint_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];
    
  const totalFiles = filteredFiles.length;
  const totalPages = Math.ceil(totalFiles / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFiles = filteredFiles.slice(startIndex, startIndex + itemsPerPage);
  
  // Generate search suggestions
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page on search
    
    if (value.length > 0 && filesList) {
      const suggestions = Array.from(new Set(
        filesList
          .filter((file: any) => 
            (file.name?.toLowerCase().includes(value.toLowerCase()) ||
             file.sharepoint_name?.toLowerCase().includes(value.toLowerCase())) &&
            (file.name?.toLowerCase() !== value.toLowerCase() &&
             file.sharepoint_name?.toLowerCase() !== value.toLowerCase())
          )
          .map((file: any) => file.sharepoint_name || file.name)
          .slice(0, 5)
      )) as string[];
      setSearchSuggestions(suggestions);
      setShowSearchSuggestions(suggestions.length > 0);
    } else {
      setSearchSuggestions([]);
      setShowSearchSuggestions(false);
    }
  };
  const { setSelectedWorkspace } = useWorkspaceContext()
  const location = useLocation()
  const feature = location.pathname.split("/")[2]

  const { setSelectedConversation } = useConversationContext();

  const deleteConversation = useDeleteConversation();

  const deleteWorkspace = useDeleteWorkspace();
  const updatePrePrompt = useUpdateWorkspace();

  const confirmWorkspaceDelete = (workspaceId: string) => {
    deleteWorkspace.mutate(workspaceId, {
      onSuccess: () => {
        setWorkspaceDeleteModalOpen(false);
        navigate("chat", { replace: true });
        setSelectedConversation(null);
        toast.success("Workspace Deleted Successfully");
      },
      onError: () => {
      },
    });
  };

  const confirmDelete = () => {
    if (selectedChatId) {
      setModalOpen(false);
      toast.success("Conversation Deleted");
      navigate("chat", { replace: true });
      setSelectedConversation(null);
      deleteConversation.mutate(selectedChatId, {
        onSuccess: () => {
          onDeleteChat(selectedChatId);
        },
      });
    }
  };

  const handleUpdatePrePrompt = () => {
    updatePrePrompt.mutate(
      { workspaceId: workspace.id, updatedData: pre_prompt },
      {
        onSuccess: () => {
          setEditpre_promptModalOpen(false);
          // Optionally trigger refetch or notify parent
        },
        onError: () => {
        },
      }
    );
  };

  const handleFilesClick = () => {
    setFilesDrawerOpen(true);
  };

  const handleShare = async () => {
    if (!shareEmail) return;
    
    try {
      const { axiosInstance } = await import('../../store/axios');
      await axiosInstance.post('/workspaces/share', {
        workspace_id: workspace.id,
        shared_with_email: shareEmail
      });
      toast.success("Workspace shared successfully");
      setShareDialogOpen(false);
      setShareEmail("");
      setEmailSuggestions([]);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to share workspace");
    }
  };

  const handleEmailChange = async (value: string) => {
    setShareEmail(value);
    
    if (value.length >= 2) {
      try {
        const { axiosInstance } = await import('../../store/axios');
        const response = await axiosInstance.get(
          `/user-access/suggest-users?query=${encodeURIComponent(value)}`
        );
        const emails = response.data.slice(0, 3).map((item: any) => 
          typeof item === 'string' ? item : item.email
        );
        setEmailSuggestions(emails);
        setShowSuggestions(true);
      } catch (error) {
        setEmailSuggestions([]);
      }
    } else {
      setEmailSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName?.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "svg":
        return <ImageIcon className="w-4 h-4 text-blue-500" />;
      case "mp4":
      case "avi":
      case "mov":
        return <Video className="w-4 h-4 text-purple-500" />;
      case "mp3":
      case "wav":
      case "flac":
        return <Music className="w-4 h-4 text-green-500" />;
      case "zip":
      case "rar":
      case "7z":
        return <Archive className="w-4 h-4 text-orange-500" />;
      case "js":
      case "ts":
      case "tsx":
      case "jsx":
      case "py":
      case "java":
        return <Code className="w-4 h-4 text-indigo-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const handleWorkspaceClick = () => {
    setSelectedConversation(null)  
    setSelectedWorkspace(workspace)   
    const route = workspace.name === "AI Proposal" ? "/app/ai-proposal" : "/app/chat"
    navigate(route)
  }

  return (
    <div className="space-y-1 w-full min-w-0">
      {/* Workspace Header */}
      <div className="group relative">
        <div
          data-tour={
            workspace.name === "JLens" ? "workspace-jlens" :
              workspace.name === "Jman Sales" ? "workspace-jman-sales" :
                workspace.name === "AI Proposal" ? "workspace-ai-proposal" :
                  undefined
          }
          className={`
            flex items-center w-full px-2 py-1.5 rounded-lg cursor-pointer 
            transition-all duration-200 ease-in-out border
            ${isSelected 
              ? `${workspaceType === 'system' 
                  ? 'bg-[#19105B]/10 border-[#19105B]/20' 
                  : workspaceType === 'user'
                  ? 'bg-[#A16BDB]/10 border-[#A16BDB]/20'
                  : 'bg-[#FF6196]/10 border-[#FF6196]/20'
                }` 
              : `border-transparent ${
                  workspaceType === 'system' 
                    ? 'hover:bg-[#19105B]/5 hover:border-[#19105B]/10' 
                    : workspaceType === 'user'
                    ? 'hover:bg-[#A16BDB]/5 hover:border-[#A16BDB]/10'
                    : 'hover:bg-[#FF6196]/5 hover:border-[#FF6196]/10'
                }`
            }
          `}
        >
          {/* Workspace Icon */}
          <div className={`
            flex items-center justify-center w-6 h-6 rounded-md flex-shrink-0 mr-2
            ${workspaceType === 'system' 
              ? 'bg-[#19105B] text-white' 
              : workspaceType === 'user'
              ? 'bg-[#A16BDB] text-white'
              : 'bg-[#FF6196] text-white'
            }
          `}>
            {workspace.name.toLowerCase() === 'jin mcp' ? (
              <Cable className="w-3 h-3" />
            ) : workspaceType === 'system' ? (
              <Building2 className="w-3 h-3" />
            ) : workspaceType === 'shared' ? (
              <Users className="w-3 h-3" />
            ) : (
              <UserCircle className="w-3 h-3" />
            )}
          </div>

          {/* Workspace Name */}
          <span 
            className={`
              text-sm font-medium truncate flex-1 mr-2
              ${isSelected 
                ? 'text-gray-900 dark:text-white' 
                : 'text-gray-700 dark:text-gray-300'
              }
            `}
            onClick={() => { onToggle(); handleWorkspaceClick(); }}
          >
            {workspace.name === "Jman Sales" ? "Sales" : workspace.name}
            {workspace.name === "JLens" && (
              <span className="ml-2 px-1.5 py-0.5 text-xs font-medium bg-[#19105B]/10 text-[#19105B] dark:bg-[#19105B]/20 dark:text-[#19105B] rounded-md">
                gpt-mode
              </span>
            )}
            {workspace.name === "Jman Sales" && (
              <span className="ml-2 px-1.5 py-0.5 text-xs font-medium bg-[#19105B]/10 text-[#19105B] dark:bg-[#19105B]/20 dark:text-[#19105B] rounded-md">
                sharepoint
              </span>
            )}
            {workspace.name === "AI Proposal" && (
              <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-medium">
                <Sparkles className="w-3 h-3 flex-shrink-0" />
                Beta
              </span>
            )}
          </span>

          {/* Action Icons - All in one row */}
          <div className="flex items-center space-x-1 flex-shrink-0">
            {/* Files Button */}
            {workspace.name !== "AI Proposal" && workspace.name.toLowerCase() !== "jin mcp" && workspace.name !== "JLens" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFilesClick();
                }}
                className={`
                  p-1.5 rounded-md transition-all duration-200
                  ${workspaceType === 'system' 
                    ? 'bg-[#19105B]/10 hover:bg-[#19105B]/20' 
                    : workspaceType === 'user'
                    ? 'bg-[#A16BDB]/10 hover:bg-[#A16BDB]/20'
                    : 'bg-[#FF6196]/10 hover:bg-[#FF6196]/20'
                  }
                `}
                title="View Files"
              >
                <Files className={`w-3.5 h-3.5 ${
                  workspaceType === 'system' 
                    ? 'text-[#19105B]' 
                    : workspaceType === 'user'
                    ? 'text-[#A16BDB]'
                    : 'text-[#FF6196]'
                }`} />
              </button>
            )}

            {/* Share Icon - only for user workspaces */}
            {workspaceType === 'user' && workspace.name.toLowerCase() !== "jin mcp" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShareDialogOpen(true);
                      }}
                      className="p-1.5 rounded-md bg-[#A16BDB]/10 hover:bg-[#A16BDB]/20 transition-all duration-200"
                    >
                      <Share2 className="w-3.5 h-3.5 text-[#A16BDB]" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg border-0">
                    Share Workspace
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* 3-Dot Menu */}
            {!workspace.is_system_workspace && workspace.name.toLowerCase() !== "jin mcp" && (
              <AtomicDropdown
                className="w-36 px-1 py-1 flex flex-col bg-white/90 dark:bg-gray-800/90 backdrop-blur-md dark:border-gray-700 border border-gray-200 shadow-md rounded-md"
                trigger={
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 rounded hover:bg-white/50 dark:hover:bg-gray-700/50 opacity-70 hover:opacity-100 transition-all duration-200"
                  >
                    <MoreHorizontal className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                  </button>
                }
                items={[
                  // Edit option - only for own workspaces
                  ...(workspaceType === 'user' ? [{
                    label: (
                      <div className="flex w-full items-center gap-2 p-2 hover:bg-white/20 dark:hover:bg-gray-700/50 rounded-md text-sm text-gray-700 dark:text-gray-200">
                        <Edit className="w-4 h-4 text-[#A16BDB]" />
                        <span>Edit</span>
                      </div>
                    ),
                    value: "edit",
                    onSelect: () => {
                      setpre_prompt(pre_prompt || "");
                      setEditpre_promptModalOpen(true);
                    },
                  }] : []),
                  // Delete/Unlink option
                  ...(workspaceType === 'shared'
                    ? [{
                        label: (
                          <div className="flex w-full items-center gap-2 p-2 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-md text-sm text-gray-700 dark:text-gray-200">
                            <Trash2 className="w-4 h-4 text-[#A16BDB]" />
                            <span>Unlink</span>
                          </div>
                        ),
                        value: "unlink",
                        onSelect: () => setWorkspaceDeleteModalOpen(true),
                      }]
                    : [{
                        label: (
                          <div className="flex w-full items-center gap-2 p-2 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-md text-sm text-gray-700 dark:text-gray-200">
                            <Trash2 className="w-4 h-4 text-[#A16BDB]" />
                            <span>Delete</span>
                          </div>
                        ),
                        value: "delete",
                        onSelect: () => setWorkspaceDeleteModalOpen(true),
                      }]
                  ),
                ]}
              />
            )}
            
            {/* Expand/Collapse Icon */}
            <button
              onClick={() => { onToggle(); handleWorkspaceClick(); }}
              className="p-1 rounded hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-200"
            >
              <ChevronRight
                className={`
                  w-3.5 h-3.5 text-primary transition-transform duration-200
                  ${workspace.isExpanded ? 'rotate-90' : ''}
                `}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Items */}
      {workspace.isExpanded && (
        <div className="ml-4 space-y-1 mt-1">
          {workspace.chats.map((chat, _) => (
            <div
              key={chat.id}
              className="group flex items-center justify-between w-full min-w-0"
            >
              <div
                className={`
                  flex items-center px-2 py-1 rounded-md cursor-pointer 
                  transition-all duration-200 flex-1 min-w-0 mr-1
                  ${selectedChat === chat.id 
                    ? `${workspaceType === 'system' 
                        ? 'bg-[#19105B]/20 dark:bg-[#19105B]/20' 
                        : workspaceType === 'user'
                        ? 'bg-[#A16BDB]/20 dark:bg-[#A16BDB]/20'
                        : 'bg-[#FF6196]/20 dark:bg-[#FF6196]/20'
                      }` 
                    : `${workspaceType === 'system' 
                        ? 'hover:bg-[#19105B]/10 dark:hover:bg-[#19105B]/10' 
                        : workspaceType === 'user'
                        ? 'hover:bg-[#A16BDB]/10 dark:hover:bg-[#A16BDB]/10'
                        : 'hover:bg-[#FF6196]/10 dark:hover:bg-[#FF6196]/10'
                      }`
                  }
                `}
                onClick={() =>
                  onSelectChat({
                    ...chat,
                    workspaceName: workspace.name,
                    component_type: chat.component_type as "chat" | "proposal",
                  })
                }
              >
                {/* Chat Icon */}
                <div className={`
                  flex items-center justify-center w-4 h-4 rounded mr-2 flex-shrink-0
                  ${selectedChat === chat.id
                    ? `${workspaceType === 'system' 
                        ? 'text-[#19105B] dark:text-[#19105B]' 
                        : workspaceType === 'user'
                        ? 'text-[#A16BDB] dark:text-[#A16BDB]'
                        : 'text-[#FF6196] dark:text-[#FF6196]'
                      }`
                    : 'text-gray-400 dark:text-gray-500'
                  }
                `}>
                  {chat.component_type === "chat" ? (
                    <MessagesSquare className="w-3 h-3" />
                  ) : (
                    <BookOpen className="w-3 h-3" />
                  )}
                </div>

                {/* Chat Name */}
                <span
                  className={`
                    text-xs font-medium truncate flex-1
                    ${selectedChat === chat.id 
                      ? "text-gray-900 dark:text-white" 
                      : "text-gray-600 dark:text-gray-400"
                    }
                  `}
                  title={chat.name}
                >
                  {chat.name}
                </span>
              </div>
              
              {/* Delete Button */}
              <button
                onClick={() => {
                  setSelectedChatId(chat.id);
                  setSelectedChatTitle(chat.name);
                  setModalOpen(true);
                }}
                className="
                  p-1 rounded opacity-0 group-hover:opacity-100 
                  hover:bg-red-50 dark:hover:bg-red-900/20 
                  transition-all duration-200 flex-shrink-0
                "
              >
                <Trash2 className="w-3 h-3 text-red-400 hover:text-red-600" />
              </button>
            </div>
          ))}
        </div>
      )}
      {workspace.name.toLowerCase() === "jin mcp" && (
        <div className="w-full border-t border-gray-300 dark:border-gray-700 my-2" />
      )}
      {/* Modal for Delete Confirmation */}
      <AtomicModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={`Delete Conversation: ${selectedChatTitle ?? ""}`}
        description="Are you sure you want to delete this conversation? This action cannot be undone."
        variant="destructive"
        iconType="destructive"
        onConfirm={confirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
      <AtomicModal
        open={workspaceDeleteModalOpen}
        onOpenChange={setWorkspaceDeleteModalOpen}
        title={`Delete Workspace: ${workspace.name}`}
        description="Are you sure you want to delete this workspace and all its conversations? This action cannot be undone."
        variant="destructive"
        iconType="destructive"
        onConfirm={() => confirmWorkspaceDelete(workspace.id)}
        confirmText="Delete"
        cancelText="Cancel"
      />

      <AtomicModal
        open={fileToDelete !== null}
        onOpenChange={(open) => { if (!open) setFileToDelete(null) }}
        title={`Delete File: ${fileToDelete?.name ?? ""}`}
        description="Are you sure you want to delete this file? This action cannot be undone."
        variant="destructive"
        iconType="destructive"
        onConfirm={async () => {
          if (fileToDelete) {
            try {
              await fetch(`${import.meta.env.VITE_API_URL}/workspaces/${workspace.id}/files/${fileToDelete.id}/`, {
                method: 'DELETE',
                credentials: 'include',
              })
              setFileToDelete(null)
              toast.success("File deleted")
              refetchFiles()
            } catch {
              toast.error("Failed to delete file")
            }
          }
        }}
        confirmText="Delete"
        cancelText="Cancel"
      />

      <Dialog
        open={editpre_promptModalOpen}
        onOpenChange={setEditpre_promptModalOpen}
      >
        <DialogContent className="dark:bg-gray-900 dark:text-white">
          <DialogHeader>
            <DialogTitle>Edit Prep Prompt</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-pre-prompt">Pre-Prompt</Label>
              <Input
                id="edit-pre-prompt"
                value={pre_prompt}
                onChange={(e) => setpre_prompt(e.target.value)}
                placeholder="Enter pre prompt"
                className="mt-1 border border-gray-300 dark:border-gray-600"
              />
            </div>
          </div>

          <DialogFooter>
            <AtomicButton
              onClick={handleUpdatePrePrompt}
              text="Save"
              className="w-full sm:w-auto text-white hover:bg-primary-foreground"
              textWrapperClass="bg-transparent"
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modern Files Drawer with Card-Based Design */}
      <Sheet open={filesDrawerOpen} onOpenChange={setFilesDrawerOpen}>
        <SheetContent
          side="right"
          className="w-[360px] sm:w-[420px] flex flex-col p-0 bg-gray-50 dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800"
        >
          <VisuallyHidden>
            <SheetTitle>{workspace.name} Files</SheetTitle>
            <SheetDescription>Browse and manage files in {workspace.name} workspace</SheetDescription>
          </VisuallyHidden>
          <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#19105B] to-[#3d2f7a] flex items-center justify-center shadow-md">
                    <Files className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {workspace.name}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Workspace files
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => setShowSearchSuggestions(searchSuggestions.length > 0)}
                  onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                  className="w-full h-8 pl-8 pr-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#19105B] focus:border-transparent"
                />
                <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2">
                  <svg
                    className="w-3 h-3 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                
                {/* Search Suggestions */}
                {showSearchSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
                    {searchSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => {
                          setSearchQuery(suggestion);
                          setShowSearchSuggestions(false);
                        }}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Storage Quota */}
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto p-4">
              {filesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loading size="md" text="Loading files..." />
                </div>
              ) : totalFiles > 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-2">
                    {paginatedFiles.map((file: any, index: number) => (
                        <div
                          key={file.id || index}
                          className="group relative bg-white dark:bg-gray-900 rounded-lg border border-gray-200  p-3 hover:shadow-md hover:border-[#8b7bc7] dark:hover:border-[#8b7bc7] transition-all duration-200 cursor-pointer"
                          onClick={() => {
                            if (isJmanSales) {
                              if (file.sharepoint_link || file.link) {
                                window.open(file.sharepoint_link || file.link, "_blank");
                              }
                            }
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                            <div className={`w-8 h-8 rounded-md flex items-center justify-center border ${isJmanSales
                                ? "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border-blue-200 dark:border-blue-700"
                                : "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 border-gray-200 dark:border-gray-700"
                              }`}>
                                {isJmanSales ? (
                                  <img 
                                    src="/logos/ms-sharepoint-svgrepo-com.svg" 
                                    alt="SharePoint" 
                                    className="w-4 h-4"
                                  />
                                ) : (
                                  getFileIcon(file.name || "")
                                )}
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-gray-900 dark:text-white truncate text-sm">
                                  {file.sharepoint_name || file.name || `File ${index + 1}`}
                                </h4>
                              </div>
                              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span>
                                  {(file.last_modified_by_name || file.last_modified_by_email) && (
                                    <>Modified by {file.last_modified_by_name || file.last_modified_by_email}</>
                                  )}
                                </span>
                                {file.last_modified_datetime && (
                                  <span>
                                    {new Date(file.last_modified_datetime).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Preview & Download & Delete buttons */}
                            {!isJmanSales && (() => {
                              const ext = file.name?.split(".").pop()?.toLowerCase();
                              const previewable = ["pdf","png","jpg","jpeg","gif","svg","webp","txt","csv","json","xml","md","html"].includes(ext || "");
                              return previewable ? (
                                <button
                                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-green-50 text-gray-400 hover:text-green-600 transition-all"
                                  title="Preview file"
                                  onClick={async (e) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                    const newTab = window.open('', '_blank');
                                    try {
                                      const { axiosInstance } = await import("../../store/axios");
                                      const res = await axiosInstance.get(
                                        `/workspaces/${workspace.id}/files/${file.id}/view/?disposition=inline`,
                                        { responseType: "blob" }
                                      );
                                      const mimeMap: Record<string, string> = {
                                        pdf: "application/pdf",
                                        png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg",
                                        gif: "image/gif", svg: "image/svg+xml", webp: "image/webp",
                                        txt: "text/plain", csv: "text/csv", json: "application/json",
                                        xml: "text/xml", md: "text/plain", html: "text/html",
                                      };
                                      const mime = mimeMap[ext || ""] || res.data.type;
                                      const blob = new Blob([res.data], { type: mime });
                                      const url = URL.createObjectURL(blob);
                                      if (newTab) newTab.location.href = url;
                                    } catch {
                                      if (newTab) newTab.close();
                                    }
                                  }}
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <span
                                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-gray-300 cursor-not-allowed"
                                  title="Preview not available for this file type"
                                >
                                  <EyeOff className="w-3.5 h-3.5" />
                                </span>
                              );
                            })()}
                            {!isJmanSales && (
                              <button
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-all"
                                title="Download file"
                                onClick={async (e) => {
                                  e.stopPropagation()
                                  e.preventDefault()
                                  await downloadFile(workspace.id, file.id, file.name)
                                }}
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {!isJmanSales && !workspace.is_system_workspace && (
                              <button
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
                                title="Delete file"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setFileToDelete({ id: file.id, name: file.name })
                                }}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-[#8b7bc7]/10 to-[#19105B]/10 rounded-lg border border-[#8b7bc7]/20">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalFiles)} of {totalFiles} files
                        </p>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
                          >
                            Prev
                          </button>
                          <span className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400">
                            {currentPage} / {totalPages}
                          </span>
                          <button 
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center mb-3 border border-gray-200 dark:border-gray-700">
                    <Files className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
                    {searchQuery ? "No files found" : "No files yet"}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-4 text-sm">
                    {searchQuery
                      ? `No files match "${searchQuery}". Try a different search term.`
                      : workspaceType === 'system' 
                        ? "This is a system workspace with pre-configured content."
                        : "This workspace doesn't have any files."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share "{workspace.name}"</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="relative">
              <Input
                placeholder="Enter email address"
                value={shareEmail}
                onChange={(e) => handleEmailChange(e.target.value)}
                onFocus={() => emailSuggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                type="email"
              />
              {showSuggestions && emailSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {emailSuggestions.map((email, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setShareEmail(email);
                        setShowSuggestions(false);
                      }}
                    >
                      {email}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <AtomicButton
              variant="outline"
              text="Cancel"
              onClick={() => {
                setShareDialogOpen(false);
                setShareEmail("");
                setEmailSuggestions([]);
              }}
            />
            <button
              onClick={handleShare}
              disabled={!shareEmail}
              className="px-4 py-2 bg-[#19105B] text-white rounded-md hover:bg-[#2a1a6b] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Share
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
