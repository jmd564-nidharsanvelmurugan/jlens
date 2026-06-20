export type QuestionType = "TEXT" | "DROPDOWN" | "RADIO"

export interface Question {
  id: number
  text: string
  type: QuestionType
  options?: string[]
  required: boolean
  category?: string
}

export interface Answer {
  questionId: number
  value: string | string[]
  edit?: boolean
}

export type ProposalQuestion = {
  id: number;
  question: string;
  type: string;
  options?: string[] | null;
  category: string;
};

export type MessageCreate = {
  conversation_id: string;
  workspace_id: string,
  content: string,
  role: string,
  component_type: string
}


export type GenerateProposalResponse = {
  msg_id: string;
  proposal: {
    prompt: string;
    response?: string;
    error?: string;
  }[],
  citations: {
    citations?: {
        filepath: string,
        url: string,
        content?: string
    }[]
  }
}

export type EditAnswersRequest = {
    conversation_id: string;
    to_edit: {
        qid: string;
        content: string;
    }[]
}

export type FollowUpMessage = {
    id: string;
    content: string;
    created_at: string;
    role: string;
}

export type UpdateProposalVars = {
  conversationId: string;
  msgId: string;
  content: string;
}

export type AiProposalContextType = {
  followUpMessages: any[]; 
  isGenerating: boolean; 
  setIsEditorPanelOpen: React.Dispatch<React.SetStateAction<boolean>>
}