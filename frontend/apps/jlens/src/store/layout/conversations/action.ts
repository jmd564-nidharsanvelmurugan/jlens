import { axiosInstance } from "../../axios"

export interface SendMessageRequest {
  workspace_id: string
  conversation_id?: string
  content: string
  role: string
  model_type: string
  chat_type: string
  component_type?: string
  input_tokens: number
  output_tokens: number
  onTokenAccumulator?: (token: string) => void
  onCitationsReady?: (citations: any, messageId: string) => void // New callback for citations
}

export interface SendJLensMessageRequest {
  workspace_id: string
  conversation_id?: string
  content: string
  model_type: string
  files?: File[]
  onTokenAccumulator?: (token: string) => void
}

export const chatAPI = {
  sendMessage: async (
data: SendMessageRequest
): Promise<string> => {
  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
  
  const response = await fetch(`${BASE_URL}/messages/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.body) throw new Error("No response body");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let accumulated = "";
  let streamComplete = false;

  const onToken = data.onTokenAccumulator;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      streamComplete = true;
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    // SSE messages are separated by \n\n
    const parts = buffer.split("\n\n");
    buffer = parts.pop()!; // save incomplete part for next iteration

    for (const part of parts) {
      if (part.startsWith("data:")) {
        const jsonStr = part.replace(/^data:\s*/, "");
        if (jsonStr === "[DONE]") {
          streamComplete = true;
          continue;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          
          // Handle regular token streaming
          if (parsed.token && parsed.token !== "[DONE]") {
            const token = parsed.token;
            accumulated += token;
            if (onToken) onToken(token); // progressively update UI
          }
          
          // Handle citations ready message
          if (parsed.type === "citations_ready") {
            // Dispatch window event for citations
            window.dispatchEvent(new CustomEvent('citations-ready', {
              detail: { citations: parsed.citations, messageId: parsed.message_id }
            }));
            
            // Use callback instead of event
            if (data.onCitationsReady) {
              data.onCitationsReady(parsed.citations, parsed.message_id);
            }
          }
          
        } catch (err) {
          console.error("Error parsing SSE data:", err);
        }
      }
    }
  }

  // Stream is complete, return the accumulated text
  return accumulated;
},

  sendJLensMessage: async (data: SendJLensMessageRequest): Promise<string> => {
    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
    
    
    // Create FormData for file upload
    const formData = new FormData()
    formData.append('content', data.content)
    formData.append('workspace_id', data.workspace_id)
    formData.append('model_type', data.model_type)
    formData.append('chat_type', 'standalone')
    
    if (data.conversation_id) {
      formData.append('conversation_id', data.conversation_id)
    }
    
    // Add files if present
    if (data.files) {
      data.files.forEach((file) => {
        formData.append('files', file)
      })
    }
    
    const response = await fetch(`${BASE_URL}/messages/with-files`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.body) throw new Error("No response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let accumulated = "";

    const onToken = data.onTokenAccumulator;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop()!;

      for (const part of parts) {
        if (part.startsWith("data:")) {
          const jsonStr = part.replace(/^data:\s*/, "");
          if (jsonStr === "[DONE]") continue;

          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.token && parsed.token !== "[DONE]") {
              const token = parsed.token;
              accumulated += token;
              if (onToken) onToken(token);
            }
          } catch (err) {
            console.error("Error parsing SSE data:", err);
          }
        }
      }
    }

    return accumulated;
  },
  streamMessage: async (conversation_id: string) => {
    const response = await fetch(`/messages/stream/${conversation_id}/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
    });

    if (!response.ok) throw new Error("Streaming failed");

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    return { reader, decoder };
  },
  deleteConversation: async (conversation_id: string) => {
    await axiosInstance.delete(`/conversations/${conversation_id}`);
    return conversation_id; 
  },

   createConversation: async (data: {
    title: string;
    workspace_id: string;
    component_type: string;
  }) => {
    const response = await axiosInstance.post("/conversations/", data);
    return response.data;
},
}
