import { useMutation, useQuery } from '@tanstack/react-query'
import { chatApi } from '../actions'

export const useChat = {
  generate: () => useMutation({mutationFn:chatApi.generateResponse}),

  conversations: () =>
    useQuery({ 
      queryKey: ['proposalQuestions'], 
      queryFn: () => chatApi.listConversations,
      staleTime: 1000 * 60 * 5, // 5 minutes,
      refetchOnWindowFocus: false
    }),

}