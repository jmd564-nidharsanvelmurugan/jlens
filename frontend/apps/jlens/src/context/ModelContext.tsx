import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { useUserContext } from "./UserContext"
import { useWorkspaceContext } from "./WorkspaceContext"
import { Zap, FileText, Layers } from "lucide-react"

const GPT_LOGO = "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg"

export interface Model {
  id: string
  name: string
  logo: string
  source?: string
  model?: string
  status?: string
  description?: string
}

// Function to get logo for each model
function getModelLogo(modelId: string): string {
  if (modelId.includes('gpt-5')) return '/logos/openai.svg'
  if (modelId.includes('gpt-4')) return '/logos/openai.svg'
  if (modelId.includes('DeepSeek')) return '/logos/deepseek.svg'
  if (modelId.includes('llama') || modelId.includes('Llama')) return '/logos/llama.svg'
  if (modelId.includes('grok')) return '/logos/grok.svg'
  if (modelId.includes('mistral')) return '/logos/mistral.svg'
  if (modelId.includes('claude')) return '/logos/claude.svg'
  if (modelId.includes('model-router')) return '/logos/openai.svg'
  return '/logos/openai.svg' // fallback
}

// Function to replace [MODEL:] markers with logo images in message content
export function replaceModelMarkersWithLogos(content: string): string {
  return content.replace(/\[MODEL:([^\]]+)\]/g, (_, modelName) => {
    const logoPath = getModelLogo(modelName)
    return `<img src="${logoPath}" alt="${modelName}" style="width: 16px; height: 16px; display: inline-block; margin-left: 4px; vertical-align: middle;" /> ${modelName}`
  })
}

export const chatTypes = [
  {
    id: "standalone",
    name: "General",
    icon: Zap,
    description: "Independent chat session",
  },
  {
    id: "document",
    name: "Document",
    icon: FileText,
    description: "Chat with document context",
  },
  {
    id: "hybrid",
    name: "Hybrid",
    icon: Layers,
    description: "Combined approach",
  },
]

interface ModelChatContextType {
  availableModels: Model[]
  allowedModels: Model[]
  selectedModel: string
  setSelectedModel: (modelName: string) => void
  selectedChatType: string
  setSelectedChatType: (type: string) => void
  loading: boolean
}

const ModelChatContext = createContext<ModelChatContextType | undefined>(undefined)

export const ModelChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { access } = useUserContext()
  const { selectedWorkspace } = useWorkspaceContext()
  const [availableModels, setAvailableModels] = useState<Model[]>([])
  const [allowedModels, setAllowedModels] = useState<Model[]>([])
  const [selectedModel, setSelectedModel] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedChatType, setSelectedChatType] = useState(
    () => sessionStorage.getItem("chatType") || "standalone"
  )

  // Set default chat type based on workspace
  useEffect(() => {
    if (selectedWorkspace) {
      let defaultChatType = "document" // Default for most workspaces
      
      // JLens and Marketplace use standalone
      if (selectedWorkspace.name === "JLens" || selectedWorkspace.name === "Marketplace") {
        defaultChatType = "standalone"
      }
      // User and shared workspaces use document
      else if (!selectedWorkspace.is_system_workspace) {
        defaultChatType = "document"
      }
      // System workspaces: Jman Sales and AI Proposal use document
      else if (selectedWorkspace.name === "Jman Sales" || selectedWorkspace.name === "AI Proposal") {
        defaultChatType = "document"
      }
      
      setSelectedChatType(defaultChatType)
    }
  }, [selectedWorkspace])

  // Fetch available models from API (only once)
  const modelsFetched = React.useRef(false);
  useEffect(() => {
    if (modelsFetched.current) return;
    const fetchModels = async () => {
      
      try {
        setLoading(true)
        
        // Check authentication via email (token is in HTTP-only cookie)
        const email = sessionStorage.getItem('email')
        
        if (!email) {
          setLoading(false)
          return;
        }
        
        // Fetch models from models-workspaces API (cookie sent automatically)
        const response = await fetch(`${import.meta.env.VITE_API_URL}/user-access/models-workspaces`, {
          credentials: 'include'  // Send cookies
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch models');
        }
        
        const data = await response.json();
        const models = data.models;
        
        if (!Array.isArray(models)) {
          throw new Error('Invalid API response format');
        }
        
        // Transform API response to Model interface
        const transformedModels: Model[] = models.map((model: any) => {
          return {
            id: model.id,
            name: model.name,
            model: model.model,
            status: model.status,
            description: model.description,
            logo: getModelLogo(model.id),
            source: getModelSource(model.id)
          };
        })
        
        setAvailableModels(transformedModels)
        modelsFetched.current = true;
        
      } catch (error) {
        
        // Fallback to default models
        const fallbackModels = [
          { 
            id: "gpt-4.1-mini", 
            name: "GPT-4.1 Mini", 
            logo: GPT_LOGO, 
            source: "openai", 
            description: "Fast and efficient model" 
          }
        ]
        setAvailableModels(fallbackModels)
      } finally {
        setLoading(false)
      }
    }

    fetchModels()
  }, [])

  // Filter models based on user access
  useEffect(() => {
    
    const modelAccess: string[] = access?.models ?? []

    // Always filter based on user access - no fallback to all models
    const filtered = availableModels.filter((model) => {
      const hasAccess = modelAccess.includes(model.id) || modelAccess.includes(model.name);
      return hasAccess;
    })
    setAllowedModels(filtered)

    // Set default selected model from allowed models
    if (filtered.length > 0 && !filtered.some((m) => m.id === selectedModel)) {
      const defaultModel = filtered[0]?.id ?? ""
      setSelectedModel(defaultModel)
    } else if (filtered.length === 0) {
      setSelectedModel("")
    }
  }, [access, availableModels])

  useEffect(() => {
    sessionStorage.setItem("chatType", selectedChatType)
  }, [selectedChatType])

  const value = useMemo(() => ({
    availableModels,
    allowedModels,
    selectedModel,
    setSelectedModel,
    selectedChatType,
    setSelectedChatType,
    loading,
  }), [availableModels, allowedModels, selectedModel, selectedChatType, loading])

  return (
    <ModelChatContext.Provider value={value}>
      {children}
    </ModelChatContext.Provider>
  )
}

export const useModelChatContext = () => {
  const ctx = useContext(ModelChatContext)
  if (!ctx) throw new Error("useModelChatContext must be used within a ModelChatProvider")
  return ctx
}

// Helper function to determine model source
function getModelSource(modelId: string): string {
  if (modelId.includes('gpt')) return 'openai'
  if (modelId.includes('DeepSeek')) return 'deepseek'
  if (modelId.includes('mistral')) return 'mistral'
  if (modelId.includes('llama') || modelId.includes('Llama')) return 'meta'
  if (modelId.includes('grok')) return 'x'
  if (modelId.includes('model-router')) return 'azure'
  return 'azure'
}

// Helper function to map UI chat type to API chat type
export function mapChatTypeForAPI(uiChatType: string): string {
  if (uiChatType === "general") return "standalone"
  return uiChatType
}
