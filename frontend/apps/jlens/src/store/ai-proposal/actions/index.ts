import { axiosInstance } from '../../axios'
import type { ProposalQuestion, GenerateProposalResponse, EditAnswersRequest } from '@/pages/features/ai-proposal/types';
// import type { MessageCreate } from '@/pages/features/ai-proposal/chat-area/types'

export const aiProposalApi = {
  fetchProposalQuestions: async (): Promise<ProposalQuestion[]> => {
    const response = await axiosInstance.get("/proposal/get-questions");
    return response.data;
  },
  generateProposal: async (conversation_id: string, user_prompt: string) => {
    const response = await axiosInstance.post<GenerateProposalResponse>(
      "/proposal/generate-proposal",
      { conversation_id, user_prompt }
    );
    return response.data;
  },
  editAnswers: async (editPayload: EditAnswersRequest) => {
    const res = await axiosInstance.put("/proposal/edit-answers", editPayload);
    return res.data;
  },
  downloadProposal: async (conversationId: string) => {
    try {
      const response = await axiosInstance.get("/proposal/proposal-docx", {
        params: { conversation_id: conversationId },
        responseType: "blob", 
      });

      // Create a Blob from the response
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      // Create a temporary URL and link for download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "generated_proposal.docx"); 
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw error;
    }
  },
  editProposalLLM: async (
    conversationId: string,
    message: string,
    messageId: string
  ) => {
    const response = await axiosInstance.post("/proposal/edit-proposal-llm", {
      conversation_id: conversationId,
      user_message: message,
      message_id: messageId,
    });
    const data = response.data as { edited_proposal: string };
    return data.edited_proposal;
  },

  handleFollowUpSend: async (conversationId: string, message: string) => {
    const response = await axiosInstance.get("/proposal/follow-up-proposal", {
      params: { conversation_id: conversationId, message },
    });
    // response.data: { assistant: string, tool: string }
    return {
      msgId: response.data.msg_id,
      assistant: response.data.assistant,
      tool: response.data.tool,
    };
  },
  updateProposal: async (conversationId: string, msgId: string, content: string) => {
    const response = await axiosInstance.put("/proposal/update", {
      conversation_id: conversationId,
      msg_id: msgId,
      content,
    });
    return response.data;
  },
  uploadFiles: async (conversationId: string, files: FileList) => {
    const formData = new FormData();
    formData.append("conversation_id", conversationId);
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    const response = await axiosInstance.post("/proposal/upload-files", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  // Download the sales call questions DOCX file
  downloadSalesCallQuestionsDocx: async () => {
    try {
      const response = await axiosInstance.get("/proposal/read-sales-call-questions-docx", {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "sales_call_questions.docx");
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download sales call questions DOCX:", error);
      throw error;
    }
  },

  // Upload answered sales call questions DOCX file
  uploadSalesCallQAs: async (conversationId: string, file: File) => {
    const formData = new FormData();
    formData.append("conversation_id", conversationId);
    formData.append("file", file);

    const response = await axiosInstance.post("/proposal/upload-sales-call-qas", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
