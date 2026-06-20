import type React from "react"
import { useEffect, useRef, useState } from "react"
import { ExternalLink, FileText, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@ui/components/ui/button"
import { GlobalMarkdown } from "../../../../components/common/GlobalMarkdown"

interface CitationSidebarProps {
  content: string
  onClose?: () => void
  className?: string
}

const CitationSidebar: React.FC<CitationSidebarProps> = ({ content, onClose, className }) => {
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [expandedChunks, setExpandedChunks] = useState<Set<number>>(new Set()) // All collapsed by default
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose?.()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  // Smooth transition when content changes
  useEffect(() => {
    setIsTransitioning(true)
    setExpandedChunks(new Set())
    const timer = setTimeout(() => setIsTransitioning(false), 150)
    return () => clearTimeout(timer)
  }, [content])

  const toggleChunk = (index: number) => {
    setExpandedChunks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }
  // Parse content to extract references and SharePoint links
  const parseContent = (content: string) => {
    const sections = content.split('---').filter(section => section.trim())
    return sections.map((section, index) => {
      const lines = section.trim().split('\n')
      const titleLine = lines[0]
      const sharepointLine = lines.find(line => line.includes('sharepoint'))
      const contentLines = lines.filter(line => 
        !line.startsWith('**Reference') && 
        !line.includes('sharepoint') &&
        line.trim() !== ''
      )
      
      const title = titleLine?.replace(/\*\*/g, '') || `Reference ${index + 1}`
      const filename = title.split(' from ')[1] || 'Document'
      const sharepointUrl = sharepointLine?.match(/\((https:\/\/[^)]+)\)/)?.[1]
      const content = contentLines.join('\n').trim()
      
      return { title, filename, sharepointUrl, content, index }
    })
  }

  const references = parseContent(content)

  return (
    <div ref={sidebarRef} className={`fixed right-0 top-0 h-screen w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col z-50 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Citations</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{references.length} reference{references.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-y-auto transition-opacity duration-150 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
        {references.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No citations available</p>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-6">
            {references.map((ref, index) => {
              const isExpanded = expandedChunks.has(index)
              
              return (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                {/* Reference Header - Always visible, clickable */}
                <div 
                  className="p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => toggleChunk(index)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-7 h-7 bg-primary text-white text-sm font-bold rounded-full flex-shrink-0">
                          {index + 1}
                        </div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {ref.filename}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* SharePoint Link */}
                      {ref.sharepointUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(ref.sharepointUrl, '_blank', 'noopener,noreferrer')
                          }}
                          className="flex items-center text-xs hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 dark:hover:bg-orange-900/20 p-2"
                          title="Open in SharePoint"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                      
                      {/* Expand/Collapse Icon */}
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Reference Content - Collapsible */}
                {isExpanded && (
                <div className="p-4">
                  <GlobalMarkdown 
                    content={ref.content}
                    className="prose prose-sm max-w-none text-sm"
                  />
                </div>
                )}
              </div>
            )})}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            <span>Citations from document analysis</span>
          </div>
          <span>{references.length} source{references.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  )
}

export default CitationSidebar
