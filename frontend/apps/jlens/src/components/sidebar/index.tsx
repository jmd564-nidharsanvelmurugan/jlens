import type React from "react";
import { useState, useEffect } from "react";
import { LogoSection } from "./logo-section";
import { WorkspaceSharePointTabs } from "./workspace-sharepoint-tabs";
import { ProfileSection } from "./profile-section";
import { useNavigate } from "react-router-dom";
import {
  useAllConversations,
} from "../../store/layout/conversations/hooks";
import { useUserContext } from "../../context/UserContext";
import { useWorkspaceContext } from "../../context/WorkspaceContext";
import { Loading } from "../common/loading";

interface Workspace {
  id: string;
  name: string;
  chats?: { name: string; id: string }[];
  isExpanded?: boolean;
}

interface SidebarProps {
  selectedChat: string;
  onChatSelect: (
    chat: string,
    workspace: Workspace,
    componentType: "chat" | "proposal"
  ) => void;
  isCollapsed: boolean;
  onToggleSidebar: () => void;
}

export function Sidebar({
  selectedChat,
  onChatSelect,
  isCollapsed,
  onToggleSidebar,
}: SidebarProps) {
  const { data: allConversations } = useAllConversations();
  const conversations = Array.isArray(allConversations) ? allConversations : [];
  const { access } = useUserContext();
  const navigate = useNavigate();
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<
    Record<string, boolean>
  >({});
  const [workspaceConversations, setWorkspaceConversations] = useState<Record<string, any[]>>({});

  const { sharedWorkspaces, selectedWorkspace, workspaces, setSelectedWorkspace, isLoading } =
    useWorkspaceContext();
  const { user } = useUserContext();

  // Group conversations by workspace from allConversations (no extra API calls)
  useEffect(() => {
    if (allConversations && allConversations.length >= 0) {
      const convos: Record<string, any[]> = {};
      for (const conv of allConversations) {
        if (!convos[conv.workspace_id]) convos[conv.workspace_id] = [];
        convos[conv.workspace_id].push(conv);
      }
      setWorkspaceConversations(convos);
    }
  }, [allConversations]);

  const handleWorkspaceToggle = (workspaceName: string) => {
    setExpandedWorkspaces((prev) => ({
      ...prev,
      [workspaceName]: !prev[workspaceName],
    }));
  };

  const mappedWorkspaces = workspaces?.map((w) => ({
    ...w,
    isExpanded: expandedWorkspaces[w.name] ?? false,
    chats: (workspaceConversations[w.id] || []).map((c) => ({
        name: c.title,
        id: c.id,
        component_type:
          c.component_type === "chat"
            ? ("chat" as "chat")
            : ("proposal" as "proposal"),
      })),
  }));

  const userWorkspaceIds = new Set(workspaces?.map(w => w.id) || []);
  const mappedSharedWorkspaces = (sharedWorkspaces || [])
    .filter(w => !userWorkspaceIds.has(w.id))
    .map((w) => ({
      ...w,
      isExpanded: expandedWorkspaces[w.name] ?? false,
      chats: Array.isArray(allConversations)
        ? allConversations
            .filter((c) => c.workspace_id === w.id)
            .map((c) => ({
              name: c.title,
              id: c.id,
              componentType:
                c.component_type === "chat"
                  ? ("chat" as "chat")
                  : ("proposal" as "proposal"),
            }))
        : [],
    }));

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onToggleSidebar();
  };
  return (
    <>
      {/* Mobile Sidebar */}
      <div
        className={`sm:hidden fixed inset-0 z-50 transition-transform duration-300 ${
          isCollapsed
            ? "translate-x-[-100%] pointer-events-none"
            : "translate-x-0 pointer-events-auto"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/50"
          onClick={handleBackdropClick}
        />
        <div className="relative w-80 bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-800 flex flex-col h-full shadow-2xl border-r border-slate-200/60 dark:border-gray-700/50">
          <LogoSection isCollapsed={false} />
          <WorkspaceSharePointTabs
            workspaces={mappedWorkspaces ?? []}
            folders={[]}
            selectedWorkspace={selectedWorkspace?.name || ""}
            selectedChat={selectedChat}
            onWorkspaceToggle={handleWorkspaceToggle}
            onFolderToggle={handleWorkspaceToggle}
            onChatSelect={(chatName, workspaceName, chatId, componentType) => {
              const foundWorkspace = workspaces?.find(
                (w) => w.name === workspaceName
              );

              if (foundWorkspace) {
                onChatSelect(
                  chatId,
                  foundWorkspace,
                  componentType as "chat" | "proposal"
                );
                navigate(
                  `/app/${componentType === "chat" ? "chat" : componentType === "proposal" ? "ai-proposal" : componentType}/${foundWorkspace?.id}/${chatId}`
                );
              }
            }}
            onAddChat={() => {}}
            onDeleteChat={() => {}}
          />
          <ProfileSection isCollapsed={false} />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div
      id="desktop-sidebar"
        className={`
          hidden sm:flex 
          bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-800
          flex-col h-screen relative 
          transition-all duration-300 ease-in-out 
          overflow-hidden top-0 sticky border-r border-slate-200/60 dark:border-gray-700/50
          shadow-sm
          ${isCollapsed ? "w-16" : "w-72"}`}
      >
        <div className="flex-shrink-0">
          <LogoSection isCollapsed={isCollapsed} onToggleSidebar={onToggleSidebar} />
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          {!isCollapsed ? (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loading size="lg" text="" />
                </div>
              ) : (
              <WorkspaceSharePointTabs
                workspaces={mappedWorkspaces || []}
                folders={[]}
                selectedWorkspace={selectedWorkspace?.name || ""}
                selectedChat={selectedChat}
                onWorkspaceToggle={handleWorkspaceToggle}
                onFolderToggle={handleWorkspaceToggle}
                onChatSelect={(
                  chatName,
                  workspaceName,
                  chatId,
                  componentType
                ) => {
                  const foundWorkspace = workspaces?.find(
                    (w) => w.name === workspaceName
                  );

                  if (foundWorkspace) {
                    onChatSelect(
                      chatId,
                      foundWorkspace,
                      componentType as "chat" | "proposal"
                    );
                    navigate(
                      `/app/${componentType === "chat" ? "chat" : componentType === "proposal" ? "ai-proposal" : componentType}/${foundWorkspace?.id}/${chatId}`
                    );
                  }
                }}
                onAddChat={() => {}}
                onDeleteChat={() => {}}
              />
              )}
              <div className="flex-shrink-0">
                <ProfileSection isCollapsed={false} />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full">
              <div className="flex-1 overflow-y-auto py-4 space-y-3">
                {/* Collapsed Workspace List - Show Icons */}
                {mappedWorkspaces?.map((workspace) => (
                  <div key={workspace.id} className="relative group">
                    <button
                      onClick={() => {
                        setSelectedWorkspace(workspace);
                        navigate('/app/chat');
                      }}
                      className={`
                        w-10 h-10 mx-auto flex items-center justify-center rounded-xl 
                        text-xs font-semibold transition-all duration-200 relative
                        ${selectedWorkspace?.id === workspace.id
                          ? `${workspace.is_system_workspace
                              ? 'bg-gradient-to-br from-[#19105B] to-[#19105B]/80 text-white shadow-lg'
                              : String(workspace.user_id) === String(user?.id)
                              ? 'bg-gradient-to-br from-[#A16BDB] to-[#A16BDB]/80 text-white shadow-lg'
                              : 'bg-gradient-to-br from-[#FF6196] to-[#FF6196]/80 text-white shadow-lg'
                            }`
                          : 'bg-slate-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-700 hover:shadow-md'
                        }
                      `}
                      title={workspace.name}
                    >
                      {workspace.name.charAt(0).toUpperCase()}
                      
                      {/* Active Indicator */}
                      {selectedWorkspace?.id === workspace.id && (
                        <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-white rounded-full shadow-sm" />
                      )}
                    </button>
                    
                    {/* Tooltip */}
                    <div className="
                      absolute left-full ml-2 top-1/2 transform -translate-y-1/2
                      bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded-md
                      opacity-0 group-hover:opacity-100 transition-opacity duration-200
                      pointer-events-none whitespace-nowrap z-50
                    ">
                      {workspace.name}
                      <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-700" />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex-shrink-0 pb-2">
                <ProfileSection isCollapsed={true} />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
