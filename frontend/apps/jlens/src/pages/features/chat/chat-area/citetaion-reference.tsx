" "

import type React from "react"
import { useState } from "react"
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
}

const CitationAccordion = ({
  messageId,
  citationMessages,
  setCitationContent,
  filepathUrlMap = {},
}: CitationAccordionProps) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [activeReference, setActiveReference] = useState<string | null>(null)

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
    <div className="space-y-3 p-5 max-w-[85%] sm:max-w-[80%]">
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
        <>
          {uniqueFilepaths.map((filepath, index) => {
            const url = filepathUrlMap[filepath]
            const fileName = filepath.split("/").pop() || filepath
            const isActive = activeReference === filepath

            return (
              <div
                key={index}
                className={`group relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "bg-primary/5 border-primary/40 shadow-md"
                    : "bg-white border-slate-200/60 hover:border-primary/30 hover:shadow-md"
                }`}
                onClick={() => {
                  setActiveReference(filepath)
                  const formattedContent = refsByFilepath[filepath]
                    .map((c, i) => `**Reference ${i + 1}**|${filepathUrlMap[filepath]}\n\n${c}`)
                    .join("\n\n")
                  setCitationContent(formattedContent)
                }}
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-secondary transition-opacity duration-300 ${
                    isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100"
                  }`}
                ></div>

                <div className="flex items-center justify-between p-3 pl-5">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div
                      className={`flex items-center justify-center w-8 h-8 border rounded-lg text-xs font-bold shadow-sm transition-all duration-300 ${
                        isActive
                          ? "bg-primary/20 border-primary/30 text-primary"
                          : "bg-gradient-to-br from-slate-100 to-slate-50 border-slate-200 text-slate-700 group-hover:from-primary/10 group-hover:to-primary/5 group-hover:border-primary/20 group-hover:text-primary"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-semibold transition-colors duration-300 truncate mb-1 ${
                          isActive ? "text-primary" : "text-slate-800 group-hover:text-primary"
                        }`}
                      >
                        {fileName}
                      </p>
                      <p
                        className={`text-xs transition-colors duration-300 ${
                          isActive ? "text-slate-600" : "text-slate-500 group-hover:text-slate-600"
                        }`}
                      >
                        {refsByFilepath[filepath].length} reference
                        {refsByFilepath[filepath].length !== 1 ? "s" : ""} • Click to analyze
                      </p>
                    </div>
                  </div>
                  {url && (
                    <div
                      className="p-2.5 bg-gradient-to-br from-orange-50 to-orange-100/50 hover:from-orange-100 hover:to-orange-200/60 rounded-lg border border-orange-200/60 hover:border-orange-300 transition-all duration-300 shadow-sm hover:shadow-md"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(url, "_blank", "noopener,noreferrer")
                      }}
                      title="Open in SharePoint"
                    >
                      <img
                        src="/ms-sharepoint.svg"
                        alt="SharePoint"
                        className="w-4 h-4"
                        style={{ filter: "hue-rotate(25deg) saturate(1.3) brightness(0.85)" }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}

export default CitationAccordion
