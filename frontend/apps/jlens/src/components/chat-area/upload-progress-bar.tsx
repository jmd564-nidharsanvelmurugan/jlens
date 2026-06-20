import { useEffect, useState } from "react"
import { X, Upload, CheckCircle2, FileText, Search, AlertCircle } from "lucide-react"

export interface FileUploadStatus {
  filename: string
  stage: "uploading" | "indexing" | "done" | "error"
  error?: string
}

interface UploadProgressBarProps {
  isUploading: boolean
  progress: number
  fileName?: string
  onCancel?: () => void
  fileStatuses?: FileUploadStatus[]
}

export function UploadProgressBar({ isUploading, progress, fileName, onCancel, fileStatuses }: UploadProgressBarProps) {
  const [isVisible, setIsVisible] = useState(false)
  const safeProgress = Math.round(Math.min(progress, 100))

  const getStage = () => {
    if (safeProgress < 40) return { text: "Uploading file...", icon: Upload }
    if (safeProgress < 80) return { text: "Indexing for search...", icon: Search }
    return { text: "Done — file is searchable", icon: CheckCircle2 }
  }

  const stage = getStage()
  const StageIcon = stage.icon

  useEffect(() => {
    if (isUploading) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => setIsVisible(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isUploading])

  if (!isVisible) return null

  return (
    <div className="absolute top-6 right-6 z-50 w-96">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                <StageIcon className={`w-5 h-5 ${safeProgress >= 80 ? 'text-emerald-600' : 'text-slate-600 dark:text-slate-400'}`} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {isUploading ? stage.text : "Upload Complete"}
                </h3>
                {fileName && <p className="text-xs text-slate-500 dark:text-slate-400">{fileName}</p>}
              </div>
            </div>
            {onCancel && isUploading && (
              <button onClick={onCancel} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md" aria-label="Cancel upload">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
        </div>

        <div className="px-6 py-4">
          {/* Progress bar */}
          <div className="relative w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-primary to-primary2"
              style={{ width: `${isUploading ? safeProgress : 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 mb-3">
            <span>{isUploading ? `${safeProgress}%` : "100%"}</span>
            <span>{stage.text.toLowerCase()}</span>
          </div>

          {/* Per-file statuses */}
          {fileStatuses && fileStatuses.length > 1 && (
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {fileStatuses.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  {f.stage === "done" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />}
                  {f.stage === "indexing" && <Search className="w-3.5 h-3.5 text-blue-500 animate-pulse flex-shrink-0" />}
                  {f.stage === "uploading" && <Upload className="w-3.5 h-3.5 text-slate-400 animate-pulse flex-shrink-0" />}
                  {f.stage === "error" && <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
                  <span className="truncate text-slate-700 dark:text-slate-300">{f.filename}</span>
                  {f.stage === "error" && <span className="text-red-500 truncate ml-auto">{f.error || "failed"}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
