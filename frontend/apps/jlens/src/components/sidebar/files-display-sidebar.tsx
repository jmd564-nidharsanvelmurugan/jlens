import { Sheet, SheetContent, SheetTitle } from "@ui/components/ui/sheet";
import { Archive, Code, Files, FileText, ImageIcon, Loader2, Music, Video } from "lucide-react";
import { useState } from "react";
import { Loading } from "../common/loading";
import { useFileIndexingStatus } from "../../store/layout/workspace/hooks";
interface Workspace {
  id: string;
  name: string;
  isExpanded: boolean;
  pre_prompt?: string;
  chats: { name: string; id: string; component_type: string }[];
}
interface Folder {
  name: string
  isExpanded: boolean
  chats: { name: string; id: string; componentType: "chat" | "proposal" }[]
}
function FileIndexingBadge({ workspaceId, fileId }: { workspaceId: string; fileId: string }) {
  const { data } = useFileIndexingStatus(workspaceId, fileId, true);
  if (!data || data.status === "indexed") return null;
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
      <Loader2 className="w-2.5 h-2.5 animate-spin" />
      Indexing
    </span>
  );
}

export default function FilesDisplaySidebar({isOpen, setIsOpen, filesList, filesLoading, workspace}: {isOpen: boolean, setIsOpen: React.Dispatch<React.SetStateAction<boolean>>, filesList: any[], filesLoading: boolean, workspace: Workspace | Folder}){
    const [searchQuery, setSearchQuery] = useState("");
  const filteredFiles = Array.isArray(filesList)
    ? filesList.filter(
      (file) =>
        file.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false
    )
    : [];
  const getFileIcon = (fileName: string) => {
    const extension = fileName?.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "svg":
        return <ImageIcon className="w-4 h-4 text-blue-500" />;
      case "mp4":
      case "avi":
      case "mov":
        return <Video className="w-4 h-4 text-purple-500" />;
      case "mp3":
      case "wav":
      case "flac":
        return <Music className="w-4 h-4 text-green-500" />;
      case "zip":
      case "rar":
      case "7z":
        return <Archive className="w-4 h-4 text-orange-500" />;
      case "js":
      case "ts":
      case "tsx":
      case "jsx":
      case "py":
      case "java":
        return <Code className="w-4 h-4 text-indigo-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

return <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="right"
          className="w-[360px] sm:w-[420px] flex flex-col p-0 bg-gray-50 dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800"
        >
          <SheetTitle className="sr-only">Workspace Files</SheetTitle>
          <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#19105B] to-[#3d2f7a] flex items-center justify-center shadow-md">
                    <Files className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {workspace.name}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {filteredFiles.length} files • Workspace files
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#19105B] focus:border-transparent"
                />
                <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2">
                  <svg
                    className="w-3 h-3 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto p-4">
              {filesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loading size="sm" text="" />
                </div>
              ) : filteredFiles.length > 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-2">
                    {filteredFiles.map((file: any, index: number) => (
                      <div
                        key={file.id || index}
                        className="group relative bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-3 hover:shadow-md hover:border-[#8b7bc7] dark:hover:border-[#8b7bc7] transition-all duration-200 cursor-pointer"
                        onClick={() => {
                          if (file.sharepoint_link) {
                            window.open(file.sharepoint_link, "_blank");
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                              {getFileIcon(file.name || "")}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900 dark:text-white truncate text-sm">
                                {file.sharepoint_name || file.name || `File ${index + 1}`}
                              </h4>
                              {'id' in workspace && file.id && (
                                <FileIndexingBadge workspaceId={(workspace as Workspace).id} fileId={file.id} />
                              )}
                            </div>
                            <div className="space-y-1">
                              {(file.last_modified_by_name || file.last_modified_by_email || file.last_modified_datetime) && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {(file.last_modified_by_name || file.last_modified_by_email) && (
                                    <div>Modified by {file.last_modified_by_name || file.last_modified_by_email}</div>
                                  )}
                                  {file.last_modified_datetime && (
                                    <div>
                                      {new Date(file.last_modified_datetime).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </div>
                                  )}
                                </div>
                              )}
                              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                {file.size && (
                                  <span className="flex items-center gap-1">
                                    <svg
                                      className="w-3 h-3"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                      />
                                    </svg>
                                    {formatFileSize(file.size)}
                                  </span>
                                )}
                                {!file.last_modified_by_name && !file.last_modified_by_email && !file.last_modified_datetime && file.lastModified && (
                                  <span className="flex items-center gap-1">
                                    <svg
                                      className="w-3 h-3"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    {new Date(
                                      file.lastModified
                                    ).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center mb-3 border border-gray-200 dark:border-gray-700">
                    <Files className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
                    {searchQuery ? "No files found" : "No files yet"}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-4 text-sm">
                    {searchQuery
                      ? `No files match "${searchQuery}". Try a different search term.`
                      : "This workspace doesn't have any files. Upload some files to get started."}
                  </p>
                  {!searchQuery && workspace.name !== "JLens" && (
                    <button className="px-4 py-2 bg-[#19105B] text-white rounded-md hover:bg-[#2a1a6b] transition-colors font-normal flex items-center gap-2 text-sm">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      Upload Files
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
}