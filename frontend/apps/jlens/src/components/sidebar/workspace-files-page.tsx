
import type React from "react"

import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Loading } from "../common/loading"
import {
  Files,
  ArrowLeft,
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  FileText,
  ImageIcon,
  Video,
  Music,
  Archive,
  Code,
} from "lucide-react"
import { Input } from "@ui/components/ui/input"
import { AtomicButton } from "@ui/components/atomic/atoms/button/button"
import { useWorkspaceFilesList } from "../../store/layout/workspace/hooks"
import { useWorkspaceContext } from "../../context/WorkspaceContext"

interface FileItem {
  id?: string
  name?: string
  size?: number
  lastModified?: number
  type?: string
  // SharePoint specific fields
  sharepoint_name?: string
  sharepoint_link?: string
  last_modified_by_email?: string
  last_modified_by_name?: string
  last_modified_datetime?: string
}

interface WorkspaceFilesPageProps {
  workspaceName?: string
  workspaceId?: string
  isEmbedded?: boolean
}

export function WorkspaceFilesPage({ workspaceName, workspaceId, isEmbedded = false }: WorkspaceFilesPageProps) {
  const { workspaceId: urlWorkspaceId } = useParams()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  
  const { selectedWorkspace } = useWorkspaceContext()

  const currentWorkspaceId = workspaceId || urlWorkspaceId || ""
  const currentWorkspaceName = workspaceName || selectedWorkspace?.name || ""
  const { data: filesList, isLoading: filesLoading } = useWorkspaceFilesList(currentWorkspaceId, true, currentWorkspaceName)

  const displayName = workspaceName || selectedWorkspace?.name || "Workspace Files"

  const getFileIcon = (fileName: string) => {
    const extension = fileName?.split(".").pop()?.toLowerCase()

    switch (extension) {
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "svg":
        return <ImageIcon className="w-5 h-5 text-blue-400" />
      case "mp4":
      case "avi":
      case "mov":
        return <Video className="w-5 h-5 text-purple-400" />
      case "mp3":
      case "wav":
      case "flac":
        return <Music className="w-5 h-5 text-green-400" />
      case "zip":
      case "rar":
      case "7z":
        return <Archive className="w-5 h-5 text-orange-400" />
      case "js":
      case "ts":
      case "tsx":
      case "jsx":
      case "py":
      case "java":
        return <Code className="w-5 h-5 text-indigo-400" />
      default:
        return <FileText className="w-5 h-5 text-gray-400" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const filesArray = Array.isArray(filesList) ? filesList : (filesList as any)?.files || []
  const filteredFiles = filesArray
    .filter((file: FileItem) => file.name?.toLowerCase().includes(searchQuery.toLowerCase()))

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles((prev) => (prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]))
  }

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-16">
      <Loading size="sm" text="" />
    </div>
  )

  const FileGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6 rounded-2xl backdrop-blur-md bg-gradient-to-br from-white/40 via-white/30 to-blue-50/30 dark:from-gray-900/40 dark:via-gray-900/30 dark:to-blue-900/30 border border-white/30 dark:border-gray-700/30 shadow-xl">
      {filteredFiles.map((file: FileItem, index: number) => {
        const fileId = file.id || index.toString()
        const fileName = file.name || `File ${index + 1}`
        const isSelected = selectedFiles.includes(fileId)

        return (
          <div
            key={fileId}
            className={`group relative p-4 rounded-xl border transition-all duration-300 cursor-pointer backdrop-blur-sm transform hover:scale-105 ${
              isSelected
                ? "bg-gradient-to-br from-blue-50/90 to-indigo-50/90 dark:from-blue-900/40 dark:to-indigo-900/40 border-blue-300/60 dark:border-blue-600/60 shadow-lg"
                : "bg-gradient-to-br from-white/70 to-white/50 dark:from-gray-900/70 dark:to-gray-800/70 border-white/40 dark:border-gray-700/40 hover:bg-gradient-to-br hover:from-white/90 hover:to-blue-50/60 dark:hover:from-gray-800/80 dark:hover:to-gray-700/80 hover:border-blue-200/50 dark:hover:border-blue-700/50 shadow-md hover:shadow-xl"
            }`}
            onClick={() => {
              if (file.sharepoint_link) {
                // Call API to handle file access
                fetch(`/api/workspaces/${currentWorkspaceId}/files/${fileId}/view/`, {
                  method: 'GET',
                  credentials: 'include',
                    headers: {
                    
                  }
                }).then(response => {
                  if (response.ok) {
                    window.open(file.sharepoint_link, '_blank')
                  }
                }).catch(console.error)
              } else {
                toggleFileSelection(fileId)
              }
            }}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-3 rounded-lg bg-gradient-to-br from-white/60 to-white/40 dark:from-gray-800/60 dark:to-gray-700/60 border border-white/50 dark:border-gray-600/50 shadow-lg">
                {getFileIcon(fileName)}
              </div>

              <div className="w-full">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm mb-1" title={fileName}>
                  {fileName}
                </h3>
                <div className="space-y-1">
                  {file.size && <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>}
                  {file.lastModified && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(file.lastModified).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <AtomicButton
                variant="ghost"
                size="icon"
                icon={<Eye className="w-3 h-3" />}
                className="h-6 w-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/50 shadow-sm"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation()
                }}
              />
              <AtomicButton
                variant="ghost"
                size="icon"
                icon={<Download className="w-3 h-3" />}
                className="h-6 w-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/50 shadow-sm"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation()
                }}
              />
            </div>

            {isSelected && (
              <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )

  const FileList = () => (
    <div className="space-y-3 p-6 rounded-2xl backdrop-blur-md bg-gradient-to-br from-white/40 via-white/30 to-blue-50/30 dark:from-gray-900/40 dark:via-gray-900/30 dark:to-blue-900/30 border border-white/30 dark:border-gray-700/30 shadow-xl">
      {filteredFiles.map((file: FileItem, index: number) => {
        const fileId = file.id || index.toString()
        const fileName = file.name || `File ${index + 1}`
        const isSelected = selectedFiles.includes(fileId)

        return (
          <div
            key={fileId}
            className={`group flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer backdrop-blur-sm ${
              isSelected
                ? "bg-gradient-to-r from-blue-50/90 to-indigo-50/90 dark:from-blue-900/40 dark:to-indigo-900/40 border-blue-300/60 dark:border-blue-600/60 shadow-lg"
                : "bg-gradient-to-br from-white/70 to-white/50 dark:from-gray-900/70 dark:to-gray-800/70 border-white/40 dark:border-gray-700/40 hover:bg-gradient-to-r hover:from-white/90 hover:to-blue-50/60 dark:hover:from-gray-800/80 dark:hover:to-gray-700/80 hover:border-blue-200/50 dark:hover:border-blue-700/50 shadow-md hover:shadow-lg"
            }`}
            onClick={() => {
              if (file.sharepoint_link) {
                // Call API to handle file access
                fetch(`/api/workspaces/${currentWorkspaceId}/files/${fileId}/view/`, {
                  method: 'GET',
                  credentials: 'include',
                    headers: {
                    
                  }
                }).then(response => {
                  if (response.ok) {
                    window.open(file.sharepoint_link, '_blank')
                  }
                }).catch(console.error)
              } else {
                toggleFileSelection(fileId)
              }
            }}
          >
            <div className="flex-shrink-0 p-2 rounded-lg bg-gradient-to-br from-white/60 to-white/40 dark:from-gray-800/60 dark:to-gray-700/60 border border-white/50 dark:border-gray-600/50 shadow-sm">
              {getFileIcon(fileName)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {file.sharepoint_name || fileName}
                </h3>
                {file.size && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0 px-2 py-1 rounded-full bg-white/50 dark:bg-gray-800/50 border border-white/40 dark:border-gray-600/40">
                    {formatFileSize(file.size)}
                  </span>
                )}
              </div>
              {(file.last_modified_by_name || file.last_modified_by_email || file.last_modified_datetime) && (
                <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                  {(file.last_modified_by_name || file.last_modified_by_email) && (
                    <p>Modified by {file.last_modified_by_name || file.last_modified_by_email}</p>
                  )}
                  {file.last_modified_datetime && (
                    <p>
                      {new Date(file.last_modified_datetime).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
              )}
              {!file.last_modified_by_name && !file.last_modified_by_email && !file.last_modified_datetime && file.lastModified && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Modified{" "}
                  {new Date(file.lastModified).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <AtomicButton
                variant="ghost"
                size="icon"
                icon={<Eye className="w-4 h-4" />}
                className="h-8 w-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/50 shadow-sm"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation()
                  if (file.sharepoint_link) {
                    // Call API to handle file access
                    fetch(`/api/workspaces/${currentWorkspaceId}/files/${fileId}/view/`, {
                      method: 'GET',
                      credentials: 'include',
                    headers: {
                        
                      }
                    }).then(response => {
                      if (response.ok) {
                        window.open(file.sharepoint_link, '_blank')
                      }
                    }).catch(console.error)
                  }
                }}
              />
              <AtomicButton
                variant="ghost"
                size="icon"
                icon={<Download className="w-4 h-4" />}
                className="h-8 w-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/50 shadow-sm"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation()
                }}
              />
              <AtomicButton
                variant="ghost"
                size="icon"
                icon={<Trash2 className="w-4 h-4 text-red-500" />}
                className="h-8 w-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/50 shadow-sm hover:bg-red-50"
                onClick={async (e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation()
                  if (confirm(`Delete "${fileName}"?`)) {
                    try {
                      await fetch(`${import.meta.env.VITE_API_URL}/workspaces/${currentWorkspaceId}/files/${fileId}/`, {
                        method: 'DELETE',
                        credentials: 'include',
                      })
                      window.location.reload()
                    } catch (err) {
                      alert('Failed to delete file')
                    }
                  }
                }}
              />
            </div>

            {isSelected && (
              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )

  const content = (
    <>
      {!isEmbedded && (
        <div className="sticky top-0 z-10 backdrop-blur-xl bg-gradient-to-r from-white/90 via-white/80 to-blue-50/80 dark:from-gray-900/90 dark:via-gray-900/80 dark:to-blue-900/80 border-b border-white/30 dark:border-gray-700/30 shadow-lg">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center gap-6">
                <AtomicButton
                  variant="ghost"
                  size="icon"
                  icon={<ArrowLeft className="w-5 h-5" />}
                  onClick={() => navigate(-1)}
                  className="hover:bg-white/30 dark:hover:bg-gray-800/50 backdrop-blur-sm border border-white/40 dark:border-gray-600/40 shadow-sm"
                />
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600/90 to-indigo-600/90 backdrop-blur-sm border border-blue-500/30 shadow-lg">
                    <Files className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{displayName}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {filteredFiles.length} {filteredFiles.length === 1 ? "file" : "files"}
                    </p>
                  </div>
                </div>
              </div>

              {selectedFiles.length > 0 && (
                <div className="flex items-center gap-3 px-6 py-3 rounded-xl backdrop-blur-md bg-gradient-to-r from-blue-50/90 to-indigo-50/90 dark:from-blue-900/40 dark:to-indigo-900/40 border border-blue-200/60 dark:border-blue-700/60 shadow-lg">
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    {selectedFiles.length} selected
                  </span>
                  <AtomicButton
                    variant="outline"
                    size="sm"
                    icon={<Download className="w-4 h-4" />}
                    text="Download"
                    className="text-blue-600 border-blue-300/60 backdrop-blur-sm bg-white/60 hover:bg-white/80 shadow-sm"
                  />
                  <AtomicButton
                    variant="outline"
                    size="sm"
                    icon={<Trash2 className="w-4 h-4" />}
                    text="Delete"
                    className="text-red-600 border-red-300/60 backdrop-blur-sm bg-white/60 hover:bg-white/80 shadow-sm"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className={isEmbedded ? "p-6" : "max-w-7xl mx-auto px-6 lg:px-8 py-8"}>
        <div className="flex items-center justify-between gap-6 mb-8 p-6 rounded-2xl backdrop-blur-md bg-gradient-to-r from-white/60 via-white/50 to-blue-50/50 dark:from-gray-900/60 dark:via-gray-900/50 dark:to-blue-900/50 border border-white/30 dark:border-gray-700/30 shadow-xl">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/40 dark:border-gray-600/50 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 shadow-sm rounded-xl"
            />
          </div>
          <div className="flex items-center gap-3">
            <AtomicButton
              variant="outline"
              icon={<Filter className="w-4 h-4" />}
              text="Filter"
              className="h-12 px-6 backdrop-blur-sm bg-white/60 border-white/40 dark:border-gray-600/50 shadow-sm rounded-xl"
            />
            <div className="flex rounded-xl overflow-hidden border border-white/40 dark:border-gray-600/50 backdrop-blur-sm bg-white/40 dark:bg-gray-800/40 shadow-sm">
              <AtomicButton
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                icon={<FileText className="w-4 h-4" />}
                onClick={() => setViewMode("list")}
                className="h-12 w-12 rounded-none border-r border-white/40 dark:border-gray-600/50"
              />
              <AtomicButton
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                icon={<ImageIcon className="w-4 h-4" />}
                onClick={() => setViewMode("grid")}
                className="h-12 w-12 rounded-none"
              />
            </div>
          </div>
        </div>

        {filesLoading ? (
          <LoadingSpinner />
        ) : filteredFiles.length > 0 ? (
          viewMode === "grid" ? (
            <FileGrid />
          ) : (
            <FileList />
          )
        ) : (
          <div className="text-center py-20 backdrop-blur-md bg-gradient-to-br from-white/40 via-white/30 to-blue-50/30 dark:from-gray-900/40 dark:via-gray-900/30 dark:to-blue-900/30 rounded-2xl border border-white/30 dark:border-gray-700/30 shadow-xl">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50/90 to-white/90 dark:from-gray-800/90 dark:to-gray-700/90 backdrop-blur-sm inline-block mb-6 border border-white/40 dark:border-gray-600/40 shadow-lg">
              <Files className="w-16 h-16 text-gray-400 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">No files found</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
              {searchQuery
                ? "Try adjusting your search terms to find what you're looking for"
                : "This workspace doesn't have any files yet. Upload some files to get started"}
            </p>
          </div>
        )}
      </div>
    </>
  )

  return isEmbedded ? (
    content
  ) : (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-white/80 to-indigo-100/60 dark:from-gray-900/60 dark:via-gray-900/80 dark:to-blue-900/60 backdrop-blur-3xl">
      {content}
    </div>
  )
}
