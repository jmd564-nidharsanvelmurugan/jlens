import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { useWorkspaces, useSharedWorkspaces } from '../store/layout/workspace/hooks';
import { useUserContext } from './UserContext';
import { useLocation } from 'react-router-dom';
import { useCreateWorkspace } from '../store/layout/workspace/hooks'; 
import { toast } from "sonner"

type Workspace = {
  id: string;
  name: string;
  description?: string;
  pre_prompt?: string;
  is_private?: boolean;
  is_system_workspace?: boolean;
  user_id?: string | null;
  owner_email?: string;
  [key: string]: any;
};

interface WorkspaceContextType {
  workspaces: Workspace[] | undefined;
  isLoading: boolean;
  selectedWorkspace: Workspace | null;
  setSelectedWorkspace: (workspace: Workspace | null) => void;
  sharedWorkspaces: Workspace[] | undefined;
  refetchWorkspaces: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: workspaces, isLoading, refetch } = useWorkspaces();
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);

  const { access } = useUserContext();

  const { data: sharedWorkspaces } = useSharedWorkspaces(access?.workspaces[0] || '');

  const { mutateAsync: createWorkspace } = useCreateWorkspace(); 
  const location = useLocation();
  const workspaceIdFromUrl = location.pathname.split('/')[3];

  useEffect(() => {
    if (isLoading) return;

    if (workspaces && workspaces.length > 0) {
      if (!selectedWorkspace && workspaceIdFromUrl) {
        const match = workspaces.find((w: Workspace) => w.id === workspaceIdFromUrl);
        if (match) {
          setSelectedWorkspace(match);
          return;
        }
      }

      if (!selectedWorkspace) {
        setSelectedWorkspace(workspaces[0]);
      }
    } else if (workspaces && workspaces.length === 0) {
      // Only create default workspace if user has no access to any workspaces
      // This should rarely happen now since new users get system workspace access
      const defaultPayload = {
        name: 'My Workspace',  // Changed from 'JLens' to avoid conflict with system JLens
        description: 'This is your default workspace',
        is_private: true,
      };

      createWorkspace(defaultPayload).then(async () => {
        const updated = await refetch();
        if (updated?.data && updated.data.length > 0) {
          setSelectedWorkspace(updated.data[0]);
          toast.success("Default Workspace created")
        }
      });
    }
  }, [selectedWorkspace, workspaces, workspaceIdFromUrl, isLoading, createWorkspace, refetch]);

  const value = useMemo(
    () => ({
      workspaces,
      isLoading,
      selectedWorkspace,
      setSelectedWorkspace,
      sharedWorkspaces,
      refetchWorkspaces: refetch,
    }),
    [workspaces, isLoading, selectedWorkspace, sharedWorkspaces, refetch]
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspaceContext = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspaceContext must be used within a WorkspaceProvider');
  }
  return context;
};
