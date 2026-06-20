
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getWorkspaces, createWorkspace, getSharedWorkspaces, deleteWorkspace, uploadWorkspaceFiles, updateWorkspace, workspaceFilesList, listJmanSalesFiles, getWorkspaceStorage, getFileIndexingStatus } from './action'
import type { WorkspacePayload } from './action'
import type { Conversation } from "../conversations/hooks";

export const useWorkspaces = () =>
  useQuery({
    queryKey: ['workspaces'],
    queryFn: getWorkspaces,
    staleTime: 60000, // 1 minute
  })

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: WorkspacePayload) => createWorkspace(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workspaces'] }),
  })
}

export const useSharedWorkspaces = (workspaceId: string) =>
  useQuery({
    queryKey: ['sharedWorkspaces', workspaceId],
    queryFn: () => getSharedWorkspaces(workspaceId),
    enabled: !!workspaceId,
  })


  export const useWorkspaceFilesList = (workspaceId: string, enabled: boolean, workspaceName?: string) =>
  useQuery({
    queryKey: ['workspaceFiles', workspaceId, workspaceName],
    queryFn: () => workspaceFilesList(workspaceId, workspaceName),
    enabled: !!workspaceId && enabled, // only fetch when open
    staleTime: 30000,
    refetchOnWindowFocus: false,
  })



export const useDeleteWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWorkspace,
    onSuccess: (deletedWorkspaceId: string) => {

      queryClient.setQueryData<Conversation[]>(["allConversations"], (old = []) =>
        old.filter((conv) => conv.workspace_id !== deletedWorkspaceId)
      );

      queryClient.removeQueries({ queryKey: ["conversations", deletedWorkspaceId] });

      queryClient.invalidateQueries({ queryKey: ["workspaces"] });

      
    },
    onError: () => {
    },
  });
};

export const useUploadWorkspaceFiles = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: uploadWorkspaceFiles,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaceFiles'] })
    },
  })
}

export const useUpdateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workspaceId,
      updatedData,
    }: {
      workspaceId: string;
      updatedData ?: string;
    }) => updateWorkspace(workspaceId, updatedData),

    onSuccess: ({ workspaceId, updatedData }) => {
      queryClient.setQueryData<any[]>(["workspaces"], (old = []) =>
        old.map((ws) =>
          ws.id === workspaceId ? { ...ws, updatedData } : ws
        )
      );

      queryClient.invalidateQueries({ queryKey: ["workspaces"] });

      
    },

    onError: () => {
    },
  });
};

export const useJmanSalesFiles = (enabled: boolean = true) =>
  useQuery({
    queryKey: ['jmanSalesFiles'],
    queryFn: listJmanSalesFiles,
    enabled: enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

export const useWorkspaceStorage = (workspaceId: string, enabled: boolean = true) =>
  useQuery({
    queryKey: ['workspaceStorage', workspaceId],
    queryFn: () => getWorkspaceStorage(workspaceId),
    enabled: !!workspaceId && enabled,
    staleTime: 30 * 1000,
  })

export const useFileIndexingStatus = (workspaceId: string, fileId: string, enabled: boolean = false) =>
  useQuery({
    queryKey: ['fileIndexingStatus', workspaceId, fileId],
    queryFn: () => getFileIndexingStatus(workspaceId, fileId),
    enabled: !!workspaceId && !!fileId && enabled,
    refetchInterval: (query) => {
      // Stop polling once indexed
      if (query.state.data?.status === 'indexed') return false
      return 4000 // poll every 4s
    },
    staleTime: 0,
  })
