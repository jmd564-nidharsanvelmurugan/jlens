import React from "react";
import { parseCitations } from "../hooks/useProposalNavigation";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface CitationMessage {
  id:      string;
  content: string;
}

interface CitationListProps {
  /** Array of tool messages that may contain citation JSON */
  citations: CitationMessage[];
}

// ─── Sub-components ────────────────────────────────────────────────────────────

/**
 * Renders a structured list of parsed citation links with numbered anchors.
 *
 * @param items - Array of citation objects containing url and filepath fields
 */
const ParsedCitations = ({ items }: { items: any[] }) => (
  <div>
    <div className="text-xs font-medium text-[#19105B] mb-2 flex items-center gap-1">
      <span>📎</span>
      <span>Sources & References</span>
    </div>

    <div className="space-y-1">
      {items.map((cite: any, idx: number) => (
        <div key={idx} className="flex items-start gap-2">
          <span className="text-xs text-gray-500 mt-0.5">{idx + 1}.</span>
          <a
            href={cite.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 underline flex-1 break-all"
          >
            {cite.filepath}
          </a>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Fallback renderer used when the citation JSON cannot be parsed into
 * a structured list — displays the raw content as monospace text.
 *
 * @param content - Raw citation string from the tool message
 */
const RawCitation = ({ content }: { content: string }) => (
  <div className="text-xs text-gray-600 font-mono">
    Citations: {content}
  </div>
);

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * CitationList iterates over tool messages and renders each as either a
 * structured source list (when valid JSON with a citations array is found)
 * or a raw text fallback.
 */
const CitationList = ({ citations }: CitationListProps) => (
  <>
    {citations.map((citation) => {
      const parsedItems = parseCitations(citation.content);

      return (
        <div
          key={citation.id}
          className="p-3 bg-[#19105B]/5 border border-[#19105B]/20 rounded"
        >
          {parsedItems.length > 0
            ? <ParsedCitations items={parsedItems} />
            : <RawCitation content={citation.content} />
          }
        </div>
      );
    })}
  </>
);

export default CitationList;