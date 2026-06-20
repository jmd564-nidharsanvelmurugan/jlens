import {  useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { aiProposalApi } from '../actions'
import type { ProposalQuestion } from '@/pages/features/ai-proposal/types';
import type { UpdateProposalVars } from '@/pages/features/ai-proposal/types';

export const useProposalQuestions = () => {
  return useQuery<ProposalQuestion[]>({
    queryKey: ["proposal-questions"],
    queryFn: aiProposalApi.fetchProposalQuestions,
  });
};


export const useUpdateProposal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, msgId, content }: UpdateProposalVars) =>
      aiProposalApi.updateProposal(conversationId, msgId, content),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["conversationMessages", variables.conversationId],
      });
    },

    onError: (error, variables) => {
    },
  });
};

