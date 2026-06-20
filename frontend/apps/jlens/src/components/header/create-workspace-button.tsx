import { useState } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { AtomicButton } from "@ui/components/atomic/atoms/button/button"
import { useCreateWorkspace } from "../../store/layout/workspace/hooks"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@ui/components/ui/dialog"
import { Input } from "@ui/components/ui/input"
import { Label } from "@ui/components/ui/label"
import { useLocation } from "react-router-dom"

type Workspace = { id: string; name: string }

interface CreateWorkspaceButtonProps {
  onWorkspaceSelect?: (workspace: Workspace) => void
  variant?: 'header' | 'sidebar'
}

export function CreateWorkspaceButton({ onWorkspaceSelect, variant = 'header' }: CreateWorkspaceButtonProps) {
  const location = useLocation()
  const pathSegments = location.pathname.split("/").filter(Boolean)
  const feature = pathSegments[1] || ""

  const { mutateAsync } = useCreateWorkspace()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [preprompt, setPreprompt] = useState("You are an AI assistant that helps people find information.")
  const [isPrivate, setIsPrivate] = useState(true)

  const handleCreate = async () => {
    if (!name.trim()) return
    if (name.trim().toLowerCase() === "ai proposal")
      return toast.error('Workspace "ai proposal" is reserved. Please choose a different name.') 
    setLoading(true)
    try {
      const res = await mutateAsync({ name, description, preprompt, is_private: isPrivate })
      if (onWorkspaceSelect && res?.id && res?.name) {
        onWorkspaceSelect({ id: res.id, name: res.name })
      }
      toast.success("Workspace created")
      setOpen(false)
      setName("")
      setDescription("")
      setPreprompt("")
      setIsPrivate(true)
    } catch (error) {
      toast.error("Failed to create workspace. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {feature !== "ai-proposal" && (
          <div className="relative overflow-hidden">
            {variant === 'sidebar' ? (
              <button
                disabled={loading}
                onClick={() => setOpen(true)}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-[#A16BDB] text-[#A16BDB] hover:text-white rounded-md transition-colors font-medium"
                title="Create Workspace"
              >
                <Plus className="w-3 h-3" />
                <span>Create</span>
              </button>
            ) : (
              <AtomicButton
                disabled={loading}
                variant="outline"
                size="sm"
                text="Create Workspace"
                icon={
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ml-1 sm:ml-2 text-white dark:text-white" />
                }
                iconPosition="left"
                iconWrapperClass="bg-transparent p-0 border-none"
                textWrapperClass="whitespace-nowrap overflow-hidden font-normal text-white text-sm dark:text-white sm:text-sm"
                className="text-white bg-[#41368F] hover:bg-primary dark:border-white dark:text-white rounded-md transition-all duration-200 gap-0 p-0"
              />
            )}
          </div>
        )}
      </DialogTrigger>

      <DialogContent className="dark:bg-gray-900 dark:text-white">
        <DialogHeader>
          <DialogTitle>Create New Workspace</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="workspace-name">Name</Label>
            <Input
              id="workspace-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Marketing Team"
              className="mt-1 border border-gray-300 dark:border-gray-600 "
            />
          </div>

          <div>
            <Label htmlFor="workspace-description">Description</Label>
            <Input
              id="workspace-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
              className="mt-1 border border-gray-300 dark:border-gray-600 "
            />
          </div>
          <div>
            <Label htmlFor="workspace-preprompt">Pre-Prompt</Label>
            <Input
              id="workspace-preprompt"
              value={preprompt}
              onChange={(e) => setPreprompt(e.target.value)}
              placeholder="Optional"
              className="mt-1 border border-gray-300 dark:border-gray-600 "
            />
          </div>
        </div>

        <DialogFooter>
          <AtomicButton
            onClick={handleCreate}
            disabled={loading || !name.trim()}
            text={loading ? "Creating..." : "Create"}
            className="w-full sm:w-auto text-white hover:bg-primary-foreground" 
            textWrapperClass="bg-transparent"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}