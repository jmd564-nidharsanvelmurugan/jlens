import { useState } from "react"
import { AtomicButton } from "@ui/components/atomic/atoms/button/button"
import {
  FolderOpen,
  File,
  FolderKanban,
  ChevronRight,
  Trash2,
  Files,
} from "lucide-react"
import { AtomicModal } from "@ui/components/atomic/atoms/modal/modal"
import { toast } from "sonner"
import { useDeleteConversation } from "../../store/layout/conversations/hooks"
import { useLocation, useNavigate } from "react-router-dom"
import { useConversationContext } from "../../context/ConversationContext"
import { useWorkspaceContext } from "../../context/WorkspaceContext"
import FilesDisplaySidebar from "./files-display-sidebar"
import { useJmanSalesFiles } from "@query/layout/workspace/hooks"

interface Folder {
  name: string
  isExpanded: boolean
  chats: { name: string; id: string; componentType: "chat" | "proposal" }[]
}

interface SharedFoldersSectionProps {
  folder: Folder
  isSelected: boolean
  onToggleFolder: (folderName: string) => void
  onChatSelect: (
    chatName: string,
    workspaceName: string,
    chatId: string,
    componentType: "chat" | "proposal"
  ) => void
  isChatsCollapsed: boolean
  selectedChat?: string
}

export function SharedFoldersSection({
  folder,
  onToggleFolder,
  onChatSelect,
  isSelected,
  selectedChat,
}: SharedFoldersSectionProps) {
  const [hoveredChat, setHoveredChat] = useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [selectedChatName, setSelectedChatName] = useState<string | null>(null)

  const deleteConversation = useDeleteConversation()
  const { setSelectedConversation } = useConversationContext()
  const { setSelectedWorkspace, sharedWorkspaces = [] } = useWorkspaceContext()
  const location = useLocation()
  const navigate = useNavigate()
  const feature = location.pathname.split("/")[2]
  const [filesDrawerOpen, setFilesDrawerOpen] = useState(false)
  const { data: jmanSalesFiles, isLoading: isLoadingFiles } = useJmanSalesFiles()
  const handleFilesClick = () => {
    setFilesDrawerOpen(true);
  };
  const confirmDelete = () => {
    if (selectedChatId) {
      setDeleteModalOpen(false);
      toast.success("Conversation Deleted");
      setSelectedConversation(null);
      navigate(`/app/${feature}`);
      deleteConversation.mutate(selectedChatId, {
        onError: () => {
          toast.error("Failed to delete conversation")
        },
      })
    }
  }
  const handleFolderClick = () => {
    setSelectedConversation(null) 
    setSelectedWorkspace(sharedWorkspaces[0])
    navigate(`/app/${feature}`) 
  }

  return (
    <div className="space-y-1 w-full min-w-0">
      <div>
        <div key={folder.name} className="space-y-1 w-full min-w-0 ">
          <div
            className={`flex items-center justify-between group w-full min-w-0 rounded-md transition-colors ${isSelected
              ? "bg-gray-200 dark:bg-gray-700"
              : "hover:bg-gray-100 dark:hover:bg-gray-900"
              } py-2`}
          >
            <div className="flex items-center gap-2 ps-2 pe-0 py-1">
              <ChevronRight
                onClick={() => onToggleFolder(folder.name)}
                className={`w-4 h-4 text-primary transition-transform flex-shrink-0 ${folder.isExpanded ? "rotate-90" : ""
                  }`}
              />
            </div>
            <AtomicButton
              variant="ghost"
              text={folder.name}
              onClick={() => {
                onToggleFolder(folder.name)  
                handleFolderClick()          
              }}
              iconPosition="left"
              icon={
                folder.isExpanded ? (
                  <FolderOpen className="w-3 h-3 mr-2 text-[#41368F] dark:text-white flex-shrink-0" />
                ) : (
                  <FolderKanban className="w-3 h-3 mr-2 text-[#41368F] dark:text-white flex-shrink-0" />
                )
              }
              iconWrapperClass="flex items-center bg-transparent p-0 m-0 flex-shrink-0"
              textWrapperClass="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate flex-1 text-left"
              className="justify-start h-7 px-2 py-2 gap-0 rounded-md flex-1 min-w-0 hover:bg-transparent"
            />
            <AtomicButton
              variant="ghost"
              size="icon"
              icon={
                <Files className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              }
              onClick={handleFilesClick}
              className="h-6 w-6 p-0"
              iconWrapperClass="bg-transparent mr-4"
              title="View Files"
            />
          </div>

          {folder.isExpanded && (
            <div className="relative ml-4 space-y-1">
              <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600"></div>
              {folder.chats.map((chat) => (
                <div
                  key={chat.id}
                  className="relative flex items-center justify-between group w-full min-w-0"
                  onMouseEnter={() => setHoveredChat(chat.id)}
                  onMouseLeave={() => setHoveredChat(null)}
                >
                  <div className="absolute left-2 top-1/2 w-3 h-px bg-gray-300 dark:bg-gray-600"></div>
                  <div
                    className={`flex items-center px-1 py-1 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 flex-1 min-w-0 ml-4 ${selectedChat === chat.id
                      ? "bg-gray-100 dark:bg-gray-700"
                      : ""
                      }`}
                    onClick={() =>
                      onChatSelect(
                        chat.name,
                        folder.name,
                        chat.id,
                        chat.componentType
                      )
                    }
                  >
                    <File className="w-3 h-3 mr-2 text-gray-400 flex-shrink-0" />
                    <span
                      className={`text-xs font-medium truncate flex-1 ${selectedChat === chat.id
                        ? "text-[#41368F] dark:text-white"
                        : "text-gray-600 dark:text-gray-400"
                        }`}
                      title={chat.name}
                    >
                      {chat.name}
                    </span>
                  </div>
                  {hoveredChat === chat.id && (
                    <AtomicButton
                      variant="ghost"
                      size="sm"
                      text=""
                      icon={<Trash2 className="w-3 h-3 text-red-500" />}
                      onClick={() => {
                        setSelectedChatId(chat.id)
                        setSelectedChatName(chat.name)
                        setDeleteModalOpen(true)
                      }}
                      className="h-5 w-5 p-0 ml-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md flex-shrink-0"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AtomicModal                                
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title={`Delete Conversation: ${selectedChatName ?? ""}`}
        description="Are you sure you want to delete this conversation? This action cannot be undone."
        variant="destructive"
        iconType="destructive"
        onConfirm={confirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
      <FilesDisplaySidebar
        isOpen={filesDrawerOpen}
        setIsOpen={() => setFilesDrawerOpen(false)}
        filesList={jmanSalesFiles || []}
        filesLoading={isLoadingFiles}
        workspace={folder}
      />
    </div>

  )
}
