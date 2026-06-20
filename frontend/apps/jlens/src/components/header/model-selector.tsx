import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/components/ui/select"
import { useModelChatContext } from "../../context/ModelContext"
import { Loading } from "../common/loading"

export function ModelSelector() {
  const { allowedModels, selectedModel, setSelectedModel, loading } = useModelChatContext()

  const selected = allowedModels.find((m: any) => m.id === selectedModel)

  if (loading) {
    return (
      <div className="flex items-center p-2">
        <Loading size="sm" text="" />
      </div>
    )
  }

  if (!allowedModels.length) {
    return <div className="p-2 text-sm">No models available</div>
  }


  return (
    <div data-tour="model-selector">
      <Select value={selectedModel} onValueChange={setSelectedModel}>
      <SelectTrigger className="w-44 sm:w-48 md:w-52 h-7 sm:h-8 border text-[#41368F] dark:text-white text-xs sm:text-sm bg-gray-100 dark:bg-gray-800 rounded-md">
        <div className="flex items-center gap-1 sm:gap-2 min-w-0 overflow-hidden">
          <img
            src={selected?.logo || "/logos/openai.svg"}
            alt={selected?.name}
            className="w-4 h-4 flex-shrink-0"
            onError={(e) => {
              e.currentTarget.src = "/logos/openai.svg"
            }}
          />
          <SelectValue placeholder="Model">
            <span className="truncate block">{selected?.name || selectedModel}</span>
          </SelectValue>
        </div>
      </SelectTrigger>

      <SelectContent className="dark:bg-gray-800 dark:text-white min-w-[280px] max-w-[350px] max-h-[480px] overflow-y-auto">
        {allowedModels.map((model) => (
          <SelectItem key={model.id} value={model.id} className="min-h-[52px] cursor-pointer">
            <div className="flex items-center gap-2 w-full">
              <img
                src={model.logo || "/logos/openai.svg"}
                alt={model.name}
                className="w-5 h-5 flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.src = "/logos/openai.svg"
                }}
              />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-medium truncate">{model.name}</span>
                {model.description && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {model.description}
                  </span>
                )}
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>

    </Select>
    </div>
  )
}