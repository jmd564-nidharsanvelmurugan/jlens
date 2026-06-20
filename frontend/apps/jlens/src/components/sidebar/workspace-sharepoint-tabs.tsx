import { WorkspaceItem } from "./workspace-item";
import { SharedFoldersSection } from "./sharedfolder-section";
import { useUserContext } from "../../context/UserContext";
import { CreateWorkspaceButton } from "../header/create-workspace-button";

interface Workspace {
  id: string;
  name: string;
  isExpanded: boolean;
  is_system_workspace?: boolean;
  user_id?: string | null;
  chats: { name: string; id: string; component_type: string }[];
}

interface Folder {
  name: string;
  isExpanded: boolean;
  chats: { name: string; id: string; componentType: "chat" | "proposal" }[];
}

interface WorkspaceSharePointTabsProps {
  workspaces: Workspace[];
  folders: Folder[];
  selectedWorkspace: string;
  selectedChat: string;
  onWorkspaceToggle: (workspaceName: string) => void;
  onFolderToggle: (folderName: string) => void;
  onChatSelect: (
    chatName: string,
    workspaceName: string,
    chatId: string,
    componentType: "chat" | "proposal"
  ) => void;
  onAddChat: (workspaceName: string) => void;
  onDeleteChat: (workspaceName: string, chatName: string) => void;
}

export function WorkspaceSharePointTabs({
  workspaces,
  folders,
  selectedWorkspace,
  selectedChat,
  onWorkspaceToggle,
  onFolderToggle,
  onChatSelect,
  onAddChat,
  onDeleteChat,
}: WorkspaceSharePointTabsProps) {
  const { user } = useUserContext();

  // Group and sort workspaces - system workspaces always at top
  const systemOrder = ['JLens', 'Jman Sales', 'AI Proposal'];
  const systemWorkspaces = workspaces
    .filter(w => w.is_system_workspace)
    .sort((a, b) => {
      const indexA = systemOrder.indexOf(a.name);
      const indexB = systemOrder.indexOf(b.name);
      if (indexA === -1 && indexB === -1) return a.name.localeCompare(b.name);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  const userWorkspaces = user?.id ? workspaces
    .filter(w => !w.is_system_workspace && String(w.user_id) === String(user.id))
    .sort((a, b) => a.name.localeCompare(b.name)) : [];
  const sharedWorkspaces = user?.id ? workspaces
    .filter(w => !w.is_system_workspace && String(w.user_id) !== String(user.id) && !!w.user_id)
    .sort((a, b) => a.name.localeCompare(b.name)) : [];

  const renderWorkspaceList = (workspaceList: Workspace[], type: 'system' | 'user' | 'shared', title: string) => {
    // Always show user workspaces section (even if empty) to display create button
    if (workspaceList.length === 0 && type !== 'user') return null;
    
    return (
      <div className="space-y-2">
        {/* Section Header */}
        <div className="px-1 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {title}
          </h3>
          {type === 'user' && (
            <div className="ml-2">
              <CreateWorkspaceButton variant="sidebar" />
            </div>
          )}
        </div>
        
        {/* Workspace Items */}
        {workspaceList.length > 0 && (
          <div className="space-y-1">
            {workspaceList.map((workspace) => (
              <div key={workspace.id} className="w-full">
                <WorkspaceItem
                  workspace={workspace}
                  isSelected={selectedWorkspace === workspace.name}
                  selectedChat={selectedChat}
                  workspaceType={type}
                  onToggle={() => onWorkspaceToggle(workspace.name)}
                  onSelectChat={(chat) =>
                    onChatSelect(
                      chat.name,
                      workspace.name,
                      chat.id,
                      chat.component_type as "chat" | "proposal"
                    )
                  }
                  onAddChat={() => onAddChat(workspace.name)}
                  onDeleteChat={(chatName) => onDeleteChat(workspace.name, chatName)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="h-full flex flex-col">
        <div className="px-2 sm:px-3 pt-4 pb-2 overflow-y-auto overflow-x-hidden flex-1 min-h-0 custom-scrollbar">
          <div className="space-y-4 pr-1" data-tour="workspace-list">
            {renderWorkspaceList(systemWorkspaces, 'system', 'System Workspaces')}
            {renderWorkspaceList(userWorkspaces, 'user', 'My Workspaces')}
            {renderWorkspaceList(sharedWorkspaces, 'shared', 'Shared with Me')}
          </div>
        </div>
      </div>
    </div>
  );
}
