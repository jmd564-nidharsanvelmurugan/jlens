import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@ui/components/ui/select"
import { useWorkspaceContext } from "../../context/WorkspaceContext"

export function WorkspaceSelector() {
  const {
    workspaces = [],
    selectedWorkspace,
    setSelectedWorkspace,
    isLoading,
  } = useWorkspaceContext()

  const selectedId = selectedWorkspace?.id ?? ""

  const handleSelect = (id: string) => {
    const found = workspaces?.find((w) => w.id === id)
    if (found) {
      setSelectedWorkspace(found)
    }
  }

  return (
    <Select
      value={selectedId}
      onValueChange={handleSelect}
      disabled={isLoading}
    >
      <SelectTrigger className="w-40 h-8 border border-gray-300 text-[#41368F] dark:border-white dark:text-white rounded-md text-sm bg-gray-100 hover:shadow-md focus:outline-none focus:ring-0">
        <SelectValue placeholder="Select Workspace" />
      </SelectTrigger>

      <SelectContent className="dark:bg-gray-800 dark:text-white dark:border-gray-700 min-w-[200px] max-h-64 overflow-y-auto">
        <SelectGroup>
          <SelectLabel className="px-3 py-1 text-xs text-gray-500 uppercase dark:text-gray-400">
            Workspaces
          </SelectLabel>
          {(workspaces?.length ?? 0) === 0 ? (
            <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
              No workspaces
            </div>
          ) : (
            workspaces
              .filter(ws => ws.name.toLowerCase() !== 'ai proposal')
              .map((workspace) => (
                <SelectItem
                  key={workspace.id}
                  value={workspace.id}
                  className="dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                >
                  <div className="truncate">{workspace.name}</div>
                </SelectItem>
              ))
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
