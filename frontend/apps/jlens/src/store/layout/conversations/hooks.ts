import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatAPI } from "./action";
import { axiosInstance } from "../../axios";
import axios from "axios";
import { useState } from "react";

// Define interfaces locally to avoid import issues
export interface SendJLensMessageRequest {
  workspace_id: string
  conversation_id?: string
  content: string
  model_type: string
  files?: File[]
  onTokenAccumulator?: (token: string) => void
}


// Define the Conversation interface
export interface Conversation {
  id: string;
  title: string;
  workspace_id: string;
  component_type: string;
}

export const useConversations = (workspace_id: string) => {
  return useQuery<Conversation[]>({
    queryKey: ["conversations", workspace_id],
    queryFn: async () => {
      const res = await axios.get(`/messages/workspace/${workspace_id}`);
      return res.data;
    },
    enabled: !!workspace_id,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};

export const allConversationsQueryKey = ["allConversations"];

export const useAllConversations = () => {
  return useQuery<Conversation[]>({
    queryKey: allConversationsQueryKey,
    queryFn: async () => {
      const res = await axiosInstance.get("/conversations/");
      return res.data;
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatAPI.sendMessage, // now expects { ...SendMessageRequest, onTokenAccumulator? }
    onMutate: async (variables) => {
      // Optimistically update allConversations for new conversations
      if (variables.workspace_id && !variables.conversation_id) {
        const previousConversations: Conversation[] =
          queryClient.getQueryData<Conversation[]>(allConversationsQueryKey) || [];

        // Generate title from user's question (first 50 chars)
        const userQuestion = variables.content || '';
        const title = userQuestion.length > 50 
          ? userQuestion.substring(0, 50).trim() + '...' 
          : userQuestion.trim() || 'New Chat';
        
        const optimisticConversation: Conversation = {
          id: `temp-${Date.now()}`, // Temporary ID
          title: title, // Title based on user question
          workspace_id: variables.workspace_id,
          component_type: 'chat'
        };

        queryClient.setQueryData<Conversation[]>(allConversationsQueryKey, [
          ...previousConversations,
          optimisticConversation,
        ]);

        return { previousConversations }; // Store for rollback if needed
      }
    },
    onSuccess: () => {
      // Completely disabled to prevent any refresh
    },
    onError: (_, __, context) => {
      // Rollback optimistic update if the mutation fails
      if (context?.previousConversations) {
        queryClient.setQueryData<Conversation[]>(
          allConversationsQueryKey,
          context.previousConversations
        );
      }
    },
  });
};

export const useSendJLensMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatAPI.sendJLensMessage,
    onMutate: async (variables: SendJLensMessageRequest) => {
      // Optimistically update allConversations for new conversations
      if (variables.workspace_id && !variables.conversation_id) {
        const previousConversations: Conversation[] =
          queryClient.getQueryData<Conversation[]>(allConversationsQueryKey) || [];

        // Generate title from user's question (first 50 chars)
        const userQuestion = variables.content || '';
        const title = userQuestion.length > 50 
          ? userQuestion.substring(0, 50).trim() + '...' 
          : userQuestion.trim() || 'New Chat';
        
        const optimisticConversation: Conversation = {
          id: `temp-${Date.now()}`, // Temporary ID
          title: title, // Title based on user question
          workspace_id: variables.workspace_id,
          component_type: 'chat'
        };

        queryClient.setQueryData<Conversation[]>(allConversationsQueryKey, [
          ...previousConversations,
          optimisticConversation,
        ]);

        return { previousConversations }; // Store for rollback if needed
      }
    },
    onSuccess: () => {
      // Completely disabled to prevent any refresh
    },
    onError: (_, __, context) => {
      // Rollback optimistic update if the mutation fails
      if (context?.previousConversations) {
        queryClient.setQueryData<Conversation[]>(
          allConversationsQueryKey,
          context.previousConversations
        );
      }
    },
  });
};

export const useStreamMessage = () => {
  const [streamedText, setStreamedText] = useState<string>("");

  const streamMessage = async (conversation_id: string) => {
    const { reader, decoder } = await chatAPI.streamMessage(conversation_id);

    let fullText = "";
    if (!reader) {
      throw new Error("Stream reader is undefined.");
    }
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;
      setStreamedText(prev => prev + chunk);
    }

    return fullText;
  };

  return { streamMessage, streamedText };
};

export const useConversationMessages = (conversation_id: string, staleTime?: number) => {
  
  return useQuery({
    queryKey: ["conversationMessages", conversation_id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/conversations/${conversation_id}`);
      
      return res.data;
    },
    enabled: !!conversation_id,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  });
};

export const useSharedWorkspaceConversations = (workspace_id: string) => {
  return useQuery<Conversation[]>({
    queryKey: allConversationsQueryKey,
    queryFn: async () => {
      const res = await axiosInstance.get(`/conversations/workspaces/${workspace_id}`);
      return res.data;
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatAPI.deleteConversation,
    onMutate: async (conversationId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: allConversationsQueryKey });

      // Snapshot previous value for rollback
      const previous = queryClient.getQueryData<Conversation[]>(allConversationsQueryKey);

      // Optimistically remove from UI immediately
      queryClient.setQueryData<Conversation[]>(
        allConversationsQueryKey,
        (old = []) => old.filter((conv) => conv.id !== conversationId)
      );
      queryClient.removeQueries({
        queryKey: ["conversationMessages", conversationId],
      });

      return { previous };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["allConversations"] });
    },
    onError: (err, __, context) => {
      // Rollback on failure
      if (context?.previous) {
        queryClient.setQueryData(allConversationsQueryKey, context.previous);
      }
      // Show error to user
      const message = (err as any)?.response?.data?.detail || (err as any)?.message || "Unknown error";
      alert(`Could not delete conversation: ${message}`);
    },
  });
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();
 
  return useMutation({
    mutationFn: chatAPI.createConversation,
    onSuccess: (newConversation) => {
      queryClient.setQueryData<Conversation[]>(
        allConversationsQueryKey,
        (old = []) => [...old, newConversation]
      );
 
      queryClient.invalidateQueries({ queryKey: allConversationsQueryKey });
      queryClient.invalidateQueries({
        queryKey: ["conversations", newConversation.workspace_id],
      });
    },
    onError: () => {
    },
  });
};

export const useWorkspaceConversations = (workspaceId: string) => {
  return useQuery<Conversation[]>({
    queryKey: ["workspaceConversations", workspaceId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/conversations/workspaces/${workspaceId}`);
      return res.data;
    },
    enabled: !!workspaceId,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};