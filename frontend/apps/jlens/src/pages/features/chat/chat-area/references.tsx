import type React from "react"
import { useState, useRef, useEffect } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

interface CitationReference {
  id: string
  citationContent: string
  filepath: string
  url?: string
}

interface CitationAccordionProps {
  messageId: string
  citationMessages: CitationReference[][]
  setCitationContent: React.Dispatch<React.SetStateAction<string>>
  filepathUrlMap?: Record<string, string>
  workspaceName?: string
}

const CitationAccordion = ({
  messageId,
  citationMessages,
  setCitationContent,
  filepathUrlMap = {},
  workspaceName,
}: CitationAccordionProps) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [activeReference, setActiveReference] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(5)

  const [showTooltip, setShowTooltip] = useState(true)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setShowTooltip(false)
      }
    }

    if (showTooltip) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showTooltip])

  const matchingRefs = citationMessages.filter((citations) => citations[0]?.id === messageId).flat()

  const refsByFilepath = matchingRefs.reduce(
    (acc, ref) => {
      if (!acc[ref.filepath]) acc[ref.filepath] = []
      acc[ref.filepath].push(ref.citationContent)
      return acc
    },
    {} as Record<string, string[]>,
  )

  const uniqueFilepaths = Object.keys(refsByFilepath)

  return (
    <div className="w-full max-w-full space-y-3 p-4 sm:p-6 relative">
      {showTooltip && (
        <div
          ref={tooltipRef}
          className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-50 bg-[#41368F] text-white px-3 py-2 rounded-lg shadow-lg text-sm whitespace-nowrap"
        >
          Click here for references
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#41368F]"></div>
        </div>
      )}
      <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center space-x-2">
          <div className="h-1 w-8 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
          <h4 className="text-sm font-semibold text-slate-700 tracking-wide">REFERENCE</h4>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-xs bg-gradient-to-r from-primary/10 to-primary/5 text-primary px-3 py-1.5 rounded-full font-semibold border border-primary/20">
            {uniqueFilepaths.length} sources
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-slate-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-500" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="w-full max-w-full space-y-3">
          {uniqueFilepaths.slice(0, workspaceName === "AISOW" ? visibleCount : uniqueFilepaths.length).map((filepath, index) => {
            const url = filepathUrlMap[filepath]
            const fileName = filepath.split("/").pop() || filepath
            const isActive = activeReference === filepath

            return (
              <div
                key={index}
                className={`group relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer w-full max-w-full ${isActive
                  ? "bg-primary/5 border-primary/40 shadow-md"
                  : "bg-white border-slate-200/60 hover:border-primary/30 hover:shadow-md"
                  }`}
                onClick={() => {
                  setActiveReference(filepath)
                  const url = filepathUrlMap[filepath]
                  const formattedContent = refsByFilepath[filepath]
                    .map((c, i) => `**Reference ${i + 1}** from ${filepath.split('/').pop()}\n\n${url ? `📎 [Open in SharePoint](${url})\n\n` : ''}${c}`)
                    .join("\n\n---\n\n")
                  setCitationContent(formattedContent)

                  // Dispatch event to notify parent that citation was clicked
                  window.dispatchEvent(new CustomEvent('citation-clicked', {
                    detail: { content: formattedContent }
                  }))
                }}
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-secondary transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100"
                    }`}
                ></div>

                <div className="flex items-center justify-between p-4 pl-6">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div
                      className={`flex items-center justify-center w-8 h-8 border rounded-lg text-xs font-bold shadow-sm transition-all duration-300 ${isActive
                        ? "bg-primary/20 border-primary/30 text-primary"
                        : "bg-gradient-to-br from-slate-100 to-slate-50 border-slate-200 text-slate-700 group-hover:from-primary/10 group-hover:to-primary/5 group-hover:border-primary/20 group-hover:text-primary"
                        }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-semibold transition-colors duration-300 truncate mb-1 ${isActive ? "text-primary" : "text-slate-800 group-hover:text-primary"
                          }`}
                      >
                        {fileName}
                      </p>
                      <p
                        className={`text-xs transition-colors duration-300 ${isActive ? "text-slate-600" : "text-slate-500 group-hover:text-slate-600"
                          }`}
                      >
                        {refsByFilepath[filepath].length} reference
                        {refsByFilepath[filepath].length !== 1 ? "s" : ""} • Click to analyze
                      </p>
                    </div>
                  </div>
                  {url && (
                    <div
                      className="relative z-10 p-2.5 bg-primary/10 hover:bg-primary/20 rounded-lg border border-primary/20 hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(url, "_blank", "noopener,noreferrer")
                      }}
                      title="Open in SharePoint"
                    >
                      <img
                        src="/ms-sharepoint.svg"
                        alt="SharePoint"
                        className="w-4 h-4 pointer-events-none"
                        style={{ filter: "hue-rotate(25deg) saturate(1.3) brightness(0.85)" }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {workspaceName === "AISOW" && uniqueFilepaths.length > 5 && (
            <div className="flex items-center gap-2 pt-1">
              {visibleCount < uniqueFilepaths.length && (
                <button
                  onClick={() => setVisibleCount(v => v + 5)}
                  className="text-xs text-primary font-medium hover:underline"
                >
                  Load more ({uniqueFilepaths.length - visibleCount} remaining)
                </button>
              )}
              {visibleCount > 5 && (
                <button
                  onClick={() => setVisibleCount(5)}
                  className="text-xs text-slate-500 hover:underline"
                >
                  Show less
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CitationAccordion
