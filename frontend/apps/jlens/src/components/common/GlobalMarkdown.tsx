import React, { useState } from "react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkSuperSub from "remark-supersub";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "sonner";

interface GlobalMarkdownProps {
  content: string;
  className?: string;
}

export function GlobalMarkdown({ content, className = "" }: GlobalMarkdownProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = async (code: string, codeId: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(codeId);
      toast.success("Code copied to clipboard");
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      toast.error("Failed to copy code");
    }
  };

  // Fix non-standard markdown from LLM output
  const cleanContent = content
    // Step 1: Separators
    .replace(/•\s*--\s*/g, '\n---\n')
    // Step 2: Convert bullets to dashes
    .replace(/•/g, '-')
    // Step 3: Fix "- Text:*" → "- **Text:**"
    .replace(/-\s+([^*\n:]+):\*/g, '- **$1:**')
    // Step 4: Fix "- Text*" → "- **Text**"
    .replace(/-\s+([^*\n]{2,30})\*\s/g, '- **$1** ')
    // Step 5: Fix "Text:*" at line start → "\n**Text:**"
    .replace(/^([A-Z][^*\n:]{1,40}):\*/gm, '\n**$1:**')
    // Step 6: Fix "*Text **" → "**Text**"
    .replace(/\*([^*\n]+)\s\*\*/g, '**$1**')
    // Step 7: Clean stray single asterisks next to bold
    .replace(/\*\*([^*]+)\*\*\*/g, '**$1**')
    // Step 8: Clean up triple newlines
    .replace(/\n\s*\n\s*\n/g, '\n\n');

  return (
    <div className={className}>
      <Markdown
        remarkPlugins={[remarkGfm, remarkSuperSub]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // Professional code blocks
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "";
            const code = String(children).replace(/\n$/, "");

            return !inline && match ? (
              <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">{language}</span>
                  <button
                    onClick={() => handleCopyCode(code, `${language}-${Date.now()}`)}
                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    {copiedCode === `${language}-${Date.now()}` ? "Copied!" : "Copy"}
                  </button>
                </div>
                <SyntaxHighlighter
                  style={oneLight}
                  language={language}
                  PreTag="div"
                  className="!bg-white !m-0"
                  customStyle={{
                    padding: '16px',
                    margin: 0,
                    backgroundColor: '#ffffff',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                  }}
                  {...props}
                >
                  {code}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800" {...props}>
                {children}
              </code>
            );
          },

          // Enhanced tables
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-gray-50" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="bg-white divide-y divide-gray-200" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-gray-50 transition-colors" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-3 text-sm border-b border-gray-100" {...props} />
          ),

          // Enhanced lists
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-outside space-y-1 my-3 ml-6 pl-2" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-outside space-y-1 my-3 ml-6 pl-2" {...props} />
          ),

          // Enhanced blockquotes
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-blue-200 pl-4 py-2 my-4 bg-blue-50 italic" {...props} />
          ),

          // Enhanced headings
          h1: ({ node, ...props }) => (
            <h1 className="text-2xl font-bold mt-6 mb-4 border-b border-gray-200 pb-2 text-primary" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl font-semibold mt-5 mb-3 text-primary" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg font-medium mt-4 mb-2 text-primary" {...props} />
          ),

          // Enhanced links
          a: ({ node, ...props }) => (
            <a
              className="text-blue-600 hover:text-blue-800 underline decoration-blue-300 hover:decoration-blue-500 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),

          // Enhanced images
          img: ({ node, ...props }) => (
            <img
              className="rounded-lg my-4 max-w-full h-auto shadow-sm border border-gray-200"
              loading="lazy"
              {...props}
            />
          ),

          // Custom div handling for file cards and other elements
          div: ({ node, className, children, ...props }: any) => {
            // Check if this contains file-related content or has specific styling
            if (className && (className.includes('file') || className.includes('card') || className.includes('bg-primary'))) {
              // Check if children already contains an SVG icon
              const hasIcon = React.Children.toArray(children).some((child: any) => 
                child?.type === 'svg' || 
                (child?.props && typeof child.props === 'object' && child.props.children)
              );
              
              // Truncate long filenames in children
              const truncateFilename = (text: string) => {
                if (text && text.length > 20) {
                  return text.substring(0, 20) + '...';
                }
                return text;
              };

              const processChildren = (children: any): any => {
                return React.Children.map(children, (child) => {
                  if (typeof child === 'string') {
                    return truncateFilename(child);
                  }
                  if (React.isValidElement(child) && child.props.children) {
                    return React.cloneElement(child, {
                      ...child.props,
                      children: processChildren(child.props.children)
                    });
                  }
                  return child;
                });
              };
              
              return (
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-white/30 to-white/10 border-l-4 border-white rounded-r-lg px-4 py-3 my-2 text-white shadow-lg" {...props}>
                  {!hasIcon && (
                    <svg className="w-5 h-5 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                  )}
                  <div className="flex items-center gap-2 flex-1 min-w-0 [&_svg]:text-white">
                    {processChildren(children)}
                  </div>
                </div>
              );
            }
            // For any div with dark background, make it visible on primary background
            if (className && (className.includes('bg-gray') || className.includes('bg-slate'))) {
              return (
                <div className={`${className} bg-white/10 border-white/20 text-white`} {...props}>
                  {children}
                </div>
              );
            }
            return <div className={className} {...props}>{children}</div>;
          },

          // Paragraphs
          p: ({ node, ...props }) => (
            <p className="my-2 leading-relaxed" {...props} />
          ),

          // Horizontal rules with light gray color
          hr: ({ node, ...props }) => (
            <hr className="my-4 border-0 h-px bg-gray-300" {...props} />
          ),
        }}
      >
        {cleanContent}
      </Markdown>
    </div>
  );
}
