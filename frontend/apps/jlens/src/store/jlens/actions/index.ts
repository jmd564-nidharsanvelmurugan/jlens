import { axiosInstance } from '../../axios'

export const chatApi = {
  generateResponse: async (payload: { prompt: string }) => {
    return axiosInstance.post('/chat/generate', payload)
  },
  listConversations: async () => {
    return axiosInstance.get('/chat/conversations')
  },
  deleteConversation: async (id: string) => {
    return axiosInstance.delete(`/chat/conversations/${id}`)
  },
}