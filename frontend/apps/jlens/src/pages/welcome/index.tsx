import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { UserProvider, useUserContext } from "../../context/UserContext";
import { WorkspaceProvider } from "../../context/WorkspaceContext";
import { ModelChatProvider } from "../../context/ModelContext";
import { SettingsProvider } from "../../context/SettingsContext";
import SidebarProvider from "@/context/SidebarContext";
import { useSidebarContext } from "@/context/SidebarContext";
import { jwtDecode } from "jwt-decode";
import { ConversationProvider } from "../../context/ConversationContext";
import { useRandomBackground } from "../../hooks/useRandomBackground";
import FeedbackSystem from "@/components/feedback";

export interface Workspace {
  id: string;
  name: string;
  chats?: { name: string; id: string }[];
  isExpanded?: boolean;
}
interface DecodedToken {
  user_id?: string;
  user_name?: string;
  sub?: string;
}

const Dashboard = () => {
  const [_, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [selectedChat, setSelectedChat] = useState("");
  const {isSidebarCollapsed, setIsSidebarCollapsed} = useSidebarContext();
  const backgroundImage = useRandomBackground();

  const navigate = useNavigate();
  const location = useLocation();

  const { setUserData, userData } = useUserContext();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode<DecodedToken>(token);
      setUserData({
        id: decoded.user_id || "",
        name: decoded.user_name ?? "User",
        email: decoded.sub || "",
      });
    }
  }, []);

  // 👇 Redirect if path is exactly "/app"
  useEffect(() => {
    if (location.pathname === "/app") {
      navigate("/app/chat", { replace: true });
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setIsSidebarCollapsed(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleChatSelect = (
    chat: string,
    workspace: Workspace,
    componentType: "chat" | "proposal"
  ) => {
    componentType;
    setSelectedChat(chat);
    setSelectedWorkspace(workspace);
    if (window.innerWidth < 640) setIsSidebarCollapsed(true);
  };

  // const handleWorkspaceSelect = (partialWorkspace: Workspace) => {
  //   const fullWorkspace = workspaces?.find(
  //     (w: Workspace) => w.id === partialWorkspace.id
  //   );
  //   if (fullWorkspace) {
  //     setSelectedWorkspace(fullWorkspace);
  //     setSelectedChat(""); // reset chat
  //   }
  // };

  return (
    <div className="h-screen flex bg-background overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url('${backgroundImage}')` }}>
      <FeedbackSystem userId={userData?.id} />
      
      <Sidebar
        selectedChat={selectedChat}
        onChatSelect={handleChatSelect}
        isCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {location.pathname !== '/app/settings' && (
          <Header
            selectedChat={selectedChat}
            isCollapsed={isSidebarCollapsed}
            onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
          />
        )}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <>
      <UserProvider>
        <SettingsProvider>
          <WorkspaceProvider>
            <ModelChatProvider>
              <ConversationProvider>
                <SidebarProvider>
                  <Dashboard />
                </SidebarProvider>
              </ConversationProvider>
            </ModelChatProvider>
          </WorkspaceProvider>
        </SettingsProvider>
      </UserProvider>
    </>
  );
}
