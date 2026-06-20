" "

import type React from "react"
import { useState } from "react"
import Markdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"
import remarkSuperSub from "remark-supersub"
import { X, ChevronDown, ChevronUp } from "lucide-react"

interface CitationSidebarProps {
  content: string
  onClose?: () => void
  className?: string
}

const CitationSidebar: React.FC<CitationSidebarProps> = ({ content, onClose, className }) => {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())

  let sharedUrl = ""
  const firstRefBlock = content
    .split(/\*\*Reference \d+\*\*/g)
    .map((r) => r.trim())
    .filter((r) => r.length > 0)[0]

  if (firstRefBlock) {
    const [urlPart] = firstRefBlock.split("\n\n")
    if (urlPart.startsWith("|http")) {
      sharedUrl = urlPart.slice(1).trim()
    }
  }

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedItems(newExpanded)
  }

  return (
    <div
      className={`fixed right-0 top-0 h-full w-80 bg-white border-l border-slate-200/60 shadow-lg z-50 transition-transform ${className}`}
    >
      <div className="bg-slate-50/80 p-4 border-b border-slate-200/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-base font-semibold" style={{ color: "#19105B" }}>
              Citations
            </h2>
            {sharedUrl && (
              <button
                onClick={() => window.open(sharedUrl, "_blank", "noopener,noreferrer")}
                className="p-2.5 bg-gradient-to-br from-orange-50 to-orange-100/50 hover:from-orange-100 hover:to-orange-200/60 rounded-lg border border-orange-200/60 hover:border-orange-300 transition-all duration-300 shadow-sm hover:shadow-md"
                title="Open in SharePoint"
              >
                <img
                  src="/ms-sharepoint.svg"
                  alt="SharePoint"
                  className="w-4 h-4"
                  style={{ filter: "hue-rotate(25deg) saturate(1.3) brightness(0.85)" }}
                />
              </button>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="h-7 w-7 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors duration-200 rounded flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-y-auto max-h-[calc(100%-5rem)] p-4">
        <div className="space-y-3">
          {content
            .split(/\*\*Reference \d+\*\*/g)
            .map((ref) => ref.trim())
            .filter((ref) => ref.length > 0)
            .map((ref, idx) => {
              const [_, ...contentParts] = ref.split("\n\n")
              // const url = urlPart.startsWith("|http") ? urlPart.slice(1).trim() : ""
              const textContent = contentParts.join("\n\n")
              const isExpanded = expandedItems.has(idx)
              
              return (
                <div
                  key={idx}
                  className="bg-white border border-slate-200/50 rounded-lg hover:shadow-sm transition-all duration-200 hover:border-slate-300/60"
                >
                  <div
                    className="flex items-center justify-between p-3 cursor-pointer"
                    onClick={() => toggleExpanded(idx)}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-6 h-6 text-white rounded-full flex items-center justify-center text-xs font-medium"
                        style={{ backgroundColor: "#19105B" }}
                      >
                        {idx + 1}
                      </div>
                      <span className="text-sm font-medium text-slate-700">Reference</span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </div>

                  {isExpanded && (
                    <div className="px-3 pb-3 border-t border-slate-100">
                      <div className="text-sm text-slate-700 leading-relaxed pt-3">
                        <Markdown
                          remarkPlugins={[remarkGfm, remarkSuperSub]}
                          rehypePlugins={[rehypeRaw]}
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            strong: ({ children }) => (
                              <span className="font-semibold text-slate-900 bg-yellow-100/60 px-1 py-0.5 rounded text-sm">
                                {children}
                              </span>
                            ),
                            em: ({ children }) => (
                              <em className="font-medium" style={{ color: "#19105B" }}>
                                {children}
                              </em>
                            ),
                          }}
                        >
                          {textContent}
                        </Markdown>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}

export default CitationSidebar
