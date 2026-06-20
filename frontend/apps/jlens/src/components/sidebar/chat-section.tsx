import { useState } from "react";
import { AtomicButton } from "@ui/components/atomic/atoms/button/button";
import { Text, TextType } from "@ui/components/atomic/atoms/text/text";
import { ChevronUp, ChevronDown } from "lucide-react";
import { WorkspaceItem } from "./workspace-item";
import { useUserContext } from "../../context/UserContext";

interface Workspace {
  id: string;
  name: string;
  isExpanded: boolean;
  is_system_workspace?: boolean;
  user_id?: string | null;
  chats: { name: string; id: string; component_type: 'chat'|'proposal' }[];
}


interface ChatsSectionProps {
  workspaces: Workspace[];
  selectedWorkspace: string;
  selectedChat: string;
  onWorkspaceToggle: (workspaceName: string) => void;
  onChatSelect: (chatName: string, workspaceName: string, chatId: string, componentType: 'chat'|'proposal') => void;
  onAddChat: (workspaceName: string) => void;
  onDeleteChat: (workspaceName: string, chatName: string) => void;
  isSharedFoldersCollapsed: boolean;
}

export function ChatsSection({
  workspaces,
  selectedWorkspace,
  selectedChat,
  onWorkspaceToggle,
  onChatSelect,
  onAddChat,
  onDeleteChat,
  isSharedFoldersCollapsed,
}: ChatsSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useUserContext();

  const getWorkspaceType = (workspace: Workspace): 'system' | 'user' | 'shared' => {
    if (workspace.is_system_workspace) return 'system';
    if (String(workspace.user_id) === String(user?.id)) return 'user';
    return 'shared';
  };
  return (
    <div
      className={`
        flex flex-col border-b border-gray-100 dark:border-gray-700 
        ${isCollapsed ? "flex-shrink-0" : isSharedFoldersCollapsed ? "flex-1" : "flex-1"}
        min-h-0
      `}
    >
      {/* Header - Fixed height */}
      <div className="flex items-center justify-between p-2 sm:p-3 pb-1 sm:pb-2 flex-shrink-0">
        <Text
          type={TextType.paragraph}
          text="Workspaces"
          className="text-xs sm:text-sm truncate"
        />
        <AtomicButton
          variant="ghost"
          size="sm"
          text=""
          icon={
            isCollapsed ? (
              <ChevronDown className="w-3 h-3 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronUp className="w-3 h-3 text-gray-500 dark:text-gray-400" />
            )
          }
          iconWrapperClass="flex items-center justify-center w-5 h-5 bg-transparent rounded-md"
          className="p-0 m-0 w-5 h-5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex-shrink-0"
          onClick={() => setIsCollapsed(!isCollapsed)}
        />
      </div>

      {/* Content - Scrollable when needed */}
      {!isCollapsed && (
        <div className="px-2 sm:px-3 pb-2 sm:pb-3 overflow-y-auto overflow-x-hidden flex-1 min-h-0 custom-scrollbar">
          <div className="space-y-1 pr-1">
            {workspaces.map((workspace) => (
              <div key={workspace.id} className="w-full">
                <WorkspaceItem
                  workspace={workspace}
                  isSelected={selectedWorkspace === workspace.name}
                  selectedChat={selectedChat}
                  workspaceType={getWorkspaceType(workspace)}
                  onToggle={() => onWorkspaceToggle(workspace.name)}
                  onSelectChat={(chat) =>
                    onChatSelect(chat.name, workspace.name, chat.id, chat.component_type)
                  }
                  onAddChat={() => onAddChat(workspace.name)}
                  onDeleteChat={(chatName) =>
                    onDeleteChat(workspace.name, chatName)
                  }
                  onDeleteWorkspace={() => {}}
                />

              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
