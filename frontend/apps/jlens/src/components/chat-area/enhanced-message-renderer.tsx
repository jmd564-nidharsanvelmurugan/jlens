import Markdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import DOMPurify from 'dompurify';

interface EnhancedMessageRendererProps {
  content: string;
  isUser: boolean;
}

export function EnhancedMessageRenderer({ content, isUser }: EnhancedMessageRendererProps) {
  // Sanitize content to prevent XSS attacks
  const sanitizedContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'code', 'pre', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|ftp):\/\/|mailto:|tel:|#)/i
  });

  // Remove emojis from content
  const cleanContent = sanitizedContent.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');

  // Validate URLs before opening
  const isValidUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      const allowedDomains = [
        'sharepoint.com',
        'jmangroup.tech',
        'blob.core.windows.net',
        'github.com',
        'stackoverflow.com',
        'microsoft.com'
      ];
      return allowedDomains.some(domain => parsed.hostname.endsWith(domain)) || 
             parsed.protocol === 'mailto:' || 
             parsed.protocol === 'tel:';
    } catch {
      return false;
    }
  };

  // Parse chart data from markdown code blocks with validation
  const renderChart = (code: string, language: string) => {
    if (language === "chart" || language === "json-chart") {
      try {
        const data = JSON.parse(code);
        // Validate chart data structure
        if (data && typeof data === 'object' && data.type && Array.isArray(data.data)) {
          return <ChartRenderer data={data} />;
        }
      } catch {
        // Invalid JSON, render as code block
      }
    }
    return null;
  };

  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSanitize]}
      components={{
        // Enhanced table styling
        table: ({ node, ...props }) => (
          <div className="overflow-x-auto my-4">
            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700 border border-gray-300 dark:border-gray-700 rounded-lg" {...props} />
          </div>
        ),
        thead: ({ node, ...props }) => (
          <thead className="bg-gray-100 dark:bg-gray-800" {...props} />
        ),
        th: ({ node, ...props }) => (
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider" {...props} />
        ),
        tbody: ({ node, ...props }) => (
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800" {...props} />
        ),
        tr: ({ node, ...props }) => (
          <tr className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" {...props} />
        ),
        td: ({ node, ...props }) => (
          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300" {...props} />
        ),
        
        // Code blocks with professional light styling
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || "");
          const language = match ? match[1] : "";
          const code = String(children).replace(/\n$/, "");

          // Check for chart data
          const chartComponent = renderChart(code, language);
          if (chartComponent) return chartComponent;

          return !inline && match ? (
            <div className="my-4 rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <span className="text-xs font-medium text-gray-600 uppercase">{language}</span>
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
                  lineHeight: '1.5'
                }}
                {...props}
              >
                {code}
              </SyntaxHighlighter>
            </div>
          ) : (
            <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
              {children}
            </code>
          );
        },

        // Enhanced images
        img: ({ node, ...props }) => (
          <img
            className="rounded-lg my-4 max-w-full h-auto shadow-lg"
            loading="lazy"
            {...props}
          />
        ),

        // Enhanced links with URL validation
        a: ({ node, href, ...props }) => {
          const url = href || '';
          if (!isValidUrl(url)) {
            return <span className="text-gray-500 cursor-not-allowed" {...props} />;
          }
          return (
            <a
              className="text-blue-600 dark:text-blue-400 hover:underline"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (!isValidUrl(url)) {
                  e.preventDefault();
                  console.warn('Blocked potentially unsafe URL:', url);
                }
              }}
              {...props}
            />
          );
        },

        // Enhanced lists
        ul: ({ node, ...props }) => (
          <ul className="list-disc list-inside space-y-1 my-2" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="list-decimal list-inside space-y-1 my-2" {...props} />
        ),

        // Blockquotes
        blockquote: ({ node, ...props }) => (
          <blockquote className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 italic my-4 text-gray-700 dark:text-gray-400" {...props} />
        ),
      }}
    >
      {cleanContent}
    </Markdown>
  );
}

// Simple chart renderer for basic charts
function ChartRenderer({ data }: { data: any }) {
  if (data.type === "bar" && data.data) {
    return (
      <div className="my-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">{data.title || "Chart"}</h4>
        <div className="space-y-2">
          {data.data.map((item: any, i: number) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-24 truncate">
                {item.label}
              </span>
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#19105B] to-[#8b7bc7] h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                  style={{ width: `${(item.value / Math.max(...data.data.map((d: any) => d.value))) * 100}%` }}
                >
                  <span className="text-xs font-semibold text-white">{item.value}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.type === "line" && data.data) {
    return (
      <div className="my-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">{data.title || "Chart"}</h4>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Line chart data: {JSON.stringify(data.data)}
        </div>
      </div>
    );
  }

  return (
    <div className="my-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <pre className="text-xs overflow-auto">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
