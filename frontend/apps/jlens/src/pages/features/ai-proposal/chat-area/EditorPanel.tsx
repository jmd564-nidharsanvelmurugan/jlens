import { useEffect, useRef }          from "react";
import { useEditor, EditorContent }   from "@tiptap/react";
import StarterKit                     from "@tiptap/starter-kit";
import { Markdown }                   from "@tiptap/markdown";
import { TableKit }                   from "@tiptap/extension-table";
import { useUpdateProposal }          from "@query/ai-proposal/hooks";
import BubbleTextReplace              from "../components/BubbleMenu";
import FormatMenuBar                  from "../components/FormatMenuBar";

// ─── Constants ─────────────────────────────────────────────────────────────────

/** Debounce delay (ms) before persisting editor content to the backend */
const AUTOSAVE_DELAY_MS = 2000;

// ─── Types ─────────────────────────────────────────────────────────────────────

interface EditorPanelProps {
  /** Markdown string to load into the editor */
  content: string;

  /** ID of the active conversation — passed to the update mutation */
  convId: string;

  /** ID of the proposal message being edited */
  msgId: string;
}

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * EditorPanel renders a rich-text Tiptap editor pre-loaded with a markdown proposal.
 * Changes are debounced and auto-saved to the backend after AUTOSAVE_DELAY_MS of inactivity.
 * Supports markdown, tables, bubble-menu text replacement, and a format toolbar.
 */
const EditorPanel = ({ content, convId, msgId }: EditorPanelProps) => {
  const { mutate: updateProposal } = useUpdateProposal();

  /** Holds the debounce timer reference so it can be cleared on each keystroke */
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Editor setup ────────────────────────────────────────────────────────────

  const editor = useEditor({
    extensions: [StarterKit, Markdown, TableKit],
    editable:   true,
    content:    "",

    /**
     * Fires on every content change.
     * Clears any pending save timer and starts a fresh debounce window.
     * Persists the latest markdown once the user pauses typing.
     */
    onUpdate: ({ editor }) => {
      const markdown = editor.getMarkdown();

      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        updateProposal({
          conversationId: convId,
          msgId,
          content: markdown.toString(),
        });
      }, AUTOSAVE_DELAY_MS);
    },
  });

  // ── Sync content prop → editor ───────────────────────────────────────────────

  /**
   * Replaces editor content whenever the `content` prop changes
   * (e.g. when a new proposal message is loaded or a follow-up updates it).
   */
  useEffect(() => {
    if (!editor) return;
    editor.commands.setContent(content, { contentType: "markdown" });
  }, [content, editor]);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Floating bubble menu for inline text replacement actions */}
      <BubbleTextReplace editor={editor} msgId={msgId} />

      {/* Sticky toolbar for block-level formatting (bold, headings, lists…) */}
      <FormatMenuBar editor={editor} />

      {/* Main editable content area */}
      <EditorContent editor={editor} className="flex-1 min-h-0 overflow-y-auto" />
    </>
  );
};

export default EditorPanel;