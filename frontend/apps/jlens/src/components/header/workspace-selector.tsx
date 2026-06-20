import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/components/ui/select";
import { useEffect, useState } from "react";
import { Share2, Unlink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@ui/components/ui/dialog";
import { Input } from "@ui/components/ui/input";
import { Button } from "@ui/components/ui/button";
import { toast } from "sonner";
import axios from "axios";

interface Workspace {
  id: string;
  name: string;
  is_shared?: boolean;
  is_system_workspace?: boolean;
  user_id?: string;
  owner_email?: string;
}

interface WorkspaceSelectorProps {
  selectedWorkspace: string;
  onWorkspaceSelect: (workspace: Workspace) => void;
  workspaces: Workspace[];
  isLoading: boolean;
}
const SESSION_KEY = "selectedWorkspaceId";

export function WorkspaceSelector({
  selectedWorkspace,
  onWorkspaceSelect,
  workspaces,
  isLoading,
}: WorkspaceSelectorProps) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedForShare, setSelectedForShare] = useState<Workspace | null>(null);
  const [shareEmail, setShareEmail] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    // Get current user ID from token
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.user_id);
      } catch (e) {
        console.error('Failed to parse token', e);
      }
    }
  }, []);

  useEffect(() => {
    if (!selectedWorkspace) {
      const storedId = sessionStorage.getItem(SESSION_KEY);
      const selected = workspaces.find((w) => w.id === storedId);
      if (selected) {
        onWorkspaceSelect(selected);
      }
    }
  }, );

  const handleShare = async () => {
    if (!selectedForShare || !shareEmail) return;
    
    try {
      
      await axios.post(
        `${import.meta.env.VITE_API_URL}/workspaces/share`,
        {
          workspace_id: selectedForShare.id,
          shared_with_email: shareEmail
        },
        { withCredentials: true }
      );
      toast.success("Workspace shared successfully");
      setShareDialogOpen(false);
      setShareEmail("");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to share workspace");
    }
  };

  const handleUnlink = async (workspace: Workspace) => {
    try {
      
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/workspaces/unshare`,
        {
          data: { workspace_id: workspace.id },
          withCredentials: true
        }
      );
      toast.success("Workspace unlinked successfully");
      window.location.reload();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to unlink workspace");
    }
  };

  const isOwnWorkspace = (workspace: Workspace) => {
    return !workspace.is_system_workspace && workspace.user_id === currentUserId && !workspace.is_shared;
  };

  const currentWorkspace = workspaces.find(w => w.id === selectedWorkspace);
  const canShare = currentWorkspace && isOwnWorkspace(currentWorkspace);
  const canUnlink = currentWorkspace?.is_shared;

  return (
    <div className="flex items-center gap-2" data-tour="workspace-selector">
      <Select
        value={selectedWorkspace}
        onValueChange={(id) => {
          const selected = workspaces.find((w) => w.id === id);
          if (selected) {
            sessionStorage.setItem(SESSION_KEY, id); 
            onWorkspaceSelect(selected);
          }
        }}
        disabled={isLoading}
      >
        <SelectTrigger className="w-32 sm:w-36 md:w-40 h-7 sm:h-8 border border-gray-300 text-[#41368F] dark:border-white dark:text-white rounded-md text-xs sm:text-sm bg-gray-100 hover:shadow-md focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none focus-visible:border-gray-300">
          <SelectValue placeholder="Select Workspace" />
        </SelectTrigger>
        <SelectContent className="dark:bg-gray-800 dark:text-white dark:border-gray-700 min-w-[220px] max-h-64 overflow-y-auto">
          {workspaces.length === 0 ? (
            <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
              No workspaces found.
            </div>
          ) : (
            workspaces.map((workspace) => (
              <SelectItem
                key={workspace.id}
                className="dark:bg-gray-800 dark:text-white border-0 focus:bg-transparent"
                value={workspace.id}
              >
                <div className="flex items-center gap-2">
                  <span className="truncate">{workspace.name}</span>
                  {workspace.is_shared && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded">
                      Shared
                    </span>
                  )}
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      {canShare && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 sm:h-8 px-2"
          onClick={() => {
            setSelectedForShare(currentWorkspace);
            setShareDialogOpen(true);
          }}
          title="Share workspace"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      )}

      {canUnlink && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 sm:h-8 px-2"
          onClick={() => currentWorkspace && handleUnlink(currentWorkspace)}
          title="Unlink workspace"
        >
          <Unlink className="h-4 w-4" />
        </Button>
      )}

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share "{selectedForShare?.name}"</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter email address"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              type="email"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleShare} disabled={!shareEmail}>
              Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
